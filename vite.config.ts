import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages publica los proyectos en https://<usuario>.github.io/<repo>/.
// Al fijar `base`, Vite genera todas las URLs de JS/CSS/imágenes con ese prefijo.
export default defineConfig({
  base: '/animeverse/',
  plugins: [react(), tailwindcss()],
})
