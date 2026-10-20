import asyncio
import json
from decimal import Decimal
from uuid import uuid4

import httpx
import pytest
from pydantic import SecretStr

from armsquare.core.config import Settings
from armsquare.payments.paypal import (
    PAYPAL_SANDBOX_URL,
    PayPalNotConfigured,
    PayPalPayments,
    PayPalProviderError,
)
from armsquare.payments.schemas import AuthorizedOrder


def paypal_settings() -> Settings:
    return Settings(
        _env_file=None,
        paypal_client_id=SecretStr("sandbox-client"),
        paypal_client_secret=SecretStr("sandbox-secret"),
    )


def test_paypal_create_and_capture_use_sandbox_and_stable_idempotency() -> None:
    order_id = uuid4()
    requests: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        if request.url.path == "/v1/oauth2/token":
            return httpx.Response(
                200,
                json={"access_token": "test-token", "expires_in": 3600},
            )
        if request.url.path == "/v2/checkout/orders":
            return httpx.Response(
                201,
                json={
                    "id": "PAYPALORDER123",
                    "status": "CREATED",
                    "links": [{"href": "https://sandbox.paypal.com/approve", "rel": "approve"}],
                },
            )
        if request.url.path == "/v2/checkout/orders/PAYPALORDER123/capture":
            return httpx.Response(
                201,
                json={"id": "PAYPALORDER123", "status": "COMPLETED"},
            )
        return httpx.Response(404)

    async def run() -> None:
        async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
            payments = PayPalPayments(paypal_settings(), client)
            order = AuthorizedOrder(order_id, Decimal("24.50"), "USD")
            created = await payments.create_order(order)
            captured = await payments.capture_order(order, created.id)

        assert created.status == "CREATED"
        assert created.links[0].rel == "approve"
        assert captured.status == "COMPLETED"

    asyncio.run(run())

    assert len(requests) == 3
    assert all(str(request.url).startswith(PAYPAL_SANDBOX_URL) for request in requests)
    create_request = requests[1]
    assert len(create_request.headers["PayPal-Request-Id"]) == 36
    create_body = json.loads(create_request.content)
    assert create_body["intent"] == "CAPTURE"
    purchase_unit = create_body["purchase_units"][0]
    assert purchase_unit["reference_id"] == str(order_id)
    assert purchase_unit["custom_id"] == str(order_id)
    assert purchase_unit["amount"] == {"currency_code": "USD", "value": "24.50"}
    capture_request = requests[2]
    assert len(capture_request.headers["PayPal-Request-Id"]) == 36


def test_paypal_requires_credentials_before_any_request() -> None:
    async def run() -> None:
        async with httpx.AsyncClient() as client:
            payments = PayPalPayments(Settings(_env_file=None), client)
            with pytest.raises(PayPalNotConfigured):
                await payments.create_order(
                    AuthorizedOrder(uuid4(), Decimal("10.00"), "USD")
                )

    asyncio.run(run())


@pytest.mark.parametrize(
    ("amount", "currency_code"),
    [
        (Decimal(0), "USD"),
        (Decimal("-1.00"), "USD"),
        (Decimal("1.00"), "usd"),
        (Decimal("1.00"), "US"),
    ],
)
def test_authorized_order_rejects_invalid_payment_terms(
    amount: Decimal,
    currency_code: str,
) -> None:
    with pytest.raises(ValueError):
        AuthorizedOrder(uuid4(), amount, currency_code)


def test_paypal_provider_errors_do_not_return_a_success_shaped_result() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/v1/oauth2/token":
            return httpx.Response(
                200,
                json={"access_token": "test-token", "expires_in": 3600},
            )
        return httpx.Response(500, json={"error": "sandbox failure"})

    async def run() -> None:
        async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
            payments = PayPalPayments(paypal_settings(), client)
            with pytest.raises(PayPalProviderError):
                await payments.create_order(
                    AuthorizedOrder(uuid4(), Decimal("10.00"), "USD")
                )

    asyncio.run(run())


def test_capture_rejects_untrusted_paypal_order_ids() -> None:
    async def run() -> None:
        async with httpx.AsyncClient() as client:
            payments = PayPalPayments(paypal_settings(), client)
            with pytest.raises(ValueError):
                await payments.capture_order(
                    AuthorizedOrder(uuid4(), Decimal("10.00"), "USD"),
                    "../other-order",
                )

    asyncio.run(run())
