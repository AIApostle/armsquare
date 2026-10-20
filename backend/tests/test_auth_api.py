from fastapi.testclient import TestClient

from armsquare.identity.router import get_auth_service
from armsquare.identity.schemas import AccountRole, SignUpRequest
from armsquare.identity.service import AuthIdentity
from armsquare.main import app


class FakeAuthService:
    async def sign_up(self, request: SignUpRequest) -> AuthIdentity:
        return AuthIdentity(
            user_id="user-123",
            email=str(request.email),
            role=request.role,
            email_confirmed=False,
            access_token="access-token",
            refresh_token="refresh-token",
            expires_in=3600,
        )

    async def sign_in(self, email: str, password: str, role: AccountRole) -> AuthIdentity:
        return AuthIdentity(
            user_id="user-123",
            email=email,
            role=role,
            email_confirmed=True,
            access_token="access-token",
            refresh_token="refresh-token",
            expires_in=3600,
        )

    async def get_current_user(self, access_token: str) -> AuthIdentity:
        return AuthIdentity(
            user_id="user-123",
            email="shopper@example.com",
            role=AccountRole.USER,
            email_confirmed=True,
        )


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
    cookies = response.headers.get_list("set-cookie")
    assert len(cookies) == 2
    assert all("HttpOnly" in cookie for cookie in cookies)
    assert all("armsquare_" in cookie for cookie in cookies)


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


def test_profile_signup_data_normalizes_email_and_names() -> None:
    request = SignUpRequest(
        email="SHOPPER@example.com",
        password="long-enough-password",
        display_name="  Sam Shopper  ",
        role=AccountRole.USER,
    )

    assert str(request.email) == "shopper@example.com"
    assert request.display_name == "Sam Shopper"
