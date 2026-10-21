import asyncio
import json

import httpx
import pytest
from pydantic import SecretStr

from armsquare.marketplace.tavily import (
    MAX_CONTENT_LENGTH,
    MAX_RESULTS,
    TAVILY_SEARCH_URL,
    TavilySearchService,
    TavilyUnavailable,
)


def test_tavily_search_uses_bounded_results_and_strips_raw_response_fields() -> None:
    request_payload: dict[str, object] = {}
    authorization: str | None = None
    results = [
        {
            "title": f"Vendor {index}",
            "url": f"https://vendor-{index}.example/catalog",
            "content": "x" * (MAX_CONTENT_LENGTH + 20),
            "published_date": "2026-10-20",
            "raw_content": "not needed",
        }
        for index in range(MAX_RESULTS + 1)
    ]

    async def handler(request: httpx.Request) -> httpx.Response:
        nonlocal authorization, request_payload
        assert str(request.url) == TAVILY_SEARCH_URL
        authorization = request.headers.get("Authorization")
        request_payload = json.loads(request.content)
        return httpx.Response(200, json={"results": results})

    async def run_search() -> list[dict[str, str | None]]:
        async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
            service = TavilySearchService(
                SecretStr("test-tavily-key"),
                client=client,
            )
            return await service.search("  wholesale cycling accessories  ")

    found = asyncio.run(run_search())

    assert request_payload == {
        "query": "wholesale cycling accessories",
        "topic": "general",
        "search_depth": "basic",
        "max_results": MAX_RESULTS,
        "include_answer": False,
        "include_raw_content": False,
    }
    assert authorization == "Bearer test-tavily-key"
    assert len(found) == MAX_RESULTS
    assert len(found[0]["snippet"] or "") == MAX_CONTENT_LENGTH
    assert "raw_content" not in found[0]
    assert found[0]["url"] == "https://vendor-0.example/catalog"


def test_tavily_search_requires_a_configured_key() -> None:
    with pytest.raises(TavilyUnavailable, match="not configured"):
        asyncio.run(TavilySearchService(None).search("find a supplier"))


@pytest.mark.parametrize("query", [" ", "x" * 301])
def test_tavily_search_rejects_empty_or_oversized_queries(query: str) -> None:
    service = TavilySearchService(SecretStr("test-tavily-key"))

    with pytest.raises(ValueError):
        asyncio.run(service.search(query))


def test_tavily_search_does_not_expose_provider_error_body() -> None:
    async def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(401, json={"error": "secret provider detail"})

    async def run_search() -> None:
        async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
            await TavilySearchService(
                SecretStr("test-tavily-key"),
                client=client,
            ).search("find a supplier")

    with pytest.raises(TavilyUnavailable, match="could not be completed") as error:
        asyncio.run(run_search())

    assert "secret provider detail" not in str(error.value)
