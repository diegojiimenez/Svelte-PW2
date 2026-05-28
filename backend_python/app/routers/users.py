from fastapi import APIRouter, Depends, HTTPException

from app.dependencies.auth import require_role
from app.schemas.user import UserUpdate
from app.services import user_service

router = APIRouter()

_admin = require_role("administrador")


@router.get("/")
async def get_users(current_user: dict = Depends(_admin)):
    return {"success": True, "data": await user_service.get_all()}


@router.get("/{user_id}")
async def get_user(user_id: str, current_user: dict = Depends(_admin)):
    try:
        return {"success": True, "data": await user_service.get_by_id(user_id)}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{user_id}")
async def update_user(user_id: str, data: UserUpdate, current_user: dict = Depends(_admin)):
    try:
        return {"success": True, "data": await user_service.update(user_id, data.model_dump())}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(_admin)):
    try:
        deleted = await user_service.delete(user_id)
        return {"success": True, "message": "Usuario eliminado", "data": deleted}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
