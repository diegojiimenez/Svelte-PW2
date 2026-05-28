from fastapi import APIRouter, Depends, HTTPException

from app.dependencies.auth import get_current_user, require_role
from app.schemas.product import ProductCreate, ProductUpdate
from app.services import product_service

router = APIRouter()


@router.get("/")
async def get_products(current_user: dict = Depends(get_current_user)):
    return {"success": True, "data": await product_service.get_all()}


@router.get("/{product_id}")
async def get_product(product_id: str, current_user: dict = Depends(get_current_user)):
    try:
        return {"success": True, "data": await product_service.get_by_id(product_id)}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/", status_code=201)
async def create_product(data: ProductCreate, current_user: dict = Depends(require_role("administrador"))):
    try:
        product = await product_service.create(data.model_dump(), str(current_user["_id"]))
        return {"success": True, "data": product}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{product_id}")
async def update_product(
    product_id: str,
    data: ProductUpdate,
    current_user: dict = Depends(require_role("administrador")),
):
    try:
        return {"success": True, "data": await product_service.update(product_id, data.model_dump())}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{product_id}")
async def delete_product(product_id: str, current_user: dict = Depends(require_role("administrador"))):
    try:
        deleted = await product_service.delete(product_id)
        return {"success": True, "message": "Producto eliminado", "data": deleted}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
