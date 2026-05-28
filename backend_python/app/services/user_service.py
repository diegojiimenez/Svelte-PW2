from datetime import datetime

from app.repositories import user_repository
from app.services.auth_service import serialize_user


async def get_all() -> list:
    users = await user_repository.find_all()
    return [serialize_user(u) for u in users]


async def get_by_id(user_id: str) -> dict:
    user = await user_repository.find_by_id(user_id)
    if not user:
        raise ValueError("Usuario no encontrado")
    return serialize_user(user)


async def update(user_id: str, data: dict) -> dict:
    clean = {k: v for k, v in data.items() if v is not None}
    clean["updatedAt"] = datetime.utcnow()
    updated = await user_repository.update(user_id, clean)
    if not updated:
        raise ValueError("Usuario no encontrado")
    return serialize_user(updated)


async def delete(user_id: str) -> dict:
    deleted = await user_repository.delete(user_id)
    if not deleted:
        raise ValueError("Usuario no encontrado")
    return serialize_user(deleted)
