import json
from typing import Annotated

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from openai import OpenAIError
from pydantic import ValidationError
from strands.types.exceptions import ModelThrottledException
from supabase_auth.errors import AuthError

from armsquare.core.config import Settings, get_settings
from armsquare.identity.router import ACCESS_COOKIE, get_auth_service
from armsquare.identity.service import (
    AuthProfileMissing,
    AuthProfileUnavailable,
    AuthService,
)

from .schemas import ChatMessage
from .service import AgentProviderUnavailable, AgentService, get_agent_service

router = APIRouter(prefix="/v1/agent", tags=["agent"])
MAX_MESSAGE_BYTES = 16_384


@router.websocket("/ws")
async def agent_chat(
    websocket: WebSocket,
    settings: Annotated[Settings, Depends(get_settings)],
    auth: Annotated[AuthService, Depends(get_auth_service)],
    agent_service: Annotated[AgentService, Depends(get_agent_service)],
) -> None:
    origin = websocket.headers.get("origin")
    if origin is None or origin not in settings.cors_origins:
        await websocket.close(code=1008, reason="Origin is not allowed.")
        return

    access_token = websocket.cookies.get(ACCESS_COOKIE)
    if not access_token:
        await websocket.close(code=4401, reason="Authentication is required.")
        return

    try:
        identity = await auth.get_current_user(access_token)
    except (AuthError, AuthProfileMissing, AuthProfileUnavailable):
        await websocket.close(code=4401, reason="Authentication could not be verified.")
        return

    await websocket.accept()
    try:
        agent = agent_service.create_agent(identity.role)
    except AgentProviderUnavailable:
        await websocket.send_json(
            {
                "type": "error",
                "code": "agent_unavailable",
                "message": "The agent service is not configured.",
            }
        )
        await websocket.close(code=1013, reason="Agent service unavailable.")
        return

    await websocket.send_json({"type": "ready", "role": identity.role.value})

    while True:
        try:
            raw_message = await websocket.receive_text()
        except WebSocketDisconnect:
            return

        if len(raw_message.encode("utf-8")) > MAX_MESSAGE_BYTES:
            await websocket.send_json(
                {
                    "type": "error",
                    "code": "message_too_large",
                    "message": "Messages must be at most 4,000 characters.",
                }
            )
            continue

        try:
            message = ChatMessage.model_validate_json(raw_message)
        except (ValidationError, json.JSONDecodeError, ValueError):
            await websocket.send_json(
                {
                    "type": "error",
                    "code": "invalid_message",
                    "message": 'Send a JSON object with type "message" and non-empty content.',
                }
            )
            continue

        await websocket.send_json({"type": "message.started"})
        try:
            async for event in agent.stream_async(message.content):
                text = event.get("data")
                if isinstance(text, str) and text:
                    await websocket.send_json(
                        {"type": "message.delta", "content": text}
                    )
        except (OpenAIError, ModelThrottledException):
            await websocket.send_json(
                {
                    "type": "error",
                    "code": "agent_provider_error",
                    "message": "The agent provider could not complete the response.",
                }
            )
            continue

        await websocket.send_json({"type": "message.completed"})
