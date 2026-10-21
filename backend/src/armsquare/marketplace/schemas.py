from datetime import datetime
from decimal import Decimal
from enum import StrEnum
from typing import Any, Literal
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
    field_validator,
    model_validator,
)


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.title() for part in rest)


class ApiModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        extra="forbid",
        populate_by_name=True,
    )


class StoreCategory(StrEnum):
    SKIN_CARE = "skin-care"
    ARTS_AND_CRAFTS = "arts-and-crafts"
    CYCLING = "cycling"


class Availability(StrEnum):
    IN_STOCK = "in_stock"
    LOW_STOCK = "low_stock"
    MADE_TO_ORDER = "made_to_order"


class CategoryResponse(ApiModel):
    id: StoreCategory
    name: str


class StoreCreateRequest(ApiModel):
    name: str = Field(min_length=2, max_length=160)
    tagline: str = Field(min_length=2, max_length=180)
    description: str = Field(min_length=1, max_length=2000)
    category_id: StoreCategory
    region: str = Field(min_length=2, max_length=160)
    image_url: HttpUrl | None = None
    is_published: bool = False

    @field_validator("name", "tagline", "description", "region", mode="before")
    @classmethod
    def trim_text(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @field_validator("image_url")
    @classmethod
    def require_secure_image_url(cls, value: HttpUrl | None) -> HttpUrl | None:
        if value is not None and value.scheme != "https":
            raise ValueError("Store images must use HTTPS.")
        return value


class ProductCreateRequest(ApiModel):
    name: str = Field(min_length=2, max_length=160)
    description: str = Field(min_length=1, max_length=2000)
    price: Decimal = Field(gt=Decimal(0), max_digits=12, decimal_places=2)
    unit: str = Field(default="item", min_length=1, max_length=40)
    availability: Availability = Availability.IN_STOCK
    delivery: str = Field(min_length=1, max_length=180)
    image_url: HttpUrl | None = None
    is_published: bool = False

    @field_validator("name", "description", "unit", "delivery", mode="before")
    @classmethod
    def trim_text(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @field_validator("image_url")
    @classmethod
    def require_secure_image_url(cls, value: HttpUrl | None) -> HttpUrl | None:
        if value is not None and value.scheme != "https":
            raise ValueError("Product images must use HTTPS.")
        return value


class StorePublishRequest(ApiModel):
    is_published: bool


class AgentConfigurationRequest(ApiModel):
    enabled_tools: list[
        Literal[
            "catalog.read",
            "marketplace.search",
            "product.create_draft",
            "web.research",
        ]
    ] | None = Field(default=None, min_length=1, max_length=4)
    autonomy_level: Literal["read_only", "recommend", "draft"] | None = None
    is_paused: bool | None = None

    @field_validator("enabled_tools")
    @classmethod
    def require_unique_tools(
        cls,
        value: list[str] | None,
    ) -> list[str] | None:
        if value is not None and len(value) != len(set(value)):
            raise ValueError("Assistant tools must be unique.")
        return value

    @model_validator(mode="after")
    def require_a_change(self) -> "AgentConfigurationRequest":
        if (
            self.enabled_tools is None
            and self.autonomy_level is None
            and self.is_paused is None
        ):
            raise ValueError("At least one assistant setting must be provided.")
        return self


class ProductPublishRequest(ApiModel):
    is_published: bool


class MoneyResponse(ApiModel):
    amount: float
    currency: str


class ProductResponse(ApiModel):
    id: UUID
    business_id: UUID
    name: str
    description: str
    price: MoneyResponse
    unit: str
    availability: Availability
    delivery: str
    image_url: str | None
    is_published: bool
    created_by_agent: bool = False
    created_at: datetime


class StoreAgentResponse(ApiModel):
    id: UUID
    name: str
    capabilities: list[str]
    enabled_tools: list[str]
    autonomy_level: str
    is_paused: bool
    available: bool
    median_reply_seconds: int | None = None
    created_at: datetime


class StoreResponse(ApiModel):
    id: UUID
    name: str
    slug: str
    tagline: str
    description: str
    category_id: StoreCategory
    region: str
    image_url: str | None
    is_published: bool
    is_demo: bool
    created_at: datetime
    agent: StoreAgentResponse
    products: list[ProductResponse] = Field(default_factory=list)


class TrustResponse(ApiModel):
    orders_fulfilled: int = 0
    on_time_rate: float | None = None
    disputes: int = 0
    member_since: datetime


class PublicBusinessResponse(ApiModel):
    id: UUID
    name: str
    tagline: str
    category_ids: list[StoreCategory]
    region: str
    verification: str = "unverified"
    image_url: str | None
    is_demo: bool
    agent: StoreAgentResponse
    trust: TrustResponse
    claims: list[str] = Field(default_factory=list)


class StorefrontResponse(ApiModel):
    business: PublicBusinessResponse
    listings: list[ProductResponse]


class BusinessDeskResponse(ApiModel):
    business: dict[str, str]
    owner: dict[str, str]
    agent: dict[str, Any]
    autonomy: str
    paused: bool


class BusinessDeskPatch(ApiModel):
    paused: bool
