import re

from pydantic import BaseModel, Field, field_validator
from typing import List, Literal, Optional

_HEX_RE = re.compile(r"^#[0-9A-Fa-f]{3}(?:[0-9A-Fa-f]{3})?$")


class ProductColor(BaseModel):
    name: str
    hex: str

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("el nombre del color no puede estar vacío")
        return v

    @field_validator("hex")
    @classmethod
    def hex_format(cls, v: str) -> str:
        if not _HEX_RE.match(v):
            raise ValueError("debe ser un color hexadecimal válido (ej. #fff o #ffffff)")
        return v.lower()


class ProductCreate(BaseModel):
    name: str
    price: float = Field(ge=0, description="Precio debe ser >= 0")
    status: Literal["active", "inactive"] = "active"
    category: str
    image: str
    imageAlt: Optional[str] = None
    colors: List[ProductColor] = []
    sizes: List[str] = []
    description: str
    quantity: int = Field(default=0, ge=0, description="Stock debe ser >= 0")

    @field_validator("name", "category", "image", "description")
    @classmethod
    def not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("no puede estar vacío")
        return v


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = Field(default=None, ge=0)
    status: Optional[Literal["active", "inactive"]] = None
    category: Optional[str] = None
    image: Optional[str] = None
    imageAlt: Optional[str] = None
    colors: Optional[List[ProductColor]] = None
    sizes: Optional[List[str]] = None
    description: Optional[str] = None
    quantity: Optional[int] = Field(default=None, ge=0)

    @field_validator("name", "category", "image", "description")
    @classmethod
    def not_blank(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("no puede estar vacío")
        return v
