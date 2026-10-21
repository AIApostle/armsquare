import asyncio

import httpx
import pytest

from armsquare.marketplace.locations import (
    MAX_LOCATION_RESULTS,
    PHOTON_SEARCH_URL,
    LocationSearchService,
    LocationSuggestion,
)


def test_location_search_formats_and_deduplicates_place_results() -> None:
    request_params: dict[str, str] = {}

    async def handler(request: httpx.Request) -> httpx.Response:
        request_params.update(dict(request.url.params))
        return httpx.Response(
            200,
            json={
                "features": [
                    {
                        "properties": {
                            "name": "Boulder",
                            "city": "Boulder",
                            "state": "Colorado",
                            "country": "United States",
                            "osm_key": "place",
                        },
                        "geometry": {"type": "Point", "coordinates": [-105.27, 40.01]},
                    },
                    {
                        "properties": {
                            "name": "Boulder",
                            "city": "Boulder",
                            "state": "Colorado",
                            "country": "United States",
                        },
                        "geometry": {"type": "Point", "coordinates": [-105.27, 40.01]},
                    },
                    {
                        "properties": {
                            "name": "Boulder",
                            "state": "Utah",
                            "country": "United States",
                        },
                        "geometry": {"type": "Point", "coordinates": [-109.56, 37.91]},
                    },
                ]
            },
        )

    async def search() -> list[LocationSuggestion]:
        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler),
        ) as client:
            return await LocationSearchService(client=client).search(" Boulder ")

    results = asyncio.run(search())

    assert request_params == {
        "q": "Boulder",
        "limit": str(MAX_LOCATION_RESULTS),
        "lang": "en",
    }
    assert [result.label for result in results] == [
        "Boulder, Colorado, United States",
        "Boulder, Utah, United States",
    ]


def test_location_search_rejects_blank_and_oversized_queries() -> None:
    service = LocationSearchService()

    with pytest.raises(ValueError):
        asyncio.run(service.search(" "))
    with pytest.raises(ValueError):
        asyncio.run(service.search("x" * 121))


def test_location_search_uses_photon_and_caches_successful_results() -> None:
    calls = 0

    async def handler(request: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        assert str(request.url).startswith(PHOTON_SEARCH_URL)
        return httpx.Response(
            200,
            json={
                "features": [
                    {
                        "properties": {
                            "city": "Madison",
                            "state": "Wisconsin",
                            "country": "United States",
                        }
                    }
                ]
            },
        )

    async def search_twice() -> tuple[list[LocationSuggestion], list[LocationSuggestion]]:
        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler),
        ) as client:
            service = LocationSearchService(client=client)
            return await service.search("Madison"), await service.search(" madison ")

    first, second = asyncio.run(search_twice())

    assert calls == 1
    assert first == second
