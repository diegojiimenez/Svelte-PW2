from bson import ObjectId
from datetime import datetime
from pymongo import ReturnDocument
from app.database import get_db


async def find_by_user(user_id: str) -> list:
    cursor = get_db().orders.find({"user": ObjectId(user_id)}).sort("createdAt", -1)
    return await cursor.to_list(length=None)


async def find_all_with_user() -> list:
    pipeline = [
        {"$sort": {"createdAt": -1}},
        {
            "$lookup": {
                "from": "users",
                "localField": "user",
                "foreignField": "_id",
                "as": "userDoc",
            }
        },
        {"$unwind": {"path": "$userDoc", "preserveNullAndEmptyArrays": True}},
    ]
    cursor = get_db().orders.aggregate(pipeline)
    return await cursor.to_list(length=None)


async def update_status(order_number: str, status: str) -> dict | None:
    return await get_db().orders.find_one_and_update(
        {"orderNumber": order_number},
        {"$set": {"status": status, "updatedAt": datetime.utcnow()}},
        return_document=ReturnDocument.AFTER,
    )


async def create(data: dict) -> dict:
    result = await get_db().orders.insert_one(data)
    return await get_db().orders.find_one({"_id": result.inserted_id})


async def count() -> int:
    return await get_db().orders.count_documents({})
