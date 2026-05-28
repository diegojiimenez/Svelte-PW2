from pydantic import BaseModel, EmailStr
from typing import Literal, Optional


class RegisterRequest(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    password: str
    rol: Optional[Literal["usuario", "administrador"]] = "usuario"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
