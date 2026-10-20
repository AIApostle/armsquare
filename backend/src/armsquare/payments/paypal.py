import asyncio
import re
import time
from typing import Any
from uuid import NAMESPACE_URL, UUID, uuid5

import httpx
from pydantic import BaseModel, ConfigDict, Field, SecretStr

from armsquare.core.config import Settings

from .schemas import AuthorizedOrder, PayPalOrderResponse

PAYPAL_SANDBOX_URL = "https://api-m.sandbox.paypal.com"


class PayPalNotConfigured(Exception):
    pass


class PayPalProviderError(Exception):
    pass


class _PayPalAccessToken(BaseModel):
    model_config = ConfigDict(extra="ignore")

    access_token: SecretStr
    expires_in: int = Field(gt=0)


class PayPalPayments:
    """PayPal Orders v2 adapter pinned to the sandbox environment."""

    def __init__(self, settings: Settings, client: httpx.AsyncClient) -> None:
        self._client_id = settings.paypal_client_id
        self._client_secret = settings.paypal_client_secret
        self._client = client
        self._access_token: SecretStr | None = None
        self._access_token_expires_at = 0.0
        self._token_lock = asyncio.Lock()

    async def create_order(self, order: AuthorizedOrder) -> PayPalOrderResponse:
        token = await self._get_access_token()
        request_id = self._request_id(order.order_id, "create")
        payload = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": str(order.order_id),
                    "custom_id": str(order.order_id),
                    "amount": {
                        "currency_code": order.currency_code,
                        "value": order.amount_value,
                    },
                }
            ],
        }
        body = await self._request(
            "POST",
            "/v2/checkout/orders",
            token,
            json=payload,
            request_id=request_id,
        )
        return PayPalOrderResponse.model_validate(body)

    async def capture_order(
        self,
        order: AuthorizedOrder,
        paypal_order_id: str,
    ) -> PayPalOrderResponse:
        if re.fullmatch(r"[A-Za-z0-9]+", paypal_order_id) is None:
            raise ValueError("PayPal order ID contains unsupported characters.")

        token = await self._get_access_token()
        request_id = self._request_id(order.order_id, "capture")
        body = await self._request(
            "POST",
            f"/v2/checkout/orders/{paypal_order_id}/capture",
            token,
            json={},
            request_id=request_id,
        )
        return PayPalOrderResponse.model_validate(body)

    async def _get_access_token(self) -> SecretStr:
        if (
            self._access_token is not None
            and time.monotonic() < self._access_token_expires_at
        ):
            return self._access_token

        async with self._token_lock:
            if (
                self._access_token is not None
                and time.monotonic() < self._access_token_expires_at
            ):
                return self._access_token

            client_id = self._required_credential(self._client_id)
            client_secret = self._required_credential(self._client_secret)
            try:
                response = await self._client.post(
                    f"{PAYPAL_SANDBOX_URL}/v1/oauth2/token",
                    auth=(client_id, client_secret),
                    data={"grant_type": "client_credentials"},
                    headers={"Accept": "application/json"},
                    timeout=15.0,
                )
                response.raise_for_status()
                token = _PayPalAccessToken.model_validate(response.json())
            except (httpx.HTTPError, ValueError) as exc:
                raise PayPalProviderError(
                    "PayPal sandbox authentication failed."
                ) from exc

            self._access_token = token.access_token
            self._access_token_expires_at = (
                time.monotonic() + max(token.expires_in - 60, 0)
            )
            return token.access_token

    async def _request(
        self,
        method: str,
        path: str,
        token: SecretStr,
        *,
        json: dict[str, Any],
        request_id: str,
    ) -> dict[str, Any]:
        try:
            response = await self._client.request(
                method,
                f"{PAYPAL_SANDBOX_URL}{path}",
                json=json,
                headers={
                    "Authorization": f"Bearer {token.get_secret_value()}",
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "PayPal-Request-Id": request_id,
                },
                timeout=15.0,
            )
            response.raise_for_status()
            body = response.json()
        except httpx.HTTPError as exc:
            raise PayPalProviderError(
                "PayPal sandbox could not process the payment request."
            ) from exc
        except ValueError as exc:
            raise PayPalProviderError(
                "PayPal sandbox returned an invalid response."
            ) from exc

        if not isinstance(body, dict):
            raise PayPalProviderError("PayPal sandbox returned an invalid response.")
        return body

    @staticmethod
    def _required_credential(value: SecretStr | None) -> str:
        if value is None or not value.get_secret_value():
            raise PayPalNotConfigured("PayPal sandbox credentials are not configured.")
        return value.get_secret_value()

    @staticmethod
    def _request_id(order_id: UUID, action: str) -> str:
        return str(uuid5(NAMESPACE_URL, f"armsquare:paypal:{action}:{order_id}"))
