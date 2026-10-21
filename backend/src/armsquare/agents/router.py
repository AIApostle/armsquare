import json
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from openai import OpenAIError
from pydantic import ValidationError
from strands.types.exceptions import ModelThrottledException
from supabase._async.client import AsyncClient
from supabase_auth.errors import AuthError

from armsquare.core.config import Settings, get_settings
from armsquare.identity.router import ACCESS_COOKIE, get_auth_service
from armsquare.identity.schemas import AccountRole
from armsquare.identity.service import (
    AuthProfileMissing,
    AuthProfileUnavailable,
    AuthProviderUnavailable,
    AuthService,
)
from armsquare.marketplace.service import MarketplaceService
from armsquare.marketplace.tavily import TavilySearchService
from armsquare.marketplace.tools import (
    create_business_agent_tools,
    create_shopper_agent_tools,
)
from supabase import create_async_client

from .schemas import ChatMessage
from .service import AgentProviderUnavailable, AgentService, get_agent_service

router = APIRouter(prefix="/v1/agent", tags=["agent"])
MAX_MESSAGE_BYTES = 16_384


async def close_supabase_client(client: AsyncClient) -> None:
    await client.auth.close()
    await client.postgrest.aclose()
    await client.realtime.close()


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
    except AuthProviderUnavailable:
        await websocket.close(code=1013, reason="Authentication service unavailable.")
        return
    except (AuthError, AuthProfileMissing, AuthProfileUnavailable):
        await websocket.close(code=4401, reason="Authentication could not be verified.")
        return

    await websocket.accept()
    marketplace_client: AsyncClient | None = None
    try:
        project_url = str(settings.supabase_url) if settings.supabase_url else ""
        anon_key = settings.supabase_anon_key.get_secret_value()
        if not project_url or not anon_key:
            raise ValueError("The marketplace data service is not configured.")
        marketplace_client = await create_async_client(project_url, anon_key)
        marketplace_client.postgrest.auth(access_token)
        marketplace_service = MarketplaceService(marketplace_client)
        if identity.role is AccountRole.BUSINESS:
            tools = create_business_agent_tools(
                marketplace_service,
                TavilySearchService(settings.tavily_api_key),
            )
        else:
            tools = create_shopper_agent_tools(marketplace_service)
        agent = agent_service.create_agent(identity.role, tools=tools)
    except AgentProviderUnavailable:
        if marketplace_client:
            await close_supabase_client(marketplace_client)
        await websocket.send_json(
            {
                "type": "error",
                "code": "agent_unavailable",
                "message": "The agent service is not configured.",
            }
        )
        await websocket.close(code=1013, reason="Agent service unavailable.")
        return
    except (httpx.HTTPError, ValueError):
        if marketplace_client:
            await close_supabase_client(marketplace_client)
        await websocket.send_json(
            {
                "type": "error",
                "code": "agent_tools_unavailable",
                "message": "The marketplace assistant tools are not configured.",
            }
        )
        await websocket.close(code=1013, reason="Marketplace assistant tools unavailable.")
        return

    await websocket.send_json({"type": "ready", "role": identity.role.value})

    try:
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
    finally:
        if marketplace_client:
            await close_supabase_client(marketplace_client)
