# NOIR - Brutalist E-Commerce 🌑

NOIR es una Single Page Application (SPA) de comercio electrónico de alta costura, construida con un enfoque de diseño brutalista y minimalista. El proyecto utiliza las últimas características reactivas de **Svelte 5** en el frontend y un backend robusto con **Node.js, Express y MongoDB**.

## Tecnologías Usadas

* **Frontend:** Svelte 5 (Runes), Vite, TailwindCSS, GSAP (ScrollTrigger para animaciones de alto rendimiento).
* **Backend:** Node.js, Express, MongoDB (Mongoose), JWT para autenticación.
* **Arquitectura Frontend:** SPA nativa con enrutador propio basado en el estado de la URL.

---

## Implementación de Svelte 5 (Runes)

Este proyecto ha sido desarrollado abandonando la reactividad clásica de Svelte 4 para adoptar completamente el nuevo paradigma de **Runes** de Svelte 5, garantizando un código más limpio, predecible y optimizado.

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

## Integración con el Backend (API REST)

El frontend se comunica con una API RESTful en Express. Se han definido flujos estrictos basados en **Roles de Usuario** (Usuarios normales vs Administradores).

### Endpoints Principales Utilizados:

**Autenticación (`/api/auth`)**
* `POST /login` y `POST /register`: Públicos. Devuelven el JWT y la información del usuario (`rol`, `nombre`).

**Productos (`/api/products`)**
* `GET /`: **Público**. Carga el catálogo en la vista `/shop` y en la tabla del panel Admin.
* `POST /`, `PUT /:id`, `DELETE /:id`: **Protegidos (Requieren Rol: `administrador`)**. Ejecutados desde el modal de edición en el panel Admin.

**Carrito (`/api/cart`)**
* `GET /`, `POST /items`, `PUT /items/:id`, `DELETE /items/:id`: **Protegidos (Requieren JWT válido)**. El controlador asocia el carrito automáticamente al `req.user.id`.

**Órdenes (`/api/orders`)**
* `POST /`: **Protegido (Usuario normal)**. Toma los items actuales del carrito del usuario, crea la orden y vacía el carrito.
* `GET /`: **Protegido (Requiere Rol: `administrador`)**. Obtiene todas las órdenes del sistema para poblar la pestaña de "Orders" en `Admin.svelte`.
* `PUT /:orderNumber/status`: **Protegido (Requiere Rol: `administrador`)**. Actualiza el estado de envío (Placed, In Transit, Completed, Cancelled).

---

## Estructura del Proyecto

El proyecto está claramente dividido en dos carpetas principales que separan la lógica del servidor de la interfaz de usuario.

```text
📦 NOIR-ECOMMERCE
 ┣ 📂 backend/                    # Node.js + Express
 ┃ ┣ 📂 src/
 ┃ ┃ ┣ 📂 config/               # Conexión a MongoDB (db.js)
 ┃ ┃ ┣ 📂 controllers/          # Lógica de negocio (auth, cart, order, product)
 ┃ ┃ ┣ 📂 middleware/           # Protección de rutas y verificación de roles (auth.js)
 ┃ ┃ ┣ 📂 models/               # Esquemas de Mongoose (Cart, Order, Product, User)
 ┃ ┃ ┗ 📂 routes/               # Definición de Endpoints
 ┃ ┣ 📜 app.js                  # Configuración de Express
 ┃ ┗ 📜 server.js               # Punto de entrada del backend
 ┃
 ┗ 📂 frontend/                   # Svelte 5 + Vite
   ┣ 📂 src/
   ┃ ┣ 📂 lib/
   ┃ ┃ ┣ 📂 components/         # Componentes UI (CartDrawer, Navigation, Toasts, Modales)
   ┃ ┃ ┣ 📂 pages/              # Vistas principales (Home, Shop, Admin, Login)
   ┃ ┃ ┗ 📂 stores/             # Estado global (auth.ts, cart.ts, products.ts, adminOrders.ts)
   ┃ ┣ 📜 App.svelte            # Router principal SPA y Layout maestro
   ┃ ┗ 📜 main.ts               # Punto de entrada de Svelte
   ┗ 📜 tailwind.config.js      # Configuración de estilos
```

## Instrucciones de Instalación y Ejecución

### Requisitos Previos

- Node.js (v18 o superior)
- MongoDB (Local o Atlas)

---

### 1. Configuración del Backend

1. Abre una terminal y navega a la carpeta del backend:
   ```bash
   cd backend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` en la raíz de la carpeta `backend` con las siguientes variables:
   ```env
   PORT=3000
   MONGO_URI=tu_cadena_de_conexion_a_mongodb
   JWT_SECRET=tu_secreto_super_seguro
   ```

4. Inicia el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
   > El servidor correrá en `http://localhost:3000`

---

### 2. Configuración del Frontend

1. Abre una nueva terminal y navega a la raiz del proyecto:
   ```bash
   cd Svelte-PW2
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia la aplicación Svelte:
   ```bash
   npm run dev
   ```

4. Abre tu navegador en la ruta indicada (usualmente `http://localhost:5173`).