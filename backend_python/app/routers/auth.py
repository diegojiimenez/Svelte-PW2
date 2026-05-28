from fastapi import APIRouter, Depends, HTTPException

from app.dependencies.auth import get_current_user
from app.schemas.auth import LoginRequest, RegisterRequest
from app.services import auth_service

router = APIRouter()


@router.post("/register", status_code=201)
async def register(data: RegisterRequest):
    try:
        token, user = await auth_service.register(data.model_dump())
        return {"success": True, "message": "Usuario registrado exitosamente", "token": token, "user": user}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
async def login(data: LoginRequest):
    try:
        token, user = await auth_service.login(data.email, data.password)
        return {"success": True, "message": "Login exitoso", "token": token, "user": user}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {"success": True, "user": auth_service.serialize_user(current_user)}
