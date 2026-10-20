import pytest
from fastapi.testclient import TestClient
from pydantic import SecretStr
from starlette.websockets import WebSocketDisconnect
from strands import Agent
from strands.models.openai import OpenAIModel

from armsquare.agents.router import get_agent_service
from armsquare.agents.service import AgentService
from armsquare.core.config import Settings, get_settings
from armsquare.identity.router import get_auth_service
from armsquare.identity.schemas import AccountRole
from armsquare.identity.service import AuthIdentity
from armsquare.main import app


class FakeAuthService:
    async def get_current_user(self, access_token: str) -> AuthIdentity:
        assert access_token == "valid-session"
        return AuthIdentity(
            user_id="user-123",
            email="shopper@example.com",
            role=AccountRole.USER,
            email_confirmed=True,
        )


class FakeAgent:
    async def stream_async(self, prompt: str):
        assert prompt == "Find a gift"
        yield {"data": "I can help "}
        yield {"data": "you compare options."}


class FakeAgentService:
    def create_agent(self, role: AccountRole) -> FakeAgent:
        assert role is AccountRole.USER
        return FakeAgent()


def setup_function() -> None:
    app.dependency_overrides[get_auth_service] = lambda: FakeAuthService()
    app.dependency_overrides[get_agent_service] = lambda: FakeAgentService()
    app.dependency_overrides[get_settings] = lambda: Settings(
        _env_file=None,
        cors_origins=["http://localhost:3000"],
    )


def teardown_function() -> None:
    app.dependency_overrides.clear()


def test_websocket_authenticates_cookie_and_streams_agent_response() -> None:
    client = TestClient(app)
    client.cookies.set("armsquare_access_token", "valid-session")
    with client, client.websocket_connect(
        "/v1/agent/ws",
        headers={"Origin": "http://localhost:3000"},
    ) as websocket:
        assert websocket.receive_json() == {"type": "ready", "role": "user"}

        websocket.send_json({"type": "message", "content": "Find a gift"})

        assert websocket.receive_json() == {"type": "message.started"}
        assert websocket.receive_json() == {
            "type": "message.delta",
            "content": "I can help ",
        }
        assert websocket.receive_json() == {
            "type": "message.delta",
            "content": "you compare options.",
        }
        assert websocket.receive_json() == {"type": "message.completed"}


def test_websocket_rejects_missing_session_cookie() -> None:
    with (
        TestClient(app) as client,
        pytest.raises(WebSocketDisconnect) as disconnect,
        client.websocket_connect(
            "/v1/agent/ws",
            headers={"Origin": "http://localhost:3000"},
        ),
    ):
        pass

    assert disconnect.value.code == 4401


def test_websocket_does_not_accept_query_string_tokens() -> None:
    with (
        TestClient(app) as client,
        pytest.raises(WebSocketDisconnect) as disconnect,
        client.websocket_connect(
            "/v1/agent/ws?access_token=valid-session",
            headers={"Origin": "http://localhost:3000"},
        ),
    ):
        pass

    assert disconnect.value.code == 4401


def test_websocket_rejects_untrusted_origin() -> None:
    client = TestClient(app)
    client.cookies.set("armsquare_access_token", "valid-session")
    with (
        client,
        pytest.raises(WebSocketDisconnect) as disconnect,
        client.websocket_connect(
            "/v1/agent/ws",
            headers={"Origin": "https://untrusted.example"},
        ),
    ):
        pass

    assert disconnect.value.code == 1008


def test_websocket_reports_missing_openrouter_configuration() -> None:
    app.dependency_overrides[get_agent_service] = lambda: AgentService(
        Settings(_env_file=None)
    )
    client = TestClient(app)
    client.cookies.set("armsquare_access_token", "valid-session")
    with client, client.websocket_connect(
        "/v1/agent/ws",
        headers={"Origin": "http://localhost:3000"},
    ) as websocket:
        assert websocket.receive_json() == {
            "type": "error",
            "code": "agent_unavailable",
            "message": "The agent service is not configured.",
        }


def test_agent_service_uses_strands_with_a_configured_openrouter_key() -> None:
    service = AgentService(
        Settings(
            _env_file=None,
            openrouter_api_key=SecretStr("test-openrouter-key"),
        )
    )

    agent = service.create_agent(AccountRole.BUSINESS)

    assert isinstance(agent, Agent)
    assert isinstance(agent.model, OpenAIModel)


def test_websocket_rejects_invalid_message_without_trusting_role_fields() -> None:
    client = TestClient(app)
    client.cookies.set("armsquare_access_token", "valid-session")
    with client, client.websocket_connect(
        "/v1/agent/ws",
        headers={"Origin": "http://localhost:3000"},
    ) as websocket:
        assert websocket.receive_json()["type"] == "ready"
        websocket.send_json(
            {"type": "message", "content": "Hello", "role": "business"}
        )

        assert websocket.receive_json() == {
            "type": "error",
            "code": "invalid_message",
            "message": 'Send a JSON object with type "message" and non-empty content.',
        }
