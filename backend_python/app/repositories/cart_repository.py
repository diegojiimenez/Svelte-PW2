from bson import ObjectId
from datetime import datetime
from app.database import get_db


async def find_by_user(user_id: str) -> dict | None:
    return await get_db().carts.find_one({"user": ObjectId(user_id)})


async def create_for_user(user_id: str) -> dict:
    now = datetime.utcnow()
    doc = {"user": ObjectId(user_id), "items": [], "createdAt": now, "updatedAt": now}
    result = await get_db().carts.insert_one(doc)
    return await get_db().carts.find_one({"_id": result.inserted_id})


async def save_items(cart_id: str, items: list) -> dict:
    await get_db().carts.update_one(
        {"_id": ObjectId(cart_id)},
        {"$set": {"items": items, "updatedAt": datetime.utcnow()}},
    )
    return await get_db().carts.find_one({"_id": ObjectId(cart_id)})


async def clear_items_by_user(user_id: str) -> None:
    await get_db().carts.update_one(
        {"user": ObjectId(user_id)},
        {"$set": {"items": [], "updatedAt": datetime.utcnow()}},
    )
