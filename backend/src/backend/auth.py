from enum import StrEnum
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from supabase import Client, create_client
from supabase_auth.errors import AuthApiError

from backend.config import Settings, get_settings


class AccountRole(StrEnum):
    BUSINESS = "business"
    CUSTOMER = "customer"


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    display_name: str = Field(min_length=1, max_length=120)


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=1)


class AuthResponse(BaseModel):
    access_token: str | None = None
    refresh_token: str | None = None
    expires_at: int | None = None
    user_id: str
    role: AccountRole
    email: EmailStr | None = None
    email_confirmed: bool


class CurrentUser(BaseModel):
    user_id: str
    email: EmailStr | None = None
    role: AccountRole
    user_metadata: dict[str, object] = Field(default_factory=dict)


def _client(settings: Settings) -> Client:
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase authentication is not configured",
        )
    return create_client(settings.supabase_url, settings.supabase_anon_key)


def _auth_error(error: AuthApiError) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=error.message,
        headers={"WWW-Authenticate": "Bearer"},
    )


def _user_role(user: object) -> AccountRole:
    metadata = getattr(user, "user_metadata", {}) or {}
    role = metadata.get("role")
    try:
        return AccountRole(role)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The Supabase user has no valid AMSquare account role",
        ) from exc


def _response(auth_response: object, role: AccountRole) -> AuthResponse:
    user = getattr(auth_response, "user", None)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Supabase did not return a user",
        )
    session = getattr(auth_response, "session", None)
    return AuthResponse(
        access_token=getattr(session, "access_token", None),
        refresh_token=getattr(session, "refresh_token", None),
        expires_at=getattr(session, "expires_at", None),
        user_id=user.id,
        role=role,
        email=user.email,
        email_confirmed=getattr(user, "email_confirmed_at", None) is not None,
    )


def signup(request: SignUpRequest, role: AccountRole, settings: Settings) -> AuthResponse:
    try:
        response = _client(settings).auth.sign_up(
            {
                "email": request.email,
                "password": request.password,
                "options": {
                    "data": {
                        "role": role.value,
                        "display_name": request.display_name,
                    }
                },
            }
        )
    except AuthApiError as error:
        raise _auth_error(error) from error
    return _response(response, role)


def signin(request: SignInRequest, role: AccountRole, settings: Settings) -> AuthResponse:
    try:
        response = _client(settings).auth.sign_in_with_password(
            {"email": request.email, "password": request.password}
        )
    except AuthApiError as error:
        raise _auth_error(error) from error
    actual_role = _user_role(response.user)
    if actual_role != role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This account is registered as a {actual_role.value} account",
        )
    return _response(response, role)


def refresh(request: RefreshRequest, settings: Settings) -> AuthResponse:
    try:
        response = _client(settings).auth.refresh_session(request.refresh_token)
    except AuthApiError as error:
        raise _auth_error(error) from error
    if response.user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token did not produce an authenticated user",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _response(response, _user_role(response.user))


def current_user(
    authorization: Annotated[str | None, Header()] = None,
    settings: Settings = Depends(get_settings),
) -> CurrentUser:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="A Bearer access token is required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = authorization.removeprefix("Bearer ").strip()
    try:
        user_response = _client(settings).auth.get_user(token)
    except AuthApiError as error:
        raise _auth_error(error) from error
    if user_response is None or user_response.user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = user_response.user
    return CurrentUser(
        user_id=user.id,
        email=user.email,
        role=_user_role(user),
        user_metadata=getattr(user, "user_metadata", {}) or {},
    )


def require_role(role: AccountRole):
    def dependency(user: CurrentUser = Depends(current_user)) -> CurrentUser:
        if user.role != role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This endpoint requires a {role.value} account",
            )
        return user

    return dependency
