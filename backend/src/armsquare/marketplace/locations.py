import logging
from functools import lru_cache
from typing import Literal

import httpx
from pydantic import BaseModel, ConfigDict

logger = logging.getLogger(__name__)

PHOTON_SEARCH_URL = "https://photon.komoot.io/api/"
MAX_LOCATION_QUERY_LENGTH = 120
MAX_LOCATION_RESULTS = 5


class LocationLookupUnavailable(Exception):
    pass


class LocationProperties(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str | None = None
    city: str | None = None
    district: str | None = None
    county: str | None = None
    state: str | None = None
    country: str | None = None

    def formatted_label(self) -> str | None:
        values = (
            self.city or self.name or self.district or self.county,
            self.state,
            self.country,
        )
        label_parts: list[str] = []
        seen: set[str] = set()
        for value in values:
            normalized = value.strip() if value else ""
            if normalized and normalized.casefold() not in seen:
                label_parts.append(normalized)
                seen.add(normalized.casefold())
        label = ", ".join(label_parts)
        return label[:160] if len(label) >= 2 else None


class LocationFeature(BaseModel):
    model_config = ConfigDict(extra="ignore")

    properties: LocationProperties


class LocationFeatureCollection(BaseModel):
    model_config = ConfigDict(extra="ignore")

    features: list[LocationFeature]


class LocationSuggestion(BaseModel):
    label: str


class LocationSearchService:
    def __init__(
        self,
        *,
        client: httpx.AsyncClient | None = None,
        provider: Literal["photon"] = "photon",
    ) -> None:
        self._client = client
        self._provider = provider
        self._cache: dict[str, list[LocationSuggestion]] = {}

    async def search(self, query: str) -> list[LocationSuggestion]:
        normalized_query = query.strip()
        if not normalized_query or len(normalized_query) > MAX_LOCATION_QUERY_LENGTH:
            raise ValueError(
                f"Search for a location using 1-{MAX_LOCATION_QUERY_LENGTH} characters."
            )
        cached = self._cache.get(normalized_query.casefold())
        if cached is not None:
            return cached

        params = {"q": normalized_query, "limit": MAX_LOCATION_RESULTS, "lang": "en"}
        try:
            if self._client is None:
                async with httpx.AsyncClient(
                    timeout=httpx.Timeout(8.0, connect=3.0),
                    headers={"User-Agent": "armsquare-business-region-lookup/1.0"},
                ) as client:
                    response = await client.get(
                        PHOTON_SEARCH_URL,
                        params=params,
                    )
            else:
                response = await self._client.get(
                    PHOTON_SEARCH_URL,
                    params=params,
                )
            response.raise_for_status()
            collection = LocationFeatureCollection.model_validate(response.json())
        except httpx.HTTPStatusError as error:
            logger.warning(
                "Location provider returned HTTP status %s.",
                error.response.status_code,
            )
            raise LocationLookupUnavailable from error
        except (httpx.RequestError, ValueError) as error:
            logger.warning("Location provider request or response was invalid.")
            raise LocationLookupUnavailable from error

        suggestions: list[LocationSuggestion] = []
        seen: set[str] = set()
        for feature in collection.features:
            label = feature.properties.formatted_label()
            if label is None or label.casefold() in seen:
                continue
            suggestions.append(LocationSuggestion(label=label))
            seen.add(label.casefold())
            if len(suggestions) == MAX_LOCATION_RESULTS:
                break
        self._cache[normalized_query.casefold()] = suggestions
        return suggestions


@lru_cache
def get_location_search_service() -> LocationSearchService:
    return LocationSearchService()
