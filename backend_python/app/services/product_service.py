from bson import ObjectId
from datetime import datetime

from app.repositories import product_repository


def _to_dto(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc.get("name"),
        "price": doc.get("price"),
        "status": doc.get("status"),
        "category": doc.get("category"),
        "image": doc.get("image"),
        "imageAlt": doc.get("imageAlt"),
        "colors": doc.get("colors", []),
        "sizes": doc.get("sizes", []),
        "description": doc.get("description"),
        "quantity": doc.get("quantity", 0),
    }


async def get_all() -> list:
    products = await product_repository.find_all()
    return [_to_dto(p) for p in products]


async def get_by_id(product_id: str) -> dict:
    product = await product_repository.find_by_id(product_id)
    if not product:
        raise ValueError("Producto no encontrado")
    return _to_dto(product)


async def create(data: dict, created_by: str | None = None) -> dict:
    now = datetime.utcnow()
    doc = {**data, "createdAt": now, "updatedAt": now}
    if created_by:
        doc["createdBy"] = ObjectId(created_by)
    created = await product_repository.create(doc)
    return _to_dto(created)


async def update(product_id: str, data: dict) -> dict:
    clean = {k: v for k, v in data.items() if v is not None}
    clean["updatedAt"] = datetime.utcnow()
    updated = await product_repository.update(product_id, clean)
    if not updated:
        raise ValueError("Producto no encontrado")
    return _to_dto(updated)


async def delete(product_id: str) -> dict:
    deleted = await product_repository.delete(product_id)
    if not deleted:
        raise ValueError("Producto no encontrado")
    return _to_dto(deleted)
