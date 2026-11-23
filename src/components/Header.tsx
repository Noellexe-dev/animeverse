import { Link, NavLink } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-violet-500/20 text-violet-200'
      : 'text-slate-300 hover:bg-white/5 hover:text-white'
  }`

export function Header() {
  const { favorites } = useFavorites()

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0b14]/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3" aria-label="ANIMEVERSE - Inicio">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-black text-white shadow-lg shadow-violet-900/40">
            A
          </span>
          <span className="text-lg font-black tracking-[0.18em] text-white">ANIMEVERSE</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Navegación principal">
          <NavLink to="/" end className={linkClass}>
            Explorar
          </NavLink>
          <NavLink to="/favoritos" className={linkClass}>
            Favoritos
            {favorites.length > 0 && (
              <span className="ml-2 rounded-full bg-violet-500 px-2 py-0.5 text-xs font-bold text-white">
                {favorites.length}
              </span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
