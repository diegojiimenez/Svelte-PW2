# NOIR - Brutalist E-Commerce

NOIR es una Single Page Application (SPA) de comercio electrónico de alta costura, construida con un enfoque de diseño brutalista y minimalista. El proyecto utiliza las últimas características reactivas de **Svelte 5** en el frontend y un backend robusto con **Python, FastAPI y MongoDB**.

## Tecnologías Usadas

* **Frontend:** Svelte 5 (Runes), Vite, TailwindCSS, GSAP (ScrollTrigger para animaciones de alto rendimiento).
* **Backend:** Python, FastAPI, MongoDB (Motor async), JWT para autenticación.
* **Arquitectura Frontend:** SPA nativa con enrutador propio basado en el estado de la URL.

---

## Implementación de Svelte 5 (Runes)

Este proyecto ha sido desarrollado abandonando la reactividad clásica de Svelte 4 para adoptar completamente el nuevo paradigma de **Runes** de Svelte 5, garantizando un código más limpio y optimizado.

### 1. Estado Principal (`$state`)
Se ha utilizado `$state()` para manejar toda la mutabilidad de la aplicación, tanto en el estado global (mediante stores) como en el estado local de los componentes.
* **Autenticación:** En `App.svelte`, variables como `let token = $state(null)` y `let user = $state(null)` controlan la sesión del usuario.
* **Formularios:** En `Login.svelte`, `Register.svelte` y `ProductEditorModal.svelte`, los inputs están vinculados a variables reactivas (ej. `let email = $state('')`).
* **Interactividad UI:** Control de pestañas en `Admin.svelte` (`let activeTab = $state('products')`) y visibilidad de modales (`let isEditorOpen = $state(false)`).

### 2. Valores Derivados (`$derived`)
Se implementó `$derived()` para calcular valores al vuelo basándose en el estado actual, evitando recálculos innecesarios:
* **Contador del Carrito:** En `Navigation.svelte`, el número de items se calcula automáticamente sumando las cantidades:
  `let totalItems = $derived($cartStore.items.reduce((acc, item) => acc + item.quantity, 0));`
* **Cálculo de Subtotal:** En `CartDrawer.svelte`, se deriva el precio total de los items en el carrito.
* **Filtrado en Tiempo Real:** En `Shop.svelte`, `let filteredProducts = $derived(...)` actualiza el grid de productos instantáneamente al escribir en la barra de búsqueda.
* **Títulos Dinámicos:** En `ProductEditorModal.svelte`, `let modalTitle = $derived(isEditing ? 'Edit Product' : 'Add New Product')` adapta la interfaz según el contexto.

### 3. Efectos y Ciclo de Vida (`$effect`)
Se reemplazaron los antiguos ciclos de vida (`onMount`, `onDestroy`) por `$effect()` para el manejo de side-effects:
* **Protección de Rutas (Auth Guard):** En `App.svelte`, un efecto monitorea los cambios en la ruta y en el usuario, redirigiendo al `/login` si se pierde el token, o bloqueando el acceso a `/admin` si el rol no es `administrador`.
* **Animaciones GSAP:** Se usa `$effect` para inicializar y limpiar (usando `ctx.revert()`) las complejas animaciones de ScrollTrigger y entrada en componentes como `HeroSection.svelte` y `ProductModal.svelte`.
* **Sincronización Backend:** En `Admin.svelte`, un `$effect` se encarga de llamar a `productsStore.load()` y `adminOrderStore.load()` para mantener la UI sincronizada con la base de datos al montar el panel.

### 4. Comunicación entre Componentes (`$props` y Callbacks)
Siguiendo las mejores prácticas de Svelte 5, **se ha descartado el uso de `createEventDispatcher`**. En su lugar, la comunicación de hijos a padres se realiza pasando funciones (callbacks) como propiedades a través de `$props()`.
* **`ProductCard.svelte`**: Recibe `product`, `index` y un callback `onQuickView`. Al hacer click en el botón, el hijo ejecuta el callback pasando el producto al padre (`Shop.svelte`).
* **`ProductEditorModal.svelte`**: Recibe estado (`isOpen`, `productToEdit`) y callbacks (`onClose`, `onSave`). El modal delega la lógica de guardado en base de datos al componente padre.
* **`CartDrawer.svelte` & `Toast.svelte`**: Reciben la propiedad `isOpen` y un callback `onClose` para coordinar el cierre de la UI y las animaciones.

---

## Backend Python con FastAPI

El backend ha sido reescrito íntegramente en **Python usando FastAPI**, manteniendo exactamente el mismo contrato de API que consume el frontend Svelte.

### Arquitectura en capas

```text
backend_python/
 ┣ main.py                    # Punto de entrada, CORS y manejadores globales de errores
 ┣ requirements.txt
 ┣ .env
 ┣ app/
 ┃ ┣ config.py                # Configuración centralizada (pydantic-settings)
 ┃ ┣ database.py              # Conexión a MongoDB con Motor (async)
 ┃ ┣ schemas/                 # Validación de entrada con Pydantic
 ┃ ┃ ┣ auth.py
 ┃ ┃ ┣ product.py
 ┃ ┃ ┣ cart.py
 ┃ ┃ ┣ order.py
 ┃ ┃ ┗ user.py
 ┃ ┣ repositories/            # Acceso a datos (operaciones MongoDB)
 ┃ ┃ ┣ user_repository.py
 ┃ ┃ ┣ product_repository.py
 ┃ ┃ ┣ cart_repository.py
 ┃ ┃ ┗ order_repository.py
 ┃ ┣ services/                # Lógica de negocio
 ┃ ┃ ┣ auth_service.py
 ┃ ┃ ┣ product_service.py
 ┃ ┃ ┣ cart_service.py
 ┃ ┃ ┣ order_service.py
 ┃ ┃ ┗ user_service.py
 ┃ ┣ routers/                 # Controladores HTTP (endpoints)
 ┃ ┃ ┣ auth.py
 ┃ ┃ ┣ products.py
 ┃ ┃ ┣ cart.py
 ┃ ┃ ┣ orders.py
 ┃ ┃ ┗ users.py
 ┃ ┗ dependencies/
 ┃   ┗ auth.py                # Middleware JWT: get_current_user + require_role()
 ┗ seed/
   ┣ seed_products.py
   ┗ products.seed.json
```

### Endpoints de la API

**Autenticación (`/api/auth`)**
* `POST /register` y `POST /login`: Públicos. Devuelven el JWT y la información del usuario.
* `GET /me`: Protegido (JWT). Devuelve el perfil del usuario autenticado.

**Productos (`/api/products`)**
* `GET /`, `GET /:id`: Protegidos (JWT). Lectura del catálogo.
* `POST /`, `PUT /:id`, `DELETE /:id`: Protegidos (rol `administrador`). CRUD desde el panel Admin.

**Carrito (`/api/cart`)**
* `GET /`, `POST /items`, `PUT /items/:id`, `DELETE /items/:id`, `DELETE /clear`: Protegidos (JWT).

**Órdenes (`/api/orders`)**
* `POST /`: Protegido (usuario). Crea una orden desde el carrito y lo vacía.
* `GET /my`: Protegido (usuario). Lista las órdenes propias.
* `GET /`: Protegido (administrador). Lista todas las órdenes del sistema.
* `PUT /:orderNumber/status`: Protegido (administrador). Actualiza el estado de envío.

**Usuarios (`/api/users`)**
* `GET /`, `GET /:id`, `PUT /:id`, `DELETE /:id`: Protegidos (administrador). CRUD completo de usuarios.

### Validación y manejo de errores

* Los schemas de **Pydantic** validan automáticamente todos los datos de entrada (rangos, formatos, campos obligatorios). Los errores de validación devuelven `422 Unprocessable Entity`.
* Manejadores globales capturan `HTTPException`, `RequestValidationError`, `DuplicateKeyError` de MongoDB y cualquier excepción no controlada, devolviendo siempre el formato `{ "success": false, "message": "..." }`.

---

## Integración con el Frontend

El frontend Svelte no requiere ninguna modificación: el contrato de API (URLs, métodos HTTP y estructura JSON) es idéntico al backend anterior. FastAPI expone además documentación interactiva en `http://localhost:3000/docs`.

---

## Estructura del Proyecto

```text
📦 NOIR-ECOMMERCE
 ┣ 📂 backend_python/            # Python + FastAPI (backend activo)
 ┃ ┣ 📂 app/
 ┃ ┃ ┣ 📂 schemas/              # Validación con Pydantic
 ┃ ┃ ┣ 📂 repositories/         # Acceso a MongoDB (Motor async)
 ┃ ┃ ┣ 📂 services/             # Lógica de negocio
 ┃ ┃ ┣ 📂 routers/              # Controladores HTTP
 ┃ ┃ ┗ 📂 dependencies/         # Middleware de autenticación JWT
 ┃ ┣ 📂 seed/                   # Script y datos de seed
 ┃ ┣ 📜 main.py                 # Punto de entrada
 ┃ ┗ 📜 requirements.txt
 ┃
 ┗ 📂 src/                       # Svelte 5 + Vite (frontend)
   ┣ 📂 lib/
   ┃ ┣ 📂 components/           # Componentes UI
   ┃ ┣ 📂 pages/                # Vistas principales
   ┃ ┗ 📂 stores/               # Estado global
   ┣ 📜 App.svelte              # Router SPA y layout maestro
   ┗ 📜 main.ts                 # Punto de entrada de Svelte
```

---

## Instrucciones de Instalación y Ejecución

### Requisitos Previos

- Python 3.12 o superior
- Node.js v18 o superior
- MongoDB (local o Atlas)

---

### 1. Configuración del Backend (Python / FastAPI)

1. Navega a la carpeta del backend:
   ```bash
   cd backend_python
   ```

2. Crea y activa un entorno virtual:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate      # Linux / macOS
   .venv\Scripts\activate         # Windows
   ```

3. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```

4. Crea el archivo `.env` en `backend_python/`:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/svelte_pw2
   JWT_SECRET=tu_clave_secreta_larga_y_random
   JWT_EXPIRE=7d
   CORS_ORIGIN=http://localhost:5173
   ```

5. (Opcional) Carga los productos de ejemplo:
   ```bash
   python seed/seed_products.py
   ```

6. Inicia el servidor:
   ```bash
   python main.py
   ```
   > El servidor correrá en `http://localhost:3000`
   > Documentación interactiva disponible en `http://localhost:3000/docs`

---

### 2. Configuración del Frontend (Svelte 5)

1. Navega a la raíz del proyecto:
   ```bash
   cd Svelte-PW2
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia la aplicación:
   ```bash
   npm run dev
   ```

4. Abre tu navegador en `http://localhost:5173`.
