from bson import ObjectId
from app.database import get_db


async def find_by_email(email: str) -> dict | None:
    return await get_db().users.find_one({"email": email.lower()})


async def find_by_id(user_id: str) -> dict | None:
    try:
        return await get_db().users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None


async def find_all() -> list:
    cursor = get_db().users.find({}, {"password": 0}).sort("createdAt", -1)
    return await cursor.to_list(length=None)


async def create(data: dict) -> dict:
    result = await get_db().users.insert_one(data)
    return await get_db().users.find_one({"_id": result.inserted_id})


async def update(user_id: str, data: dict) -> dict | None:
    from pymongo import ReturnDocument
    try:
        return await get_db().users.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": data},
            return_document=ReturnDocument.AFTER,
            projection={"password": 0},
        )
    except Exception:
        return None


async def delete(user_id: str) -> dict | None:
    try:
        return await get_db().users.find_one_and_delete(
            {"_id": ObjectId(user_id)},
            projection={"password": 0},
        )
    except Exception:
        return None
