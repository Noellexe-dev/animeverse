/**
 * Construye rutas hacia archivos de `public/` respetando el `base` de Vite.
 * En producción devuelve `/animeverse/images/...`; en desarrollo `/images/...`.
 */
export const BASE_URL = import.meta.env.BASE_URL

export function assetPath(path: string): string {
  const cleanPath = path.replace(/^\/+/, '')
  return `${BASE_URL}${cleanPath}`
}
