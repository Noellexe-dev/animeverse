# ANIMEVERSE V3

Catálogo real de animes + red social para fans, con cuentas, perfiles, chats, opiniones y **panel de administración**. React + Vite + TypeScript + Tailwind + Supabase. Publicado en GitHub Pages en `/animeverse/`.

## Novedades de la V3

- **Panel de administración** en `#/panel` (solo visible para la administradora): resumen, usuarios, reportes, publicaciones y comentarios.
- **Administrar cuentas**: dar/quitar verificado ✓, bloquear/desbloquear, cambiar rol (usuario / moderador / admin) y borrar cuentas.
- **Antigüedad y actividad**: días desde el registro y última actividad de cada cuenta.
- **Moderación**: eliminar publicaciones y comentarios desde el panel.
- **Reportes y mensajes**: botón 🚩 en publicaciones y perfiles, y página `#/ayuda` para enviar problemas, sugerencias o reportes. La administradora ve los mensajes y puede responder y cerrarlos.
- **Insignias**: ✓ Verificado, ADMIN y MOD visibles en perfiles y publicaciones.
- **Cuentas bloqueadas**: dejan de poder publicar, comentar, dar me gusta, opinar, seguir o escribir mensajes, pero sus datos siguen en el panel.

Todo lo anterior se mantiene: bienvenida, entrada como visitante, catálogo de 43 animes, opiniones con estrellas, lista Favorito / Viendo / Visto, comunidad tipo Twitter, chats con mensajes de 7 días y favoritos locales.

## Instalación en Supabase (solo una vez)

1. Abre tu proyecto en **https://supabase.com**.
2. **SQL Editor → New query**.
3. Pega primero todo `SUPABASE-SETUP-V2.sql` y dale **Run** → **Success** (si ya lo hiciste, omite este paso).
4. **SQL Editor → New query** de nuevo.
5. Pega todo `SUPABASE-ADMIN-V3.sql` y dale **Run** → **Success**.
6. **Authentication → Providers → Email** y desactiva **Confirm email**. Guarda. Esto evita el error `email rate limit exceeded` al registrar, porque no se envían correos de confirmación.
7. **Authentication → Settings** → asegúrate de que **Allow new users to sign up** esté activado.
8. Para ser administradora: abre la web, entra con tu cuenta y ve a `#/panel`. Si no hay ninguna administradora, pulsa **Reclamar administración**. Si ya se registró otra persona primero, en Supabase ve a **Table Editor → profiles → tu fila → columna `role` → `admin`** y guarda (es visual, sin escribir código).

> El código ya tiene la Project URL y la publishable key de tu proyecto escritas en `src/lib/supabase.ts`. No hay secretos nuevos que configurar.

## Subir a GitHub

1. Abre la carpeta `ANIMEVERSE-V3-LISTO` (al mismo nivel que esta).
2. Arrastra **todo su contenido** a **Add file → Upload files** en tu repo.
3. Mensaje: `ANIMEVERSE V3: panel de administración y reportes`.
4. **Commit changes**.
5. **Actions** → espera el ✔ verde.
6. Abre `https://noellexe-dev.github.io/animeverse/` y recarga con **Ctrl + Mayús + R**.

## Desarrollo local

```bash
npm install
npm run dev
```

Vite sirve en `http://localhost:5173/animeverse/`.

## Build

```bash
npm run build
```

Genera `dist/`.
