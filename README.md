# ANIMEVERSE

Proyecto React + Vite + TypeScript + Tailwind listo para GitHub Pages en `/animeverse/`.

---

## SUBIR A GITHUB — LEER PRIMERO

### Si aún NO hiciste "Commit changes" en GitHub

1. Abre esta carpeta en el gestor de archivos.
2. Pulsa **Ctrl + H** para ver archivos ocultos. Verás `.github`, `.gitignore` y `public/.nojekyll`.
3. Selecciona **TODO** (Ctrl + A) **menos** la carpeta `_REFERENCIA_NO_SUBIR`.
4. Arrastra todo a **Add file → Upload files** en GitHub.
5. Mensaje: `Subir proyecto ANIMEVERSE completo` → **Commit changes**.

### Si ya subiste y faltaron archivos

En `_REFERENCIA_NO_SUBIR/` están los 3 archivos que suelen perderse:

| En GitHub | Copiar desde |
|---|---|
| `.github/workflows/deploy.yml` | `_REFERENCIA_NO_SUBIR/github-workflow-deploy.yml` |
| `.gitignore` | `_REFERENCIA_NO_SUBIR/gitignore.txt` |
| `public/.nojekyll` | `_REFERENCIA_NO_SUBIR/nojekyll.txt` |

En GitHub: **Add file → Create new file**, escribes el nombre exacto (ej. `.github/workflows/deploy.yml`), pegas el contenido y haces **Commit changes**.

Si te apareció una carpeta `workflows` suelta en la raíz, **bórrala**. El workflow debe estar solo en `.github/workflows/deploy.yml`.

---

## Desarrollo

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

## Configuración de Pages

En GitHub: **Settings → Pages → Source: GitHub Actions**. Luego espera el ✔ verde en **Actions**.

URL: `https://<TU-USUARIO>.github.io/animeverse/`.
