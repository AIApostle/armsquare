from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, status
from supabase._async.client import AsyncClient
from supabase_auth.errors import AuthError

from armsquare.core.config import Settings, get_settings
from armsquare.identity.router import ACCESS_COOKIE, get_auth_service
from armsquare.identity.schemas import AccountRole
from armsquare.identity.service import (
    AuthIdentity,
    AuthProfileMissing,
    AuthProfileUnavailable,
    AuthProviderUnavailable,
    AuthService,
)
from supabase import create_async_client

from .locations import (
    LocationLookupUnavailable,
    LocationSearchService,
    LocationSuggestion,
    get_location_search_service,
)
from .schemas import (
    AgentConfigurationRequest,
    BusinessDeskPatch,
    BusinessDeskResponse,
    CategoryResponse,
    ProductCreateRequest,
    ProductPublishRequest,
    ProductResponse,
    PublicBusinessResponse,
    StoreAgentResponse,
    StoreCreateRequest,
    StorefrontResponse,
    StorePublishRequest,
    StoreResponse,
)
from .service import (
    MarketplaceAccessDenied,
    MarketplaceService,
    MarketplaceUnavailable,
)

router = APIRouter(tags=["marketplace"])


async def get_marketplace_client(
    settings: Annotated[Settings, Depends(get_settings)],
    access_token: Annotated[str | None, Cookie(alias=ACCESS_COOKIE)] = None,
) -> AsyncIterator[AsyncClient]:
    project_url = str(settings.supabase_url) if settings.supabase_url else ""
    anon_key = settings.supabase_anon_key.get_secret_value()
    if not project_url or not anon_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Shop data is not configured. Set SUPABASE_PROJECT_URL and "
                "SUPABASE_ANON_KEY in the backend environment."
            ),
        )

    client = await create_async_client(project_url, anon_key)
    if access_token:
        client.postgrest.auth(access_token)
    try:
        yield client
    finally:
        await client.auth.close()
        await client.postgrest.aclose()
        await client.realtime.close()


async def require_business_identity(
    auth: Annotated[AuthService, Depends(get_auth_service)],
    access_token: Annotated[str | None, Cookie(alias=ACCESS_COOKIE)] = None,
) -> AuthIdentity:
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sign in to continue.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        identity = await auth.get_current_user(access_token)
    except AuthProviderUnavailable as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is temporarily unavailable.",
        ) from error
    except (AuthProfileMissing, AuthProfileUnavailable, AuthError) as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session could not be verified.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from error

    if identity.role is not AccountRole.BUSINESS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="A business account is required.",
        )
    return identity


def marketplace_service(
    client: Annotated[AsyncClient, Depends(get_marketplace_client)],
) -> MarketplaceService:
    return MarketplaceService(client)


def location_search_service() -> LocationSearchService:
    return get_location_search_service()


def handle_marketplace_error(error: MarketplaceUnavailable) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=str(error),
    )


def handle_access_error(error: MarketplaceAccessDenied) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="This business account is not allowed to perform that operation.",
    )


@router.get("/v1/market/categories", response_model=list[CategoryResponse])
async def get_categories(
    service: Annotated[MarketplaceService, Depends(marketplace_service)],
) -> list[CategoryResponse]:
    return await service.categories()


@router.get(
    "/v1/business/locations/search",
    response_model=list[LocationSuggestion],
    dependencies=[Depends(require_business_identity)],
)
async def search_business_locations(
    q: str,
    service: Annotated[LocationSearchService, Depends(location_search_service)],
) -> list[LocationSuggestion]:
    try:
        return await service.search(q)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)) from error
    except LocationLookupUnavailable as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="We couldn't look up locations right now. Please try again in a moment.",
        ) from error


@router.get("/v1/market/businesses", response_model=list[PublicBusinessResponse])
async def get_businesses(
    service: Annotated[MarketplaceService, Depends(marketplace_service)],
) -> list[PublicBusinessResponse]:
    try:
        return await service.public_businesses()
    except MarketplaceUnavailable as error:
        raise handle_marketplace_error(error) from error


@router.get("/v1/market/businesses/{store_id}", response_model=StorefrontResponse)
async def get_business(
    store_id: str,
    service: Annotated[MarketplaceService, Depends(marketplace_service)],
) -> StorefrontResponse:
    try:
        storefront = await service.public_store(store_id)
    except MarketplaceUnavailable as error:
        raise handle_marketplace_error(error) from error
    if storefront is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This shop is not available.",
        )
    return storefront


@router.get(
    "/v1/business/stores",
    response_model=list[StoreResponse],
    dependencies=[Depends(require_business_identity)],
)
async def get_owner_stores(
    service: Annotated[MarketplaceService, Depends(marketplace_service)],
) -> list[StoreResponse]:
    try:
        return await service.owner_stores()
    except MarketplaceAccessDenied as error:
        raise handle_access_error(error) from error
    except MarketplaceUnavailable as error:
        raise handle_marketplace_error(error) from error


@router.post(
    "/v1/business/stores",
    response_model=StoreResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_business_identity)],
)
async def create_owner_store(
    request: StoreCreateRequest,
    service: Annotated[MarketplaceService, Depends(marketplace_service)],
) -> StoreResponse:
    try:
        return await service.create_store(request)
    except MarketplaceAccessDenied as error:
        raise handle_access_error(error) from error
    except MarketplaceUnavailable as error:
        raise handle_marketplace_error(error) from error


@router.patch(
    "/v1/business/stores/{store_id}",
    response_model=StoreResponse,
    dependencies=[Depends(require_business_identity)],
)
async def publish_store(
    store_id: str,
    request: StorePublishRequest,
    service: Annotated[MarketplaceService, Depends(marketplace_service)],
) -> StoreResponse:
    try:
        store = await service.set_store_published(store_id, request.is_published)
    except MarketplaceAccessDenied as error:
        raise handle_access_error(error) from error
    except MarketplaceUnavailable as error:
        raise handle_marketplace_error(error) from error
    if store is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shop not found.")
    return store


@router.patch(
    "/v1/business/stores/{store_id}/details",
    response_model=StoreResponse,
    dependencies=[Depends(require_business_identity)],
)
async def update_store_details(
    store_id: str,
    request: StoreCreateRequest,
    service: Annotated[MarketplaceService, Depends(marketplace_service)],
) -> StoreResponse:
    try:
        store = await service.update_store(store_id, request)
    except MarketplaceAccessDenied as error:
        raise handle_access_error(error) from error
    except MarketplaceUnavailable as error:
        raise handle_marketplace_error(error) from error
    if store is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shop not found.")
    return store


@router.patch(
    "/v1/business/stores/{store_id}/agent",
    response_model=StoreAgentResponse,
    dependencies=[Depends(require_business_identity)],
)
async def update_store_agent(
    store_id: str,
    request: AgentConfigurationRequest,
    service: Annotated[MarketplaceService, Depends(marketplace_service)],
) -> StoreAgentResponse:
    try:
        agent = await service.update_agent_configuration(
            store_id,
            request.model_dump(exclude_unset=True, exclude_none=True),
        )
    except MarketplaceAccessDenied as error:
        raise handle_access_error(error) from error
    except MarketplaceUnavailable as error:
        raise handle_marketplace_error(error) from error
    if agent is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assistant not found.")
    return agent


@router.post(
    "/v1/business/stores/{store_id}/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_business_identity)],
)
async def create_product(
    store_id: str,
    request: ProductCreateRequest,
    service: Annotated[MarketplaceService, Depends(marketplace_service)],
) -> ProductResponse:
    try:
        product = await service.create_product(store_id, request)
    except MarketplaceAccessDenied as error:
        raise handle_access_error(error) from error
    except MarketplaceUnavailable as error:
        raise handle_marketplace_error(error) from error
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shop not found.")
    return product


@router.patch(
    "/v1/business/products/{product_id}",
    response_model=ProductResponse,
    dependencies=[Depends(require_business_identity)],
)
async def publish_product(
    product_id: str,
    request: ProductPublishRequest,
    service: Annotated[MarketplaceService, Depends(marketplace_service)],
) -> ProductResponse:
    try:
        product = await service.set_product_published(product_id, request.is_published)
    except MarketplaceAccessDenied as error:
        raise handle_access_error(error) from error
    except MarketplaceUnavailable as error:
        raise handle_marketplace_error(error) from error
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    return product


@router.patch(
    "/v1/business/products/{product_id}/details",
    response_model=ProductResponse,
    dependencies=[Depends(require_business_identity)],
)
async def update_product_details(
    product_id: str,
    request: ProductCreateRequest,
    service: Annotated[MarketplaceService, Depends(marketplace_service)],
) -> ProductResponse:
    try:
        product = await service.update_product(product_id, request)
    except MarketplaceAccessDenied as error:
        raise handle_access_error(error) from error
    except MarketplaceUnavailable as error:
        raise handle_marketplace_error(error) from error
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    return product


@router.get(
    "/v1/business/desk",
    response_model=BusinessDeskResponse,
    dependencies=[Depends(require_business_identity)],
)
async def get_business_desk(
    service: Annotated[MarketplaceService, Depends(marketplace_service)],
) -> BusinessDeskResponse:
    try:
        desk = await service.business_desk()
    except MarketplaceAccessDenied as error:
        raise handle_access_error(error) from error
    except MarketplaceUnavailable as error:
        raise handle_marketplace_error(error) from error
    if desk is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Create a shop to set up your business agent.",
        )
    return desk


@router.patch(
    "/v1/business/desk",
    response_model=BusinessDeskResponse,
    dependencies=[Depends(require_business_identity)],
)
async def update_business_desk(
    request: BusinessDeskPatch,
    service: Annotated[MarketplaceService, Depends(marketplace_service)],
) -> BusinessDeskResponse:
    try:
        stores = await service.owner_stores()
        if not stores:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Create a shop to set up your business agent.",
            )
        if not await service.set_agent_paused(str(stores[0].id), request.paused):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Business agent not found.",
            )
        desk = await service.business_desk()
    except MarketplaceAccessDenied as error:
        raise handle_access_error(error) from error
    except MarketplaceUnavailable as error:
        raise handle_marketplace_error(error) from error
    if desk is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shop not found.")
    return desk
