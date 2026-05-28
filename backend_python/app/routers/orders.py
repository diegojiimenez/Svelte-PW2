from fastapi import APIRouter, Depends, HTTPException

from app.dependencies.auth import get_current_user, require_role
from app.schemas.order import UpdateOrderStatusRequest
from app.services import order_service

router = APIRouter()


@router.post("/", status_code=201)
async def create_order(current_user: dict = Depends(get_current_user)):
    try:
        return {"success": True, "data": await order_service.create_from_cart(str(current_user["_id"]))}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/my")
async def get_my_orders(current_user: dict = Depends(get_current_user)):
    return {"success": True, "data": await order_service.get_my_orders(str(current_user["_id"]))}


@router.get("/")
async def get_all_orders(current_user: dict = Depends(require_role("administrador"))):
    return {"success": True, "data": await order_service.get_all_for_admin()}


@router.put("/{order_number}/status")
async def update_order_status(
    order_number: str,
    data: UpdateOrderStatusRequest,
    current_user: dict = Depends(require_role("administrador")),
):
    try:
        return {"success": True, "data": await order_service.update_status(order_number, data.status)}
    except ValueError as e:
        status = 400 if "inválido" in str(e) else 404
        raise HTTPException(status_code=status, detail=str(e))
