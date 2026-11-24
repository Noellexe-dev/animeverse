import { useAuth } from '../context/AuthContext'

export function Footer() {
  const { user } = useAuth()

  return (
    <footer className="mt-16 border-t border-white/10 py-8 text-center text-sm text-slate-500">
      <p>
        ANIMEVERSE · Un universo para tus historias favoritas
      </p>
      {user && (
        <p className="mt-1 text-xs">
          <a href="#/ayuda" className="hover:text-violet-300">Reportes y ayuda</a>
          {' · '}
          <a href="#/ajustes" className="hover:text-violet-300">Ajustes</a>
        </p>
      )}
    </footer>
  )
}
