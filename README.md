# ANIMEVERSE

Catálogo de 20 animes reales + comunidad. React + Vite + TypeScript + Tailwind. GitHub Pages en `/animeverse/`.

## Modos de la comunidad

- **Sin configurar Supabase**: posts, favoritos, likes y comentarios se guardan solo en tu navegador (`localStorage`). Funciona igual que antes.
- **Con Supabase configurado**: los posts, likes y comentarios se guardan en una base de datos en internet. Todas las personas ven lo mismo y pueden conversar.

La aplicación detecta sola si las variables están presentes; no hay que cambiar código.

---

## Activar la comunidad multiusuario (Supabase, gratis)

### 1. Crear el proyecto

1. Entra a **https://supabase.com**.
2. Clic en **Start your project** y regístrate con **GitHub** (botón *Continue with GitHub*).
3. Clic en **New project**.
4. Llena:
   - **Name**: `animeverse`
   - **Database Password**: inventa una contraseña y guárdala.
   - **Region**: elige la más cercana a ti.
   - Plan: **Free**.
5. Clic en **Create new project**. Espera 1–2 minutos.

### 2. Crear las tablas

1. En el menú izquierdo, clic en **SQL Editor**.
2. Clic en **New query**.
3. Pega todo el contenido de `SUPABASE-SETUP.sql` (está en la carpeta `CAMBIOS-SUPABASE`).
4. Clic en **Run**. Debe decir **Success**.

### 3. Copiar las dos claves

1. Menú izquierdo → **Project Settings** (engranaje) → **API**.
2. Copia:
   - **Project URL** (ej. `https://abcdefgh.supabase.co`)
   - **anon public** key (una cadena larga que empieza con `eyJ...`)

> La clave `anon` es pública por diseño: va en el código del navegador. La seguridad se controla con las reglas RLS del SQL. No es una clave privada.

### 4. Poner las claves en GitHub

1. En tu repo de GitHub → **Settings** → **Secrets and variables** → **Actions**.
2. Clic en **New repository secret**.
3. Crea estos dos secretos (los nombres deben ser exactos):

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | tu Project URL |
| `VITE_SUPABASE_ANON_KEY` | tu anon public key |

### 5. Subir los archivos

Sube el contenido de la carpeta `CAMBIOS-SUPABASE` a tu repo (Add file → Upload files), haz commit y espera el ✔ verde en **Actions**.

---

## Desarrollo local

```bash
npm install
npm run dev
```

Si quieres probar Supabase en local, crea un archivo `.env` con:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon
```

Vite sirve en `http://localhost:5173/animeverse/`.

## Build

```bash
npm run build
```

Genera `dist/`.

## Rutas

- `/` catálogo
- `/anime/:id` detalle
- `/comunidad` muro de recomendaciones
- `/favoritos` favoritos

Todas usan `HashRouter`, así que recargar nunca da 404 en GitHub Pages.
