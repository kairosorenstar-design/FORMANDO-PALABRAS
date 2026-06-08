# FORMANDO PALABRAS

Aplicación web donde cada usuario obtiene una combinación aleatoria de 4 letras (de las 26 del abecedario), pasando por un flujo de espera de 5 pasos. Las combinaciones son únicas a nivel global — 456,976 posibles.

---

## Estructura del proyecto

```
formando-palabras/
├── index.html              # Markup principal
├── css/
│   ├── tokens.css          # Variables de diseño (colores, tipografía, radios)
│   ├── base.css            # Reset, body, ambient, loader, toast, responsive
│   ├── auth.css            # Pantalla de acceso (login + registro con animación)
│   ├── main.css            # Página principal, cuadros de letras, dashboard
│   └── wait.css            # Pantalla de espera con temporizador
├── js/
│   ├── config.js           # Credenciales Supabase y constantes del juego
│   ├── db.js               # Todas las operaciones con Supabase
│   ├── auth.js             # Lógica de login, registro y animación de tabs
│   ├── game.js             # Flujo de espera, countdown, animación de revelado
│   └── main.js             # Estado global, UI helpers, router de páginas, init
└── database/
    └── setup.sql           # Script SQL completo para Supabase
```

---

## Configuración

### 1. Base de datos (Supabase)

1. Ve a [supabase.com](https://supabase.com) y abre tu proyecto
2. Ve a **SQL Editor → New Query**
3. Pega el contenido de `database/setup.sql` y haz clic en **Run**

### 2. Credenciales

Las credenciales están en `js/config.js`:

```js
const SUPABASE_URL      = 'https://TU_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY';
```

### 3. CORS en Supabase

- Ve a **Project Settings → API → CORS**
- Agrega la URL de tu sitio (ej: `https://tudominio.com`)

---

## Hosting en GitHub Pages

1. Sube el proyecto a un repositorio de GitHub
2. Ve a **Settings → Pages**
3. En **Source** selecciona `main` branch y carpeta `/ (root)`
4. Tu sitio estará en `https://TU_USUARIO.github.io/TU_REPO`

---

## Funcionalidades

| Función | Descripción |
|---|---|
| Login / Registro | Pantalla única con tabs animados. Login busca usuario existente; Registro crea uno nuevo |
| Combinación aleatoria | 4 letras (A–Z) generadas al completar el flujo de espera |
| Flujo de espera | 5 pasos × 11 segundos con anillo de cuenta regresiva |
| Animación de revelado | Los cuadros giran y revelan las letras de forma escalonada |
| Historial global | Todas las combinaciones formadas, en tiempo real |
| Enlace de referido | Link y código únicos por usuario, bloqueados para edición |
| Contador de referidos | Muestra cuántas personas se registraron con tu enlace |
| Seguridad | RLS en Supabase, CORS, Security Headers, sesión en localStorage |

---

## Seguridad

- **Row Level Security (RLS)** activado en tablas `users` y `words`
- **Security Headers** vía `<meta>` en el HTML
- **CORS** configurable desde el panel de Supabase
- **Sesión** guardada en `localStorage`, verificada contra la BD en cada carga
- Las combinaciones ya usadas **no se pueden repetir** (unique constraint en BD)
