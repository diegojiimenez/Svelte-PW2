from datetime import datetime, timedelta

import bcrypt
from jose import jwt

from app.config import settings
from app.repositories import user_repository


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=10)).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def _parse_expire(expire_str: str) -> timedelta:
    unit = expire_str[-1]
    value = int(expire_str[:-1])
    if unit == "d":
        return timedelta(days=value)
    if unit == "h":
        return timedelta(hours=value)
    if unit == "m":
        return timedelta(minutes=value)
    return timedelta(days=7)


def create_token(user_id: str) -> str:
    expire = datetime.utcnow() + _parse_expire(settings.JWT_EXPIRE)
    return jwt.encode({"id": user_id, "exp": expire}, settings.JWT_SECRET, algorithm="HS256")


def serialize_user(doc: dict) -> dict:
    result = {
        "_id": str(doc["_id"]),
        "id": str(doc["_id"]),
        "nombre": doc.get("nombre"),
        "apellido": doc.get("apellido"),
        "email": doc.get("email"),
        "rol": doc.get("rol"),
        "activo": doc.get("activo", True),
    }
    if "createdAt" in doc:
        result["createdAt"] = doc["createdAt"].isoformat() if isinstance(doc["createdAt"], datetime) else doc["createdAt"]
    if "updatedAt" in doc:
        result["updatedAt"] = doc["updatedAt"].isoformat() if isinstance(doc["updatedAt"], datetime) else doc["updatedAt"]
    return result


async def register(data: dict) -> tuple[str, dict]:
    if not data.get("nombre") or not data.get("apellido") or not data.get("email") or not data.get("password"):
        raise ValueError("Por favor complete todos los campos obligatorios")

    existing = await user_repository.find_by_email(data["email"])
    if existing:
        raise ValueError("El email ya está registrado")

    now = datetime.utcnow()
    doc = {
        "nombre": data["nombre"].strip(),
        "apellido": data["apellido"].strip(),
        "email": data["email"].lower().strip(),
        "password": hash_password(data["password"]),
        "rol": data.get("rol") or "usuario",
        "activo": True,
        "createdAt": now,
        "updatedAt": now,
    }

    created = await user_repository.create(doc)
    token = create_token(str(created["_id"]))
    return token, serialize_user(created)


async def login(email: str, password: str) -> tuple[str, dict]:
    if not email or not password:
        raise ValueError("Por favor ingrese email y contraseña")

    user = await user_repository.find_by_email(email)
    if not user or not verify_password(password, user.get("password", "")):
        raise ValueError("Credenciales inválidas")

    if not user.get("activo", True):
        raise ValueError("Usuario inactivo")

    token = create_token(str(user["_id"]))
    return token, {
        "id": str(user["_id"]),
        "nombre": user.get("nombre"),
        "email": user.get("email"),
        "rol": user.get("rol"),
    }


async def get_me(user_id: str) -> dict:
    user = await user_repository.find_by_id(user_id)
    if not user:
        raise ValueError("Usuario no encontrado")
    return serialize_user(user)
