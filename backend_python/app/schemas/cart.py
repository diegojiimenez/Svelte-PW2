from pydantic import BaseModel


class CartItemColor(BaseModel):
    name: str
    hex: str


class AddItemRequest(BaseModel):
    productId: str
    quantity: int = 1
    size: str
    color: CartItemColor


class UpdateItemRequest(BaseModel):
    quantity: int
