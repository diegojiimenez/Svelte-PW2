from bson import ObjectId
from pymongo import ReturnDocument
from app.database import get_db


async def find_all() -> list:
    cursor = get_db().products.find().sort("createdAt", -1)
    return await cursor.to_list(length=None)


async def find_by_id(product_id: str) -> dict | None:
    try:
        return await get_db().products.find_one({"_id": ObjectId(product_id)})
    except Exception:
        return None


async def create(data: dict) -> dict:
    result = await get_db().products.insert_one(data)
    return await get_db().products.find_one({"_id": result.inserted_id})


async def update(product_id: str, data: dict) -> dict | None:
    try:
        return await get_db().products.find_one_and_update(
            {"_id": ObjectId(product_id)},
            {"$set": data},
            return_document=ReturnDocument.AFTER,
        )
    except Exception:
        return None


async def delete(product_id: str) -> dict | None:
    try:
        return await get_db().products.find_one_and_delete({"_id": ObjectId(product_id)})
    except Exception:
        return None
