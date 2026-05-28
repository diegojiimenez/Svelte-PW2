from pydantic import BaseModel, Field, field_validator


class CartItemColor(BaseModel):
    name: str
    hex: str

    @field_validator("name", "hex")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("no puede estar vacío")
        return v


class AddItemRequest(BaseModel):
    productId: str
    quantity: int = Field(default=1, ge=1, description="Cantidad debe ser >= 1")
    size: str
    color: CartItemColor

    @field_validator("productId", "size")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("no puede estar vacío")
        return v


class UpdateItemRequest(BaseModel):
    quantity: int = Field(ge=1, description="Cantidad debe ser >= 1")
