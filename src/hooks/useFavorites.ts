import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'animeverse:favorites'

function readFavorites(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function useFavoritesState() {
  const [favorites, setFavorites] = useState<string[]>(readFavorites)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch {
      // Almacenamiento no disponible (modo privado, cuota llena, etc.).
    }
  }, [favorites])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((current) =>
      current.includes(id) ? current.filter((favorite) => favorite !== id) : [...current, id],
    )
  }, [])

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites])

  return { favorites, toggleFavorite, isFavorite }
}
