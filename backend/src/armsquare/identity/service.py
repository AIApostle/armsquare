from dataclasses import dataclass
from typing import Any

from postgrest.exceptions import APIError
from supabase._async.client import AsyncClient

from .schemas import AccountRole, SignUpRequest


class AuthProfileMissing(Exception):
    pass


class AuthProfileUnavailable(Exception):
    pass


@dataclass(frozen=True)
class AuthIdentity:
    user_id: str
    email: str | None
    role: AccountRole
    email_confirmed: bool
    access_token: str | None = None
    refresh_token: str | None = None
    expires_in: int | None = None


class AuthService:
    def __init__(self, client: AsyncClient) -> None:
        self._client = client

    async def sign_up(self, request: SignUpRequest) -> AuthIdentity:
        response = await self._client.auth.sign_up(
            {
                "email": str(request.email),
                "password": request.password,
                "options": {
                    "data": {
                        "role": request.role.value,
                        "display_name": request.display_name,
                        "business_name": request.business_name,
                    }
                },
            }
        )
        if response.user is None:
            raise AuthProfileUnavailable("Supabase did not return a user after sign-up.")
        session = response.session
        return AuthIdentity(
            user_id=response.user.id,
            email=response.user.email,
            role=request.role,
            email_confirmed=response.user.email_confirmed_at is not None,
            access_token=session.access_token if session else None,
            refresh_token=session.refresh_token if session else None,
            expires_in=session.expires_in if session else None,
        )

    async def sign_in(self, email: str, password: str, role: AccountRole) -> AuthIdentity:
        response = await self._client.auth.sign_in_with_password(
            {"email": email, "password": password}
        )
        if response.user is None or response.session is None:
            raise AuthProfileUnavailable("Supabase did not return an authenticated session.")
        stored_role = await self._profile_role(response.user.id, response.session.access_token)
        if stored_role is not role:
            raise PermissionError("This account is registered for a different sign-in area.")
        return AuthIdentity(
            user_id=response.user.id,
            email=response.user.email,
            role=stored_role,
            email_confirmed=response.user.email_confirmed_at is not None,
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            expires_in=response.session.expires_in,
        )

    async def get_current_user(self, access_token: str) -> AuthIdentity:
        response = await self._client.auth.get_user(access_token)
        if response is None or response.user is None:
            raise AuthProfileMissing("The access token is invalid or expired.")
        role = await self._profile_role(response.user.id, access_token)
        return AuthIdentity(
            user_id=response.user.id,
            email=response.user.email,
            role=role,
            email_confirmed=response.user.email_confirmed_at is not None,
        )

    async def refresh(self, refresh_token: str) -> AuthIdentity:
        response = await self._client.auth.refresh_session(refresh_token)
        if response.user is None or response.session is None:
            raise AuthProfileMissing("The refresh token did not produce a session.")
        role = await self._profile_role(response.user.id, response.session.access_token)
        return AuthIdentity(
            user_id=response.user.id,
            email=response.user.email,
            role=role,
            email_confirmed=response.user.email_confirmed_at is not None,
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            expires_in=response.session.expires_in,
        )

    async def sign_out(self, access_token: str, refresh_token: str) -> None:
        await self._client.auth.set_session(access_token, refresh_token)
        await self._client.auth.sign_out({"scope": "local"})

    async def _profile_role(self, user_id: str, access_token: str) -> AccountRole:
        try:
            self._client.postgrest.auth(access_token)
            response = (
                await self._client.table("profiles")
                .select("role")
                .eq("id", user_id)
                .limit(1)
                .execute()
            )
        except APIError as exc:
            raise AuthProfileUnavailable(
                "The account profile could not be loaded from Supabase."
            ) from exc
        if not response.data:
            raise AuthProfileMissing("The account profile does not exist.")
        raw_role: Any = response.data[0].get("role")
        try:
            return AccountRole(raw_role)
        except (TypeError, ValueError) as exc:
            raise AuthProfileMissing("The account profile has no valid account type.") from exc
