# ANIMEVERSE

Catálogo de animes reales + comunidad local, construido con React, Vite, TypeScript y Tailwind CSS. Publicado en GitHub Pages bajo `/animeverse/`.

## Qué incluye

- **Catálogo real**: 20 animes conocidos con título original, sinopsis, géneros, año, episodios, estudio y puntuación.
- **Favoritos**: se guardan en `localStorage` del navegador.
- **Comunidad**: publica recomendaciones, da «me gusta» y comenta. Todo se guarda en el navegador; no hay cuentas ni datos enviados a internet.
- **Recomendar desde el detalle**: el botón «Recomendar en la comunidad» abre el formulario con ese anime preseleccionado.
- **Rutas internas con `HashRouter`**: recargar cualquier página en GitHub Pages no da 404.
- **Recursos estáticos**: imágenes en `public/images/` referenciadas con `assetPath()` para respetar `/animeverse/`.

> Las publicaciones de ejemplo son solo demostración. Puedes eliminarlas desde la propia comunidad.

## Desarrollo

```bash
npm install
npm run dev
```

Vite sirve en `http://localhost:5173/animeverse/`.

## Compilación

```bash
npm run build
```

Genera `dist/`.

## Actualizar el sitio en GitHub

Si subes los cambios por la web de GitHub:

1. Abre la carpeta `CAMBIOS-ANIMEVERSE` que preparé.
2. Selecciona **todo su contenido** (Ctrl+A) y arrástralo a **Add file → Upload files** en tu repo.
3. Mensaje: `Añadir catálogo real y comunidad`.
4. **Commit changes**.
5. Ve a **Actions** y espera el ✔ verde de `Deploy ANIMEVERSE a GitHub Pages`.

El despliegue es automático en cada push a `main`.

## Configuración de Pages

**Settings → Pages → Source: GitHub Actions**. URL: `https://<TU-USUARIO>.github.io/animeverse/`.
