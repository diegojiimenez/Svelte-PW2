from pydantic import BaseModel, EmailStr
from typing import Literal, Optional


class UserUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    email: Optional[EmailStr] = None
    rol: Optional[Literal["usuario", "administrador"]] = None
    activo: Optional[bool] = None
