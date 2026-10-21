from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, Header, HTTPException, Response, status
from fastapi.responses import JSONResponse
from supabase_auth.errors import AuthApiError, AuthError, AuthRetryableError

from armsquare.core.config import Settings, get_settings
from supabase import create_async_client

from .schemas import AuthActionResponse, AuthUserResponse, SignInRequest, SignUpRequest
from .service import (
    AuthIdentity,
    AuthProfileMissing,
    AuthProfileUnavailable,
    AuthProviderUnavailable,
    AuthService,
)

router = APIRouter(prefix="/v1/auth", tags=["authentication"])
ACCESS_COOKIE = "armsquare_access_token"
REFRESH_COOKIE = "armsquare_refresh_token"
REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30


async def get_auth_service(
    settings: Annotated[Settings, Depends(get_settings)],
) -> AsyncIterator[AuthService]:
    supabase_url = str(settings.supabase_url) if settings.supabase_url else ""
    supabase_key = settings.supabase_anon_key.get_secret_value()
    if not supabase_url or not supabase_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The authentication provider is not configured.",
        )

    client = await create_async_client(supabase_url, supabase_key)
    try:
        yield AuthService(client)
    finally:
        await client.auth.close()
        await client.postgrest.aclose()
        await client.realtime.close()


def require_trusted_origin(
    settings: Annotated[Settings, Depends(get_settings)],
    origin: Annotated[str | None, Header()] = None,
) -> None:
    if origin is None or origin not in settings.cors_origins:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This request origin is not allowed.",
        )


def set_session_cookies(
    response: Response,
    identity: AuthIdentity,
    settings: Settings,
) -> None:
    if not identity.access_token or not identity.refresh_token or not identity.expires_in:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The authentication service did not return a complete session.",
        )
    cookie_options = {
        "httponly": True,
        "secure": settings.auth_cookie_secure,
        "samesite": settings.auth_cookie_same_site,
        "path": "/",
        "domain": settings.auth_cookie_domain,
    }
    response.set_cookie(
        ACCESS_COOKIE,
        identity.access_token,
        max_age=identity.expires_in,
        **cookie_options,
    )
    response.set_cookie(
        REFRESH_COOKIE,
        identity.refresh_token,
        max_age=REFRESH_COOKIE_MAX_AGE,
        **cookie_options,
    )


def clear_session_cookies(response: Response, settings: Settings) -> None:
    cookie_options = {
        "httponly": True,
        "secure": settings.auth_cookie_secure,
        "samesite": settings.auth_cookie_same_site,
        "path": "/",
        "domain": settings.auth_cookie_domain,
    }
    response.delete_cookie(ACCESS_COOKIE, **cookie_options)
    response.delete_cookie(REFRESH_COOKIE, **cookie_options)


def public_user(identity: AuthIdentity) -> AuthUserResponse:
    return AuthUserResponse(
        user_id=identity.user_id,
        email=identity.email,
        role=identity.role,
    )


def handle_auth_error(error: AuthError, *, signing_in: bool = False) -> HTTPException:
    if isinstance(error, AuthRetryableError):
        return HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is temporarily unavailable. Try again shortly.",
        )
    if isinstance(error, AuthApiError) and error.status == status.HTTP_429_TOO_MANY_REQUESTS:
        return HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many authentication attempts. Try again later.",
        )
    if signing_in:
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unable to create or update this account. Check the details or try signing in.",
    )


@router.post(
    "/signup",
    response_model=AuthActionResponse,
    dependencies=[Depends(require_trusted_origin)],
)
async def sign_up(
    request: SignUpRequest,
    response: Response,
    settings: Annotated[Settings, Depends(get_settings)],
    auth: Annotated[AuthService, Depends(get_auth_service)],
) -> AuthActionResponse:
    try:
        identity = await auth.sign_up(request)
    except AuthRetryableError as exc:
        raise handle_auth_error(exc) from exc
    except AuthApiError as exc:
        raise handle_auth_error(exc) from exc
    except AuthProviderUnavailable as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The authentication service is temporarily unavailable. Check your connection and try again.",
        ) from exc
    except AuthError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The authentication provider could not complete sign-up.",
        ) from exc
    except AuthProfileUnavailable as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Sign-up could not start a session. Check that email confirmation is disabled in the authentication settings.",
        ) from exc

    set_session_cookies(response, identity, settings)
    return AuthActionResponse(
        **public_user(identity).model_dump(),
        authenticated=True,
    )


@router.post(
    "/signin",
    response_model=AuthActionResponse,
    dependencies=[Depends(require_trusted_origin)],
)
async def sign_in(
    request: SignInRequest,
    response: Response,
    settings: Annotated[Settings, Depends(get_settings)],
    auth: Annotated[AuthService, Depends(get_auth_service)],
) -> AuthActionResponse:
    try:
        identity = await auth.sign_in(str(request.email), request.password, request.role)
    except AuthRetryableError as exc:
        raise handle_auth_error(exc, signing_in=True) from exc
    except AuthApiError as exc:
        raise handle_auth_error(exc, signing_in=True) from exc
    except AuthProviderUnavailable as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The authentication service is temporarily unavailable. Check your connection and try again.",
        ) from exc
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except AuthProfileUnavailable as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The account profile is unavailable. Try again later.",
        ) from exc
    except AuthProfileMissing as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is not ready to sign in.",
        ) from exc
    except AuthError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is temporarily unavailable.",
        ) from exc

    set_session_cookies(response, identity, settings)
    return AuthActionResponse(
        **public_user(identity).model_dump(),
        authenticated=True,
    )


@router.get("/me", response_model=AuthUserResponse)
async def current_user(
    auth: Annotated[AuthService, Depends(get_auth_service)],
    access_token: Annotated[str | None, Cookie(alias=ACCESS_COOKIE)] = None,
) -> AuthUserResponse:
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sign in to continue.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        identity = await auth.get_current_user(access_token)
    except AuthApiError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session is invalid or expired.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    except AuthProfileMissing as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session is invalid or your account is unavailable.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    except (AuthError, AuthProfileUnavailable, AuthProviderUnavailable) as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Your account could not be verified. Try again shortly.",
        ) from exc
    return public_user(identity)


@router.post(
    "/refresh",
    response_model=None,
    dependencies=[Depends(require_trusted_origin)],
)
async def refresh_session(
    response: Response,
    settings: Annotated[Settings, Depends(get_settings)],
    auth: Annotated[AuthService, Depends(get_auth_service)],
    refresh_token: Annotated[str | None, Cookie(alias=REFRESH_COOKIE)] = None,
) -> AuthActionResponse | JSONResponse:
    if not refresh_token:
        expired_response = JSONResponse(
            {"detail": "Your session has expired. Sign in again."},
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
        clear_session_cookies(expired_response, settings)
        return expired_response
    try:
        identity = await auth.refresh(refresh_token)
    except AuthRetryableError as exc:
        raise handle_auth_error(exc, signing_in=True) from exc
    except AuthApiError:
        expired_response = JSONResponse(
            {"detail": "Your session has expired. Sign in again."},
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
        clear_session_cookies(expired_response, settings)
        return expired_response
    except AuthProfileMissing:
        expired_response = JSONResponse(
            {"detail": "Your session has expired. Sign in again."},
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
        clear_session_cookies(expired_response, settings)
        return expired_response
    except (AuthError, AuthProfileUnavailable, AuthProviderUnavailable) as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Your session could not be refreshed. Try again shortly.",
        ) from exc

    set_session_cookies(response, identity, settings)
    return AuthActionResponse(
        **public_user(identity).model_dump(),
        authenticated=True,
    )


@router.post("/signout", dependencies=[Depends(require_trusted_origin)])
async def sign_out(
    settings: Annotated[Settings, Depends(get_settings)],
    auth: Annotated[AuthService, Depends(get_auth_service)],
    access_token: Annotated[str | None, Cookie(alias=ACCESS_COOKIE)] = None,
    refresh_token: Annotated[str | None, Cookie(alias=REFRESH_COOKIE)] = None,
) -> JSONResponse:
    if access_token and refresh_token:
        try:
            await auth.sign_out(access_token, refresh_token)
        except (AuthError, AuthProviderUnavailable):
            error_response = JSONResponse(
                {"detail": "The provider could not revoke this session. Try again shortly."},
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
            clear_session_cookies(error_response, settings)
            return error_response

    response = JSONResponse({"signed_out": True})
    clear_session_cookies(response, settings)
    return response
