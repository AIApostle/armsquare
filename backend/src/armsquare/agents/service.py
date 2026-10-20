from typing import Annotated

from fastapi import Depends
from strands import Agent
from strands.models.openai import OpenAIModel

from armsquare.core.config import Settings, get_settings
from armsquare.identity.schemas import AccountRole


class AgentProviderUnavailable(Exception):
    pass


class AgentService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def create_agent(self, role: AccountRole) -> Agent:
        api_key = self._settings.openrouter_api_key
        if api_key is None or not api_key.get_secret_value():
            raise AgentProviderUnavailable("OpenRouter is not configured.")

        model = OpenAIModel(
            client_args={
                "api_key": api_key.get_secret_value(),
                "base_url": "https://openrouter.ai/api/v1",
                "timeout": 45.0,
                "max_retries": 1,
            },
            model_id="openrouter/free",
            params={"max_tokens": 1024, "temperature": 0.3},
        )
        return Agent(
            model=model,
            system_prompt=self._system_prompt(role),
            callback_handler=None,
        )

    @staticmethod
    def _system_prompt(role: AccountRole) -> str:
        if role is AccountRole.BUSINESS:
            audience = "business owners and operators"
        else:
            audience = "individual shoppers"

        return (
            f"You are the AMSquare assistant for {audience}. Give clear, practical help. "
            "You have no tools and cannot change account settings, contact businesses, "
            "place orders, or move money. Never claim that you completed an action or "
            "verified live marketplace data unless a trusted backend service did so."
        )


def get_agent_service(
    settings: Annotated[Settings, Depends(get_settings)],
) -> AgentService:
    return AgentService(settings)
