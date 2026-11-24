# ANIMEVERSE V4.2

Catálogo real de animes + red social para fans, con cuentas, perfiles, chats, opiniones con estrellas y panel de administración. React + Vite + TypeScript + Tailwind + Supabase. Publicado en GitHub Pages en `/animeverse/`.

## Cambios de la V4.2

- **Comentarios con autor**: cada respuesta muestra quién escribió y un enlace a su perfil. Esas respuestas también aparecen en el perfil de esa persona, dentro de la pestaña **Publicaciones → Respuestas en la comunidad**, con enlace a la publicación original.
- **Buscador en Comunidad**: busca por hashtags, palabras, nombre de anime, usuario o nombre visible. También filtra la lista de fans.
- **Perfil en 3 pestañas**: **Lista de animes**, **Opiniones y puntuaciones** y **Publicaciones**. Ya no están todas apiladas.
- **Chats a pantalla completa**: ocupan todo el espacio menos la barra superior (logo, Explorar, Comunidad, Mensajes, perfil). Scroll independiente y salto automático al último mensaje.
- **Regalos en chats**: botón 🎁 con 8 regalos (🌸 🍜 ⭐ 🎀 🍡 🐱 💫 🍰) con animación. Se guardan como mensajes y se borran a los 7 días igual que el resto.
- **Descripciones temporales**: los visitantes siempre ven los textos completos. Las cuentas registradas los ven solo durante **3 horas** desde su primera visita; después queda el título corto: **Explorar**, **Comunidad** y **Mensajes**.
- **Notificaciones**: campana 🔔 con avisos de nuevos seguidores, comentarios, likes, respuestas y mensajes. Punto rojo en la campana y en **Mensajes** (sin números). Se marcan como leídas al abrir la campana o al entrar a chats.
- **Extras**: al venir desde una notificación, la publicación se resalta y se desplaza hasta ella. No se muestra cantidad de seguidores.

## Cambios de la V4

- **Comunidad general**: ahora se ven **todas las publicaciones de todos los usuarios** y también las **opiniones con estrellas del explorador**, ordenadas por fecha.
- **Pestañas** en Comunidad: **General** (todo) y **Siguiendo** (solo cuentas que sigues).
- **Botón flotante +** abajo a la derecha para publicar. Se abre un panel para escribir o subir imagen. **Ya no aparece el banner grande ni el selector de anime**; puedes publicar sin elegir anime.
- **Perfiles completos**: sus publicaciones, sus opiniones con estrellas y el tag del anime (lleva al detalle en Explorar) y su lista Favorito / Viendo / Visto.
- **Perfil arreglado en celular**: deja de verse como columna incómoda.
- **Reportes discretos**: el botón 🚩 ahora está dentro de un menú **···** en publicaciones y perfiles.
- **Borrar cuenta** también está dentro de un menú **···**, y además en el nuevo **⚙ Ajustes**.
- **Chats tipo WhatsApp Web**: lista de amigos y conversación con scroll propio, la página no crece. Solo aparecen amigos mutuos. Se quitó el texto «Selecciona a un amigo…».
- **Ajustes (⚙)**: reportes y ayuda, panel de administración (si eres admin), cerrar sesión y borrar cuenta.
- **Visitantes**: solo pueden ver **Explorar** y **Comunidad** (detalle de anime, opiniones, puntuaciones y publicaciones incluidos).
- **Favoritos locales eliminados**: se acabaron los corazones guardados solo en el navegador. La lista **Favorito / Viendo / Visto** de cada cuenta sigue igual.

Se mantienen: bienvenida, entrada como visitante, catálogo de 43 animes, opiniones con estrellas, comunidad con hashtags/me gusta únicos/comentarios, chats con mensajes de 7 días y panel de administración.

## Instalación en Supabase (solo una vez)

1. Abre tu proyecto en **https://supabase.com**.
2. **SQL Editor → New query** → pega `SUPABASE-SETUP-V2.sql` → **Run** → **Success** (si ya lo corriste, omítelo).
3. **SQL Editor → New query** → pega `SUPABASE-ADMIN-V3.sql` → **Run** → **Success**.
4. Abre directamente **https://supabase.com/dashboard/project/ewvqsovfnokdsatadaud/auth/providers**.
5. Clic en **Email** → apaga **Confirm email** → **Save**. Esto evita el error `email rate limit exceeded`.
6. En **Authentication → Settings**, deja activado **Allow new users to sign up**.
7. Para ser administradora: entra a la web con tu cuenta y en `#/panel` pulsa **Reclamar administración**. Si ya existe una admin, en **Table Editor → profiles → tu fila → `role` = `admin`** (visual, sin código).

> La Project URL y la publishable key ya están escritas en `src/lib/supabase.ts`. No hay secretos nuevos.

### Arreglo de la V4.1 (publicar sin anime y ver opiniones)

La web ya viene corregida: si tu base es antigua y `anime_id` sigue siendo obligatorio, el botón **+** guarda la publicación de todos modos. Además, las opiniones se leen directamente de la tabla y los nombres de usuario se cargan aparte, así que ya no aparece el mensaje «¡Opinión publicada!» sin que se vea nada.

Opcional: si quieres arreglar también la base de datos, ejecuta `SUPABASE-FIX-V4.sql` en **SQL Editor → New query → Run**. No es obligatorio para que la web funcione.

## Subir a GitHub

1. Abre la carpeta `ANIMEVERSE-V4-LISTO` (al mismo nivel que esta). También incluye `SUPABASE-FIX-V4.sql` (opcional).
2. GitHub → tu repo `Noellexe-dev/animeverse` → **Add file → Upload files**.
3. Arrastra **todo el contenido** de esa carpeta.
4. Mensaje: `ANIMEVERSE V4.2: notificaciones, buscador, regalos y perfil por pestañas`.
5. **Commit changes**.
6. **Delete file** (en la web de GitHub) en estos 3 archivos que ya no se usan:
   - `src/pages/Favorites.tsx`
   - `src/context/FavoritesContext.tsx`
   - `src/hooks/useFavorites.ts`
   (Puedes entrar directo a `https://github.com/Noellexe-dev/animeverse/blob/main/src/pages/Favorites.tsx` y pulsar el icono de basura; repite para los otros dos.)
7. **Actions** → espera el ✔ verde.
8. Abre `https://noellexe-dev.github.io/animeverse/` y recarga con **Ctrl + Mayús + R**.

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
