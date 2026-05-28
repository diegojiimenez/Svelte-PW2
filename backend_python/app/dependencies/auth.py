from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.config import settings
from app.repositories import user_repository

_bearer = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(_bearer)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, settings.JWT_SECRET, algorithms=["HS256"])
        user_id: str = payload.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token inválido o expirado")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

    user = await user_repository.find_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    if not user.get("activo", True):
        raise HTTPException(status_code=401, detail="Usuario inactivo")

    return user


def require_role(*roles: str):
    async def _check(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user.get("rol") not in roles:
            raise HTTPException(
                status_code=403,
                detail=f"El rol '{current_user.get('rol')}' no tiene permisos para acceder a esta ruta",
            )
        return current_user
    return _check
