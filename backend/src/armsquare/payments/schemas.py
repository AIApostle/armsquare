from dataclasses import dataclass
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


@dataclass(frozen=True)
class AuthorizedOrder:
    """A persisted and authorized order prepared by trusted application logic."""

    order_id: UUID
    amount: Decimal
    currency_code: str

    def __post_init__(self) -> None:
        if not self.amount.is_finite() or self.amount <= 0:
            raise ValueError("Order amount must be a positive finite number.")
        if len(self.currency_code) != 3 or not self.currency_code.isascii():
            raise ValueError("Currency code must be a three-letter ASCII code.")
        if not self.currency_code.isalpha() or self.currency_code != self.currency_code.upper():
            raise ValueError("Currency code must use three uppercase letters.")

    @property
    def amount_value(self) -> str:
        return format(self.amount, "f")


class PayPalLink(BaseModel):
    model_config = ConfigDict(extra="ignore")

    href: str
    rel: str
    method: str | None = None


class PayPalOrderResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    status: str
    links: list[PayPalLink] = Field(default_factory=list)
