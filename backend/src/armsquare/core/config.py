from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import AliasChoices, AnyHttpUrl, Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    supabase_url: AnyHttpUrl | None = Field(
        default=None,
        validation_alias=AliasChoices("SUPABASE_PROJECT_URL", "SUPABASE_URL"),
    )
    supabase_anon_key: SecretStr = SecretStr("")
    openrouter_api_key: SecretStr | None = None
    tavily_api_key: SecretStr | None = None
    paypal_client_id: SecretStr | None = None
    paypal_client_secret: SecretStr | None = None
    cors_origins: list[str] = ["http://localhost:3000"]
    auth_cookie_secure: bool = True
    auth_cookie_same_site: Literal["lax", "strict", "none"] = "lax"
    auth_cookie_domain: str | None = None

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[3] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @model_validator(mode="after")
    def require_secure_none_cookie(self) -> "Settings":
        if self.auth_cookie_same_site == "none" and not self.auth_cookie_secure:
            raise ValueError("SameSite=None cookies require Secure=true.")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
