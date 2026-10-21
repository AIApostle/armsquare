import logging
from typing import Any, NoReturn

import httpx
from postgrest.exceptions import APIError
from supabase._async.client import AsyncClient

from .schemas import (
    BusinessDeskResponse,
    CategoryResponse,
    ProductCreateRequest,
    ProductResponse,
    PublicBusinessResponse,
    StoreAgentResponse,
    StoreCategory,
    StoreCreateRequest,
    StorefrontResponse,
    StoreResponse,
    TrustResponse,
)

logger = logging.getLogger(__name__)

CATEGORIES = [
    CategoryResponse(id=category, name=name)
    for category, name in (
        (StoreCategory.SKIN_CARE, "Skin care"),
        (StoreCategory.ARTS_AND_CRAFTS, "Arts and crafts"),
        (StoreCategory.CYCLING, "Cycling"),
    )
]
STORE_COLUMNS = (
    "id,name,slug,tagline,description,category_id,region,image_url,"
    "is_published,is_demo,created_at"
)


class MarketplaceUnavailable(Exception):
    pass


class MarketplaceAccessDenied(Exception):
    pass


def _raise_database_error(error: APIError | httpx.RequestError) -> NoReturn:
    if isinstance(error, APIError):
        if error.code in {"42501", "PGRST301"}:
            raise MarketplaceAccessDenied(
                "The signed-in account is not allowed to perform this operation."
            ) from error
        if error.code in {"PGRST202", "PGRST205", "42P01", "42883"}:
            logger.error(
                "Marketplace database setup is incomplete (database error code: %s).",
                error.code,
            )
            raise MarketplaceUnavailable(
                "Shop setup is incomplete. The business storefront database migration "
                "has not been applied. Apply the reviewed storefront migration, then try again."
            ) from error
        logger.error(
            "Marketplace database request failed (database error code: %s).",
            error.code,
        )
    else:
        logger.error("Marketplace database service could not be reached.")
    raise MarketplaceUnavailable(
        "We couldn't save your shop right now. Please try again in a moment."
    ) from error


def _product(row: dict[str, Any]) -> ProductResponse:
    return ProductResponse(
        id=row["id"],
        business_id=row["business_id"],
        name=row["name"],
        description=row["description"],
        price={
            "amount": float(row["price"]),
            "currency": row.get("currency", "USD"),
        },
        unit=row["unit"],
        availability=row["availability"],
        delivery=row["delivery"],
        image_url=row.get("image_url"),
        is_published=row["is_published"],
        created_by_agent=row.get("created_by_agent", False),
        created_at=row["created_at"],
    )


def _agent(row: dict[str, Any] | None) -> StoreAgentResponse:
    if row is None:
        raise MarketplaceUnavailable("A store is missing its agent profile.")
    return StoreAgentResponse(
        id=row["id"],
        name=row["name"],
        capabilities=row["capabilities"],
        enabled_tools=row.get("enabled_tools", []),
        autonomy_level=row["autonomy_level"],
        is_paused=row["is_paused"],
        available=not row["is_paused"],
        created_at=row["created_at"],
    )


class MarketplaceService:
    def __init__(self, client: AsyncClient) -> None:
        self._client = client

    async def categories(self) -> list[CategoryResponse]:
        return CATEGORIES

    async def public_businesses(self) -> list[PublicBusinessResponse]:
        try:
            stores = (
                await self._client.table("business_stores")
                .select(STORE_COLUMNS)
                .eq("is_published", True)
                .order("created_at", desc=True)
                .execute()
            ).data
            if not stores:
                return []
            store_ids = [store["id"] for store in stores]
            agents = (
                await self._client.table("business_agents")
                .select(
                    "id,business_id,name,capabilities,autonomy_level,is_paused,created_at"
                )
                .in_("business_id", store_ids)
                .execute()
            ).data
        except (APIError, httpx.RequestError) as error:
            _raise_database_error(error)

        agent_by_business = {agent["business_id"]: agent for agent in agents}
        return [
            PublicBusinessResponse(
                id=store["id"],
                name=store["name"],
                tagline=store["tagline"],
                category_ids=[store["category_id"]],
                region=store["region"],
                verification="unverified",
                image_url=store.get("image_url"),
                is_demo=store["is_demo"],
                agent=_agent(agent_by_business.get(store["id"])),
                trust=TrustResponse(
                    orders_fulfilled=0,
                    on_time_rate=None,
                    disputes=0,
                    member_since=store["created_at"],
                ),
                claims=[],
            )
            for store in stores
        ]

    async def public_store(self, store_id: str) -> StorefrontResponse | None:
        try:
            stores = (
                await self._client.table("business_stores")
                .select(STORE_COLUMNS)
                .eq("id", store_id)
                .eq("is_published", True)
                .limit(1)
                .execute()
            ).data
            if not stores:
                return None
            store = stores[0]
            agents = (
                await self._client.table("business_agents")
                .select(
                    "id,business_id,name,capabilities,autonomy_level,is_paused,created_at"
                )
                .eq("business_id", store_id)
                .limit(1)
                .execute()
            ).data
            products = (
                await self._client.table("store_products")
                .select("*")
                .eq("business_id", store_id)
                .eq("is_published", True)
                .order("created_at", desc=True)
                .execute()
            ).data
        except (APIError, httpx.RequestError) as error:
            _raise_database_error(error)

        agent = _agent(agents[0] if agents else None)
        business = PublicBusinessResponse(
            id=store["id"],
            name=store["name"],
            tagline=store["tagline"],
            category_ids=[store["category_id"]],
            region=store["region"],
            verification="unverified",
            image_url=store.get("image_url"),
            is_demo=store["is_demo"],
            agent=agent,
            trust=TrustResponse(
                orders_fulfilled=0,
                on_time_rate=None,
                disputes=0,
                member_since=store["created_at"],
            ),
            claims=[],
        )
        return StorefrontResponse(
            business=business,
            listings=[_product(product) for product in products],
        )

    async def search_public_products(self, query: str) -> list[dict[str, Any]]:
        normalized_query = query.strip().casefold()
        if not normalized_query:
            return []
        try:
            stores = (
                await self._client.table("business_stores")
                .select("id,name,slug")
                .eq("is_published", True)
                .limit(100)
                .execute()
            ).data
            if not stores:
                return []
            store_by_id = {store["id"]: store for store in stores}
            products = (
                await self._client.table("store_products")
                .select("id,business_id,name,description,price,currency,unit,availability,delivery")
                .in_("business_id", list(store_by_id))
                .eq("is_published", True)
                .limit(500)
                .execute()
            ).data
        except (APIError, httpx.RequestError) as error:
            _raise_database_error(error)

        matches = []
        for product in products:
            if normalized_query not in (
                f"{product['name']} {product['description']} {store_by_id[product['business_id']]['name']}"
            ).casefold():
                continue
            matches.append(
                {
                    **product,
                    "price": {
                        "amount": float(product["price"]),
                        "currency": product["currency"],
                    },
                    "store": store_by_id[product["business_id"]],
                }
            )
            if len(matches) == 20:
                break
        return matches

    async def owner_stores(self) -> list[StoreResponse]:
        try:
            memberships = (
                await self._client.table("business_members")
                .select("business_id")
                .execute()
            ).data
            store_ids = list(dict.fromkeys(member["business_id"] for member in memberships))
            if not store_ids:
                return []
            stores = (
                await self._client.table("business_stores")
                .select(STORE_COLUMNS)
                .in_("id", store_ids)
                .order("created_at", desc=True)
                .execute()
            ).data
            if not stores:
                return []
            store_ids = [store["id"] for store in stores]
            agents = (
                await self._client.table("business_agents")
                .select("*")
                .in_("business_id", store_ids)
                .execute()
            ).data
            products = (
                await self._client.table("store_products")
                .select("*")
                .in_("business_id", store_ids)
                .order("created_at", desc=True)
                .execute()
            ).data
        except (APIError, httpx.RequestError) as error:
            _raise_database_error(error)

        agents_by_store = {agent["business_id"]: agent for agent in agents}
        products_by_store: dict[str, list[ProductResponse]] = {}
        for product in products:
            products_by_store.setdefault(product["business_id"], []).append(_product(product))
        return [
            StoreResponse(
                **store,
                agent=_agent(agents_by_store.get(store["id"])),
                products=products_by_store.get(store["id"], []),
            )
            for store in stores
        ]

    async def create_store(self, request: StoreCreateRequest) -> StoreResponse:
        try:
            response = await self._client.rpc(
                "create_business_store",
                {
                    "p_name": request.name,
                    "p_tagline": request.tagline,
                    "p_description": request.description,
                    "p_category_id": request.category_id.value,
                    "p_region": request.region,
                    "p_image_url": str(request.image_url) if request.image_url else None,
                    "p_is_published": request.is_published,
                },
            ).execute()
        except (APIError, httpx.RequestError) as error:
            _raise_database_error(error)

        store_id = response.data
        stores = await self.owner_stores()
        created = next((store for store in stores if str(store.id) == str(store_id)), None)
        if created is None:
            raise MarketplaceUnavailable("The created store could not be loaded.")
        return created

    async def set_store_published(self, store_id: str, is_published: bool) -> StoreResponse | None:
        try:
            result = (
                await self._client.table("business_stores")
                .update({"is_published": is_published})
                .eq("id", store_id)
                .select("id")
                .execute()
            ).data
        except (APIError, httpx.RequestError) as error:
            _raise_database_error(error)
        if not result:
            return None
        stores = await self.owner_stores()
        return next((store for store in stores if str(store.id) == store_id), None)

    async def update_store(
        self,
        store_id: str,
        request: StoreCreateRequest,
    ) -> StoreResponse | None:
        try:
            result = (
                await self._client.table("business_stores")
                .update(
                    {
                        "name": request.name,
                        "tagline": request.tagline,
                        "description": request.description,
                        "category_id": request.category_id.value,
                        "region": request.region,
                        "image_url": str(request.image_url) if request.image_url else None,
                    }
                )
                .eq("id", store_id)
                .select("id")
                .execute()
            ).data
        except (APIError, httpx.RequestError) as error:
            _raise_database_error(error)
        if not result:
            return None
        stores = await self.owner_stores()
        return next((store for store in stores if str(store.id) == store_id), None)

    async def create_product(
        self,
        store_id: str,
        request: ProductCreateRequest,
        *,
        created_by_agent: bool = False,
    ) -> ProductResponse | None:
        store = await self._store_is_accessible(store_id)
        if not store:
            return None
        try:
            products = (
                await self._client.table("store_products")
                .insert(
                    {
                        "business_id": store_id,
                        "name": request.name,
                        "description": request.description,
                        "price": str(request.price),
                        "unit": request.unit,
                        "availability": request.availability.value,
                        "delivery": request.delivery,
                        "image_url": str(request.image_url) if request.image_url else None,
                        "is_published": False if created_by_agent else request.is_published,
                        "created_by_agent": created_by_agent,
                    }
                )
                .select("*")
                .execute()
            ).data
        except (APIError, httpx.RequestError) as error:
            _raise_database_error(error)
        return _product(products[0]) if products else None

    async def set_product_published(
        self, product_id: str, is_published: bool
    ) -> ProductResponse | None:
        try:
            products = (
                await self._client.table("store_products")
                .update({"is_published": is_published})
                .eq("id", product_id)
                .select("*")
                .execute()
            ).data
        except (APIError, httpx.RequestError) as error:
            _raise_database_error(error)
        return _product(products[0]) if products else None

    async def update_product(
        self,
        product_id: str,
        request: ProductCreateRequest,
    ) -> ProductResponse | None:
        try:
            products = (
                await self._client.table("store_products")
                .update(
                    {
                        "name": request.name,
                        "description": request.description,
                        "price": str(request.price),
                        "unit": request.unit,
                        "availability": request.availability.value,
                        "delivery": request.delivery,
                        "image_url": str(request.image_url) if request.image_url else None,
                    }
                )
                .eq("id", product_id)
                .select("*")
                .execute()
            ).data
        except (APIError, httpx.RequestError) as error:
            _raise_database_error(error)
        return _product(products[0]) if products else None

    async def set_agent_paused(self, store_id: str, paused: bool) -> bool:
        try:
            result = (
                await self._client.table("business_agents")
                .update({"is_paused": paused})
                .eq("business_id", store_id)
                .select("id")
                .execute()
            ).data
        except (APIError, httpx.RequestError) as error:
            _raise_database_error(error)
        return bool(result)

    async def update_agent_configuration(
        self,
        store_id: str,
        changes: dict[str, Any],
    ) -> StoreAgentResponse | None:
        try:
            agents = (
                await self._client.table("business_agents")
                .update(changes)
                .eq("business_id", store_id)
                .select("*")
                .execute()
            ).data
        except (APIError, httpx.RequestError) as error:
            _raise_database_error(error)
        return _agent(agents[0]) if agents else None

    async def business_desk(self) -> BusinessDeskResponse | None:
        stores = await self.owner_stores()
        if not stores:
            return None
        store = stores[0]
        try:
            profiles = (
                await self._client.table("profiles")
                .select("display_name")
                .limit(1)
                .execute()
            ).data
        except (APIError, httpx.RequestError) as error:
            _raise_database_error(error)

        owner_name = profiles[0]["display_name"] if profiles else "Business owner"
        return BusinessDeskResponse(
            business={"id": str(store.id), "name": store.name},
            owner={
                "name": owner_name,
                "initials": "".join(part[0] for part in owner_name.split()[:2]).upper(),
            },
            agent={
                "id": str(store.agent.id),
                "name": store.agent.name,
                "principal": store.name,
                "kind": "business",
                "verified": False,
            },
            autonomy=store.agent.autonomy_level,
            paused=store.agent.is_paused,
        )

    async def _store_is_accessible(self, store_id: str) -> bool:
        try:
            result = (
                await self._client.table("business_members")
                .select("business_id")
                .eq("business_id", store_id)
                .limit(1)
                .execute()
            ).data
        except (APIError, httpx.RequestError) as error:
            _raise_database_error(error)
        return bool(result)

    async def require_agent_tool(
        self,
        store_id: str,
        tool_name: str,
        allowed_roles: set[str],
    ) -> StoreResponse:
        stores = await self.owner_stores()
        store = next((item for item in stores if str(item.id) == store_id), None)
        if store is None:
            raise MarketplaceAccessDenied("The selected shop is not available to this account.")
        if store.agent.is_paused:
            raise MarketplaceAccessDenied("This shop assistant is paused.")
        if tool_name not in store.agent.enabled_tools:
            raise MarketplaceAccessDenied("This action is not enabled for the shop assistant.")
        if tool_name == "product.create_draft" and store.agent.autonomy_level != "draft":
            raise MarketplaceAccessDenied(
                "The shop assistant does not have draft permission."
            )
        try:
            memberships = (
                await self._client.table("business_members")
                .select("role")
                .eq("business_id", store_id)
                .limit(1)
                .execute()
            ).data
        except (APIError, httpx.RequestError) as error:
            _raise_database_error(error)
        if not memberships or memberships[0]["role"] not in allowed_roles:
            raise MarketplaceAccessDenied("This account cannot use that shop assistant action.")
        return store
