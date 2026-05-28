# Registro de Prompts e Iteraciones — Migración Backend Python

**Proyecto:** NOIR E-Commerce  
**Tarea:** Migración del backend de Node.js/Express a Python/FastAPI  
**Modelo utilizado:** Claude Sonnet (claude-sonnet-4-6)

---

## 1. Prompt inicial — Elección del framework

### Prompt enviado

> Hola, necesito migrar el backend de este proyecto de Node.js/Express a Python. El frontend en Svelte debe quedar igual. Los requisitos son: backend en Flask o FastAPI, organización modular en capas (routers, services, repositories), autenticación JWT y mismo contrato de API que el backend anterior.

### Respuesta y decisión

La IA preguntó qué framework prefería antes de proceder, argumentando que FastAPI era más adecuado por su soporte nativo de `async/await`, validación automática con Pydantic y generación de documentación Swagger. Elegí FastAPI.

### Por qué fue una buena sugerencia

El proyecto ya usaba Motor (driver async de MongoDB), así que un framework síncrono como Flask hubiera requerido workarounds con `asyncio.run()` en cada ruta o cambiar a PyMongo síncrono. FastAPI encajaba de forma natural con el stack async.

---

## 2. Discusión sobre la separación en capas

### Contexto

Al recibir la estructura inicial propuesta, la IA generó un único archivo `routes/products.py` que mezclaba la consulta a la base de datos directamente dentro del router, sin pasar por un servicio:

```python
# Versión inicial generada — INCORRECTA
@router.get("/")
async def get_products(current_user: dict = Depends(get_current_user)):
    db = get_db()
    products = await db.products.find().sort("createdAt", -1).to_list(None)
    return {"success": True, "data": products}
```

### Problema detectado

Le señalé que eso violaba la separación de responsabilidades exigida: el router estaba haciendo trabajo del repositorio y del servicio al mismo tiempo. Si en el futuro necesitaba reutilizar la lógica de "obtener todos los productos" desde otro punto (por ejemplo, desde `order_service.py` para validar stock), tendría que duplicar código.

### Prompt de refinamiento

> Eso no es correcto según los requisitos. El router no debe tocar la base de datos directamente. Necesito tres capas claras: el router solo maneja HTTP (recibe request, llama al servicio, devuelve response), el servicio contiene la lógica de negocio y el repositorio es el único que habla con MongoDB. Rehaz la estructura respetando eso.

### Resultado tras el refinamiento

La IA reestructuró correctamente en tres capas:

- `repositories/product_repository.py` → operaciones CRUD sobre la colección MongoDB
- `services/product_service.py` → lógica de negocio + mapeo al DTO (conversión `_id` → `id`)
- `routers/products.py` → solo recibe la request, llama al service y devuelve la response JSON

Esta separación permitió, por ejemplo, que `order_service.py` pudiera llamar a `product_repository.find_by_id()` sin duplicar ninguna consulta.

---

## 3. Configuración del middleware JWT — Dependency Injection vs Middleware global

### Contexto

Durante la implementación de la autenticación, pregunté cómo proteger las rutas con JWT.

### Prompt enviado

> ¿Cómo implemento la protección de rutas con JWT en FastAPI? En Express usaba un middleware `protect` que se aplicaba ruta por ruta.

### Primera respuesta (subóptima)

La IA propuso crear un middleware global con `@app.middleware("http")` que interceptaba todas las peticiones:

```python
# Versión inicial generada — SUBÓPTIMA
@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    public = ["/api/auth/login", "/api/auth/register", "/health"]
    if request.url.path not in public:
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        # ... validar token ...
    return await call_next(request)
```

### Por qué era subóptimo

Le señalé dos problemas:

1. **Mantenibilidad:** mantener una lista hardcodeada de rutas públicas es frágil. Cada nueva ruta pública requiere modificar `main.py`, lo que viola el principio Open/Closed.
2. **No aprovecha FastAPI:** FastAPI tiene un sistema de inyección de dependencias diseñado exactamente para este caso. Un middleware global no puede devolver respuestas de error antes del routing, lo que genera comportamientos inesperados con algunas configuraciones de CORS.

### Prompt de refinamiento

> Eso no es lo mejor en FastAPI. Prefiero usar `Depends()` por ruta, como se hace en la documentación oficial. Crea una dependencia `get_current_user` en `dependencies/auth.py` que valide el JWT y se inyecte en cada ruta que lo necesite. Para las rutas de admin añade además una función `require_role()`.

### Resultado

```python
# Versión correcta — dependencies/auth.py
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(_bearer)) -> dict:
    # ...valida JWT, busca usuario en DB...
    return user

def require_role(*roles: str):
    async def _check(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user.get("rol") not in roles:
            raise HTTPException(status_code=403, ...)
        return current_user
    return _check
```

Cada router declara su protección de forma explícita y localizada:
```python
@router.post("/", status_code=201)
async def create_product(data: ProductCreate, current_user: dict = Depends(require_role("administrador"))):
```

---

## 4. El problema con el campo `password` en MongoDB

### Contexto

En el modelo Mongoose original, el campo `password` tenía `select: false`, lo que hacía que no se devolviera en las consultas por defecto. Al migrar a Motor (que devuelve siempre todos los campos), pregunté cómo replicar ese comportamiento.

### Prompt enviado

> En Mongoose el campo password tiene `select: false` y solo se incluye cuando se hace `.select("+password")`. ¿Cómo replico eso con Motor?

### Primera respuesta (incorrecta)

La IA sugirió añadir una proyección `{"password": 0}` a todas las consultas del repositorio de usuarios:

```python
# Versión inicial — INCORRECTA para el login
async def find_by_email(email: str) -> dict | None:
    return await get_db().users.find_one({"email": email}, {"password": 0})
```

### Análisis del error

Esto rompía el flujo de login: el servicio necesita el hash de la contraseña para verificarla con `bcrypt.checkpw()`. Si el repositorio excluye siempre el campo, el login devuelve `"Credenciales inválidas"` para cualquier contraseña, aunque sea correcta.

### Cómo se corrigió

Le expliqué que en este caso la separación de responsabilidades dicta que el **repositorio devuelve el documento completo** (es su trabajo: acceso a datos sin filtrar) y es el **servicio** quien decide qué exponer en la respuesta. La función `serialize_user()` en `auth_service.py` construye el DTO de salida sin incluir el campo `password`, con lo que nunca llega a la response HTTP:

```python
# Repositorio — devuelve todo, incluido password
async def find_by_email(email: str) -> dict | None:
    return await get_db().users.find_one({"email": email.lower()})

# Servicio — serializa sin password
def serialize_user(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "nombre": doc.get("nombre"),
        "email": doc.get("email"),
        "rol": doc.get("rol"),
        # 'password' deliberadamente ausente
    }
```

---

## 5. Error de alucinación — Incompatibilidad passlib / bcrypt 4.x

### Descripción del error

Este fue el error más significativo del proceso. La IA generó el módulo de hashing de contraseñas usando `passlib` con el backend de `bcrypt`:

```python
# Código generado — CON BUG
from passlib.context import CryptContext

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return _pwd.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return _pwd.verify(plain, hashed)
```

Y en `requirements.txt` incluyó:
```
passlib[bcrypt]>=1.7.4
```

### El fallo en producción

Al intentar iniciar sesión con un usuario existente (cuya contraseña había sido hasheada por el backend Node.js con `bcrypt` v5), el servidor devolvía un 401 con el siguiente error:

```
password cannot be longer than 72 bytes, truncate manually if necessary
AttributeError: module 'bcrypt' has no attribute '__about__'
(trapped) error reading bcrypt version
```

### Por qué la IA se equivocó

La IA no tenía conocimiento del breaking change introducido en `bcrypt` 4.0.0 (publicado en 2022). En esa versión se eliminó el atributo `__about__` que `passlib` usaba internamente para detectar la versión instalada. Al no poder leerlo, passlib inicializaba su backend de bcrypt en un estado corrupto, lo que provocaba que las verificaciones fallaran con ese error críptico sobre los 72 bytes en lugar de fallar con el mensaje real.

La alucinación consistió en que la IA presentó `passlib[bcrypt]` como la solución estándar y correcta sin advertir de este problema de compatibilidad conocido en el ecosistema Python.

### Cómo se detectó

Al levantar el servidor con el venv creado (que instaló `bcrypt>=4.0`), el primer intento de login fallaba con el error anterior. El traceback completo señalaba `passlib/handlers/bcrypt.py` como origen.

### Cómo se corrigió

Se eliminó `passlib` como dependencia y se sustituyó por llamadas directas a la librería `bcrypt`, que sí es compatible con cualquier versión de sí misma:

```python
# Código corregido — sin passlib
import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=10)).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False
```

Esta versión funciona correctamente tanto para verificar contraseñas antiguas hasheadas por Node.js (mismo algoritmo `$2b$10$`) como para crear nuevas contraseñas desde el backend Python.

---

## 6. Discusión sobre el handler de errores 422

### Contexto

Tras implementar los handlers de `HTTPException` y `Exception` en `main.py`, detecté que los errores de validación de Pydantic no pasaban por ninguno de ellos.

### Prompt enviado

> Los errores de validación de Pydantic devuelven un JSON con `"detail": [...]` en vez de `{"success": false, "message": "..."}` como el resto de errores. ¿Por qué no los captura el handler de HTTPException?

### Respuesta

La IA explicó que FastAPI trata los errores de validación de Pydantic como `RequestValidationError`, que es una clase distinta de `HTTPException` y tiene su propio handler por defecto que no es sobreescribible mediante `@app.exception_handler(HTTPException)`. Había que registrar un handler específico:

```python
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first = errors[0] if errors else {}
    field = " → ".join(str(loc) for loc in first.get("loc", []) if loc != "body")
    msg = first.get("msg", "Error de validación")
    detail = f"{field}: {msg}" if field else msg
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": detail, "errors": errors},
    )
```

Adicionalmente se añadieron handlers específicos para `DuplicateKeyError` y `PyMongoError` de Motor, ya que el handler genérico de `Exception` no los diferenciaba y todo aparecía como 500.

---

## Resumen de iteraciones

| # | Módulo | Problema | Acción |
|---|--------|----------|--------|
| 1 | Arquitectura general | Propuesta sin separación en capas | Prompt de refinamiento exigiendo 3 capas explícitas |
| 2 | `routers/products.py` | Consultas DB directas en el router | Corrección manual + prompt especificando responsabilidades |
| 3 | `dependencies/auth.py` | Middleware global en lugar de `Depends()` | Prompt indicando el patrón idiomático de FastAPI |
| 4 | `repositories/user_repository.py` | Exclusión de `password` rompía el login | Corrección manual; la exclusión se movió al service |
| 5 | `services/auth_service.py` | **Alucinación:** `passlib` incompatible con `bcrypt` 4.x | Reescritura usando `bcrypt` directamente |
| 6 | `main.py` | `RequestValidationError` no capturado por el handler HTTP | Registro explícito del handler de Pydantic |
