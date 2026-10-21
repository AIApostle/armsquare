import asyncio
from types import SimpleNamespace
from typing import Any

import pytest
from pydantic import ValidationError

from armsquare.marketplace.schemas import (
    AgentConfigurationRequest,
    StoreCategory,
    StoreCreateRequest,
)
from armsquare.marketplace.service import MarketplaceService

STORE_ID = "a1000000-0000-4000-8000-000000000001"
AGENT_ID = "a2000000-0000-4000-8000-000000000001"


class FakeQuery:
    def __init__(self, table: str, rows: dict[str, list[dict[str, Any]]]) -> None:
        self.table = table
        self.rows = rows
        self.filters: list[tuple[str, Any]] = []
        self.selected = ""
        self.updated_values: dict[str, Any] | None = None

    def select(self, columns: str) -> "FakeQuery":
        self.selected = columns
        return self

    def update(self, values: dict[str, Any]) -> "FakeQuery":
        self.updated_values = values
        return self

    def in_(self, column: str, values: list[str]) -> "FakeQuery":
        self.filters.append((column, values))
        return self

    def eq(self, column: str, value: Any) -> "FakeQuery":
        self.filters.append((column, value))
        return self

    def order(self, *_args: Any, **_kwargs: Any) -> "FakeQuery":
        return self

    def limit(self, *_args: Any) -> "FakeQuery":
        return self

    async def execute(self) -> SimpleNamespace:
        rows = self.rows.get(self.table, [])
        for column, value in self.filters:
            if isinstance(value, list):
                rows = [row for row in rows if row.get(column) in value]
            else:
                rows = [row for row in rows if row.get(column) == value]
        if self.updated_values is not None:
            for row in rows:
                row.update(self.updated_values)
        return SimpleNamespace(data=rows)


class FakeClient:
    def __init__(self, rows: dict[str, list[dict[str, Any]]]) -> None:
        self.rows = rows
        self.queries: list[FakeQuery] = []

    def table(self, name: str) -> FakeQuery:
        query = FakeQuery(name, self.rows)
        self.queries.append(query)
        return query


def test_owner_store_query_is_limited_to_business_memberships() -> None:
    client = FakeClient(
        {
            "business_members": [{"business_id": STORE_ID}],
            "business_stores": [
                {
                    "id": STORE_ID,
                    "name": "Private shop",
                    "slug": "private-shop",
                    "tagline": "A private shop",
                    "description": "Owner-managed",
                    "category_id": "cycling",
                    "region": "Boulder, Colorado",
                    "image_url": None,
                    "is_published": True,
                    "is_demo": False,
                    "created_at": "2026-10-21T00:00:00Z",
                }
            ],
            "business_agents": [
                {
                    "id": AGENT_ID,
                    "business_id": STORE_ID,
                    "name": "Private assistant",
                    "capabilities": [],
                    "enabled_tools": ["catalog.read"],
                    "autonomy_level": "draft",
                    "is_paused": False,
                    "created_at": "2026-10-21T00:00:00Z",
                }
            ],
            "store_products": [],
        }
    )

    stores = asyncio.run(MarketplaceService(client).owner_stores())

    store_query = next(query for query in client.queries if query.table == "business_stores")
    assert ("id", [STORE_ID]) in store_query.filters
    assert len(stores) == 1
    assert str(stores[0].id) == STORE_ID


def test_update_store_is_scoped_to_the_requested_store() -> None:
    client = FakeClient(
        {
            "business_members": [{"business_id": STORE_ID}],
            "business_stores": [
                {
                    "id": STORE_ID,
                    "name": "Old name",
                    "slug": "old-name",
                    "tagline": "A private shop",
                    "description": "Owner-managed",
                    "category_id": "cycling",
                    "region": "Boulder, Colorado",
                    "image_url": None,
                    "is_published": False,
                    "is_demo": False,
                    "created_at": "2026-10-21T00:00:00Z",
                }
            ],
            "business_agents": [
                {
                    "id": AGENT_ID,
                    "business_id": STORE_ID,
                    "name": "Private assistant",
                    "capabilities": [],
                    "enabled_tools": ["catalog.read"],
                    "autonomy_level": "draft",
                    "is_paused": False,
                    "created_at": "2026-10-21T00:00:00Z",
                }
            ],
            "store_products": [],
        }
    )
    request = StoreCreateRequest(
        name="Updated shop",
        tagline="A private shop",
        description="Owner-managed",
        categoryId=StoreCategory.CYCLING,
        region="Boulder, Colorado",
    )

    store = asyncio.run(MarketplaceService(client).update_store(STORE_ID, request))

    update_query = next(
        query
        for query in client.queries
        if query.table == "business_stores" and query.updated_values is not None
    )
    assert update_query.filters == [("id", STORE_ID)]
    assert store is not None
    assert store.name == "Updated shop"


def test_agent_configuration_rejects_empty_or_duplicate_tool_sets() -> None:
    with pytest.raises(ValidationError):
        AgentConfigurationRequest(enabledTools=[])

    with pytest.raises(ValidationError):
        AgentConfigurationRequest(
            enabledTools=["catalog.read", "catalog.read"],
        )


def test_agent_configuration_rejects_unknown_or_unbounded_permissions() -> None:
    with pytest.raises(ValidationError):
        AgentConfigurationRequest(enabledTools=["orders.execute"])

    with pytest.raises(ValidationError):
        AgentConfigurationRequest(autonomyLevel="execute_within_limits")


def test_agent_configuration_accepts_public_web_research_as_a_scoped_tool() -> None:
    configuration = AgentConfigurationRequest(enabledTools=["web.research"])

    assert configuration.enabled_tools == ["web.research"]
