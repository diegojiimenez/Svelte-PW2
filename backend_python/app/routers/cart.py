from fastapi import APIRouter, Depends, HTTPException

from app.dependencies.auth import get_current_user
from app.schemas.cart import AddItemRequest, UpdateItemRequest
from app.services import cart_service

router = APIRouter()


@router.get("/")
async def get_my_cart(current_user: dict = Depends(get_current_user)):
    return {"success": True, "data": await cart_service.get_my_cart(str(current_user["_id"]))}


@router.post("/items", status_code=201)
async def add_item(data: AddItemRequest, current_user: dict = Depends(get_current_user)):
    try:
        cart = await cart_service.add_item(
            str(current_user["_id"]),
            data.productId,
            data.quantity,
            data.size,
            data.color.model_dump(),
        )
        return {"success": True, "data": cart}
    except ValueError as e:
        status = 404 if "Producto" in str(e) else 400
        raise HTTPException(status_code=status, detail=str(e))


@router.put("/items/{item_id}")
async def update_item(item_id: str, data: UpdateItemRequest, current_user: dict = Depends(get_current_user)):
    try:
        cart = await cart_service.update_item_quantity(str(current_user["_id"]), item_id, data.quantity)
        return {"success": True, "data": cart}
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/items/{item_id}")
async def remove_item(item_id: str, current_user: dict = Depends(get_current_user)):
    try:
        cart = await cart_service.remove_item(str(current_user["_id"]), item_id)
        return {"success": True, "data": cart}
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/clear")
async def clear_cart(current_user: dict = Depends(get_current_user)):
    return {"success": True, "data": await cart_service.clear_cart(str(current_user["_id"]))}
