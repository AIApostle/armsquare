import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock

import httpx
import pytest
from fastapi.testclient import TestClient

from armsquare.core.config import Settings, get_settings
from armsquare.identity.router import get_auth_service
from armsquare.identity.schemas import AccountRole, SignUpRequest
from armsquare.identity.service import (
    AuthIdentity,
    AuthProfileUnavailable,
    AuthProviderUnavailable,
    AuthService,
)
from main import app


class FakeAuthService:
    async def sign_up(self, request: SignUpRequest) -> AuthIdentity:
        return AuthIdentity(
            user_id="user-123",
            email=str(request.email),
            role=request.role,
            access_token="access-token",
            refresh_token="refresh-token",
            expires_in=3600,
        )

    async def sign_in(self, email: str, password: str, role: AccountRole) -> AuthIdentity:
        return AuthIdentity(
            user_id="user-123",
            email=email,
            role=role,
            access_token="access-token",
            refresh_token="refresh-token",
            expires_in=3600,
        )

    async def get_current_user(self, access_token: str) -> AuthIdentity:
        return AuthIdentity(
            user_id="user-123",
            email="shopper@example.com",
            role=AccountRole.USER,
        )


class TimedOutAuthService(FakeAuthService):
    async def sign_up(self, request: SignUpRequest) -> AuthIdentity:
        raise AuthProviderUnavailable("The authentication provider could not be reached.")


def setup_function() -> None:
    app.dependency_overrides[get_auth_service] = lambda: FakeAuthService()


def teardown_function() -> None:
    app.dependency_overrides.clear()


def test_signup_sets_http_only_session_cookies_without_returning_tokens() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/v1/auth/signup",
            headers={"Origin": "http://localhost:3000"},
            json={
                "email": "shopper@example.com",
                "password": "long-enough-password",
                "display_name": "Sam Shopper",
                "role": "user",
            },
        )

    assert response.status_code == 200
    assert response.json()["authenticated"] is True
    assert "access_token" not in response.json()
    assert "email_confirmation_required" not in response.json()
    assert "email_confirmed" not in response.json()
    cookies = response.headers.get_list("set-cookie")
    assert len(cookies) == 2
    assert all("HttpOnly" in cookie for cookie in cookies)
    assert all("armsquare_" in cookie for cookie in cookies)


def test_signup_returns_error_when_provider_does_not_create_session() -> None:
    class NoSessionAuth(FakeAuthService):
        async def sign_up(self, request: SignUpRequest) -> AuthIdentity:
            raise AuthProfileUnavailable("Sign-up did not create a session.")

    app.dependency_overrides[get_auth_service] = lambda: NoSessionAuth()
    with TestClient(app) as client:
        response = client.post(
            "/v1/auth/signup",
            headers={"Origin": "http://localhost:3000"},
            json={
                "email": "shopper@example.com",
                "password": "long-enough-password",
                "display_name": "Sam Shopper",
                "role": "user",
            },
        )

    assert response.status_code == 503
    assert "email confirmation is disabled" in response.json()["detail"]
    assert "set-cookie" not in response.headers


def test_signup_rejects_business_account_without_business_name() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/v1/auth/signup",
            headers={"Origin": "http://localhost:3000"},
            json={
                "email": "owner@example.com",
                "password": "long-enough-password",
                "display_name": "Sam Owner",
                "role": "business",
            },
        )

    assert response.status_code == 422


def test_signup_rejects_untrusted_origin() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/v1/auth/signup",
            headers={"Origin": "https://untrusted.example"},
            json={
                "email": "shopper@example.com",
                "password": "long-enough-password",
                "display_name": "Sam Shopper",
                "role": "user",
            },
        )

    assert response.status_code == 403


def test_signin_requires_the_requested_account_role() -> None:
    class WrongRoleAuth(FakeAuthService):
        async def sign_in(self, email: str, password: str, role: AccountRole) -> AuthIdentity:
            raise PermissionError("This account is registered for a different sign-in area.")

    app.dependency_overrides[get_auth_service] = lambda: WrongRoleAuth()
    with TestClient(app) as client:
        response = client.post(
            "/v1/auth/signin",
            headers={"Origin": "http://localhost:3000"},
            json={
                "email": "shopper@example.com",
                "password": "long-enough-password",
                "role": "business",
            },
        )

    assert response.status_code == 403
    assert "set-cookie" not in response.headers


def test_signin_sets_http_only_session_cookies_without_email_confirmation_fields() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/v1/auth/signin",
            headers={"Origin": "http://localhost:3000"},
            json={
                "email": "shopper@example.com",
                "password": "long-enough-password",
                "role": "user",
            },
        )

    assert response.status_code == 200
    assert response.json()["authenticated"] is True
    assert "email_confirmation_required" not in response.json()
    assert "email_confirmed" not in response.json()
    cookies = response.headers.get_list("set-cookie")
    assert len(cookies) == 2
    assert all("HttpOnly" in cookie for cookie in cookies)


def test_signin_reports_unavailable_profile_without_claiming_invalid_credentials() -> None:
    class UnavailableProfileAuth(FakeAuthService):
        async def sign_in(self, email: str, password: str, role: AccountRole) -> AuthIdentity:
            raise AuthProfileUnavailable("The profile table is unavailable.")

    app.dependency_overrides[get_auth_service] = lambda: UnavailableProfileAuth()
    with TestClient(app) as client:
        response = client.post(
            "/v1/auth/signin",
            headers={"Origin": "http://localhost:3000"},
            json={
                "email": "owner@example.com",
                "password": "long-enough-password",
                "role": "business",
            },
        )

    assert response.status_code == 503
    assert response.json()["detail"] == "The account profile is unavailable. Try again later."
    assert "set-cookie" not in response.headers


def test_signup_reports_unconfigured_auth_without_exposing_provider_name() -> None:
    app.dependency_overrides.pop(get_auth_service)
    app.dependency_overrides[get_settings] = lambda: Settings(_env_file=None)

    with TestClient(app) as client:
        response = client.post(
            "/v1/auth/signup",
            headers={"Origin": "http://localhost:3000"},
            json={
                "email": "shopper@example.com",
                "password": "long-enough-password",
                "display_name": "Sam Shopper",
                "role": "user",
            },
        )

    assert response.status_code == 503
    assert response.json()["detail"] == "The authentication provider is not configured."
    assert "supabase" not in response.text.lower()


def test_signup_reports_provider_timeout_as_temporary_unavailability() -> None:
    app.dependency_overrides[get_auth_service] = lambda: TimedOutAuthService()

    with TestClient(app) as client:
        response = client.post(
            "/v1/auth/signup",
            headers={"Origin": "http://localhost:3000"},
            json={
                "email": "shopper@example.com",
                "password": "long-enough-password",
                "display_name": "Sam Shopper",
                "role": "user",
            },
        )

    assert response.status_code == 503
    assert response.json()["detail"] == (
        "The authentication service is temporarily unavailable. "
        "Check your connection and try again."
    )
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert "access_token" not in response.text


def test_auth_service_converts_httpx_connect_timeout_to_provider_unavailable() -> None:
    client = SimpleNamespace(
        auth=SimpleNamespace(
            sign_up=AsyncMock(side_effect=httpx.ConnectTimeout("connection timed out"))
        )
    )
    request = SignUpRequest(
        email="shopper@example.com",
        password="long-enough-password",
        display_name="Sam Shopper",
        role=AccountRole.USER,
    )

    async def run() -> None:
        with pytest.raises(AuthProviderUnavailable):
            await AuthService(client).sign_up(request)

    asyncio.run(run())


def test_auth_service_rejects_signup_without_an_authenticated_session() -> None:
    client = SimpleNamespace(
        auth=SimpleNamespace(
            sign_up=AsyncMock(
                return_value=SimpleNamespace(
                    user=SimpleNamespace(id="user-123", email="shopper@example.com"),
                    session=None,
                )
            )
        )
    )
    request = SignUpRequest(
        email="shopper@example.com",
        password="long-enough-password",
        display_name="Sam Shopper",
        role=AccountRole.USER,
    )

    async def run() -> None:
        with pytest.raises(AuthProfileUnavailable, match="did not create a session"):
            await AuthService(client).sign_up(request)

    asyncio.run(run())


def test_profile_signup_data_normalizes_email_and_names() -> None:
    request = SignUpRequest(
        email="SHOPPER@example.com",
        password="long-enough-password",
        display_name="  Sam Shopper  ",
        role=AccountRole.USER,
    )

    assert str(request.email) == "shopper@example.com"
    assert request.display_name == "Sam Shopper"


def test_settings_accept_project_url_environment_name(tmp_path) -> None:
    env_file = tmp_path / ".env"
    env_file.write_text(
        "SUPABASE_PROJECT_URL=https://project.example\n"
        "SUPABASE_ANON_KEY=example-public-key\n"
    )

    settings = Settings(_env_file=env_file)

    assert str(settings.supabase_url) == "https://project.example/"
    assert settings.supabase_anon_key.get_secret_value() == "example-public-key"


def test_settings_keep_support_for_legacy_project_url_environment_name(tmp_path) -> None:
    env_file = tmp_path / ".env"
    env_file.write_text(
        "SUPABASE_URL=https://legacy-project.example\n"
        "SUPABASE_ANON_KEY=example-public-key\n"
    )

    settings = Settings(_env_file=env_file)

    assert str(settings.supabase_url) == "https://legacy-project.example/"
