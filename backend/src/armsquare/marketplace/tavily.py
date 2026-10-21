import logging

import httpx
from pydantic import BaseModel, ConfigDict, HttpUrl, SecretStr, ValidationError

logger = logging.getLogger(__name__)

TAVILY_SEARCH_URL = "https://api.tavily.com/search"
MAX_QUERY_LENGTH = 300
MAX_RESULTS = 5
MAX_CONTENT_LENGTH = 1200


class TavilyUnavailable(Exception):
    pass


class TavilyResult(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str
    url: HttpUrl
    content: str
    published_date: str | None = None


class TavilySearchResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    results: list[TavilyResult]


class TavilySearchService:
    def __init__(
        self,
        api_key: SecretStr | None,
        *,
        client: httpx.AsyncClient | None = None,
    ) -> None:
        self._api_key = api_key
        self._client = client

    async def search(self, query: str) -> list[dict[str, str | None]]:
        normalized_query = query.strip()
        if not normalized_query or len(normalized_query) > MAX_QUERY_LENGTH:
            raise ValueError(f"Search queries must be 1-{MAX_QUERY_LENGTH} characters.")
        if self._api_key is None or not self._api_key.get_secret_value():
            raise TavilyUnavailable("Public web research is not configured.")

        payload = {
            "query": normalized_query,
            "topic": "general",
            "search_depth": "basic",
            "max_results": MAX_RESULTS,
            "include_answer": False,
            "include_raw_content": False,
        }
        headers = {
            "Authorization": f"Bearer {self._api_key.get_secret_value()}",
        }
        try:
            if self._client is None:
                async with httpx.AsyncClient(
                    timeout=httpx.Timeout(12.0, connect=3.0)
                ) as client:
                    response = await client.post(
                        TAVILY_SEARCH_URL,
                        json=payload,
                        headers=headers,
                    )
            else:
                response = await self._client.post(
                    TAVILY_SEARCH_URL,
                    json=payload,
                    headers=headers,
                )
            response.raise_for_status()
            search_response = TavilySearchResponse.model_validate(response.json())
        except httpx.HTTPStatusError as error:
            logger.warning("Tavily search returned HTTP status %s.", error.response.status_code)
            raise TavilyUnavailable("Public web research could not be completed.") from error
        except (httpx.RequestError, ValueError, ValidationError) as error:
            logger.warning("Tavily search request or response was invalid.")
            raise TavilyUnavailable("Public web research could not be completed.") from error

        return [
            {
                "title": result.title[:300],
                "url": str(result.url),
                "snippet": result.content[:MAX_CONTENT_LENGTH],
                "publishedDate": result.published_date,
            }
            for result in search_response.results[:MAX_RESULTS]
        ]
