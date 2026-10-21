from enum import StrEnum

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


class AccountRole(StrEnum):
    USER = "user"
    BUSINESS = "business"


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(min_length=1, max_length=120)
    role: AccountRole
    business_name: str | None = Field(default=None, max_length=160)

    @field_validator("display_name", "business_name", mode="before")
    @classmethod
    def trim_names(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip().lower()
        return value

    @model_validator(mode="after")
    def require_business_name_for_business_accounts(self) -> "SignUpRequest":
        if self.role is AccountRole.BUSINESS and not self.business_name:
            raise ValueError("Business name is required for a business account.")
        if self.role is AccountRole.USER and self.business_name:
            raise ValueError("Business name is only used for business accounts.")
        return self


class SignInRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)
    role: AccountRole

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip().lower()
        return value


class AuthUserResponse(BaseModel):
    user_id: str
    email: EmailStr | None
    role: AccountRole


class AuthActionResponse(AuthUserResponse):
    authenticated: bool
