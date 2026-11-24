import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const HORAS = 3
const MS = HORAS * 60 * 60 * 1000

/**
 * Los visitantes siempre ven las descripciones completas.
 * Las cuentas registradas las ven solo durante las primeras 3 horas
 * desde su primera visita; después queda el título corto de cada zona.
 */
export function useIntroVisible() {
  const { user } = useAuth()
  const [firstVisit] = useState(() => {
    if (!user) return null
    const key = `animeverse:intro:${user.id}`
    const stored = localStorage.getItem(key)
    if (stored) return Number(stored) || Date.now()
    const now = Date.now()
    localStorage.setItem(key, String(now))
    return now
  })

  if (!user || firstVisit === null) return true
  return Date.now() - firstVisit < MS
}
