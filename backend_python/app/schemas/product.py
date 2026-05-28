from pydantic import BaseModel
from typing import List, Literal, Optional


class ProductColor(BaseModel):
    name: str
    hex: str


class ProductCreate(BaseModel):
    name: str
    price: float
    status: Literal["active", "inactive"] = "active"
    category: str
    image: str
    imageAlt: Optional[str] = None
    colors: List[ProductColor] = []
    sizes: List[str] = []
    description: str
    quantity: int = 0


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    status: Optional[Literal["active", "inactive"]] = None
    category: Optional[str] = None
    image: Optional[str] = None
    imageAlt: Optional[str] = None
    colors: Optional[List[ProductColor]] = None
    sizes: Optional[List[str]] = None
    description: Optional[str] = None
    quantity: Optional[int] = None
