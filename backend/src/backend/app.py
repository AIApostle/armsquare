from fastapi import Depends, FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware

from backend.auth import (
    AccountRole,
    AuthResponse,
    CurrentUser,
    RefreshRequest,
    SignInRequest,
    SignUpRequest,
    current_user,
    refresh,
    require_role,
    signin,
    signup,
)
from backend.config import get_settings

app = FastAPI(title="AMSquare API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth/business/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def business_signup(request: SignUpRequest) -> AuthResponse:
    return signup(request, AccountRole.BUSINESS, get_settings())


@app.post("/auth/customer/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def customer_signup(request: SignUpRequest) -> AuthResponse:
    return signup(request, AccountRole.CUSTOMER, get_settings())


@app.post("/auth/business/signin", response_model=AuthResponse)
def business_signin(request: SignInRequest) -> AuthResponse:
    return signin(request, AccountRole.BUSINESS, get_settings())


@app.post("/auth/customer/signin", response_model=AuthResponse)
def customer_signin(request: SignInRequest) -> AuthResponse:
    return signin(request, AccountRole.CUSTOMER, get_settings())


@app.post("/auth/refresh", response_model=AuthResponse)
def auth_refresh(request: RefreshRequest) -> AuthResponse:
    return refresh(request, get_settings())


@app.post("/auth/signout", status_code=status.HTTP_204_NO_CONTENT)
def auth_signout(user: CurrentUser = Depends(current_user)) -> Response:
    del user
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/auth/me", response_model=CurrentUser)
def auth_me(user: CurrentUser = Depends(current_user)) -> CurrentUser:
    return user


@app.get("/business/me", response_model=CurrentUser)
def business_me(
    user: CurrentUser = Depends(require_role(AccountRole.BUSINESS)),
) -> CurrentUser:
    return user


@app.get("/customer/me", response_model=CurrentUser)
def customer_me(
    user: CurrentUser = Depends(require_role(AccountRole.CUSTOMER)),
) -> CurrentUser:
    return user
