# ANIMEVERSE V2

Catálogo real de animes + red social para fans, con cuentas, perfiles, chats y opiniones. React + Vite + TypeScript + Tailwind + Supabase. Publicado en GitHub Pages en `/animeverse/`.

## Novedades

- **Bienvenida** al entrar: botón para entrar/registrarte o entrar como visitante.
- **Catálogo ampliado** a 43 títulos reales con filtros: todo, clásicos, recientes y próximamente.
- **Cada anime** tiene imagen, sinopsis, géneros, estudio, puntuación y un apartado de **opiniones de los fans con estrellas (1–5)**.
- **Perfil**: nombre, biografía, foto opcional, perfil público/privado y lista personal **Favorito / Viendo / Visto** con estrellas.
- **Comunidad** tipo Twitter: publicaciones de texto, imagen o ambos; hashtags; seguir a personas; me gusta **único por usuario**; respuestas; borrar tus propios posts.
- **Chats** entre amigos (se siguen mutuamente). Los mensajes se borran solos a los 7 días; el contacto permanece.
- **Borrar cuenta** desde tu perfil.
- Los favoritos del corazón siguen guardándose en el navegador, como antes.

## Instalación en Supabase (solo una vez)

1. Abre tu proyecto en **https://supabase.com**.
2. **SQL Editor → New query**.
3. Pega todo el contenido de `SUPABASE-SETUP-V2.sql`.
4. **Run** → debe decir **Success**.
5. Recomendado: **Authentication → Providers → Email** y desactiva **Confirm email** para que las cuentas se activen al instante. Guarda los cambios.

> El código ya tiene la Project URL y la publishable key de tu proyecto escritas en `src/lib/supabase.ts`. No hay secretos nuevos que configurar.

## Subir a GitHub

1. Abre la carpeta `ANIMEVERSE-V2-LISTO` (al mismo nivel que esta).
2. Arrastra **todo su contenido** a **Add file → Upload files** en tu repo.
3. Mensaje: `ANIMEVERSE V2: cuentas, perfiles, chats y catálogo ampliado`.
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
