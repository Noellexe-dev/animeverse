import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationsContext'
import { timeAgo } from '../utils/format'
import { AuthModal } from './AuthModal'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
    isActive
      ? 'bg-violet-500/20 text-violet-200'
      : 'text-slate-300 hover:bg-white/5 hover:text-white'
  }`

const iconFor = {
  follow: '👤',
  comment: '💬',
  like: '♥',
  message: '✉️',
  reply: '↩️',
} as const

export function Header() {
  const { user, profile, signOut } = useAuth()
  const { notifications, hasUnread, hasChatUnread, markAllRead } = useNotifications()
  const [showAuth, setShowAuth] = useState(false)
  const [showBell, setShowBell] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => setShowBell(false), [location.pathname])

  useEffect(() => {
    if (!showBell) return
    const handleClick = (event: MouseEvent) => {
      if (!bellRef.current?.contains(event.target as Node)) setShowBell(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showBell])

  function openBell() {
    setShowBell((value) => !value)
    if (!showBell) markAllRead()
  }

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-white/10 bg-[#0b0b14]/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3" aria-label="ANIMEVERSE - Inicio">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-black text-white shadow-lg shadow-violet-900/40">
            A
          </span>
          <span className="text-lg font-black tracking-[0.18em] text-white">ANIMEVERSE</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1 sm:gap-2" aria-label="Navegación principal">
          <NavLink to="/" end className={linkClass}>Explorar</NavLink>
          <NavLink to="/comunidad" className={linkClass}>Comunidad</NavLink>
          {user && (
            <span className="relative">
              <NavLink to="/chats" className={linkClass}>Mensajes</NavLink>
              {hasChatUnread && (
                <span className="pointer-events-none absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#0b0b14]" aria-label="Mensajes nuevos" />
              )}
            </span>
          )}
          {user && (
            <div className="relative" ref={bellRef}>
              <button
                type="button"
                onClick={openBell}
                aria-label="Notificaciones"
                aria-expanded={showBell}
                className={`relative grid h-10 w-10 place-items-center rounded-full text-lg transition-colors ${showBell ? 'bg-violet-500/20' : 'hover:bg-white/5'}`}
              >
                🔔
                {hasUnread && (
                  <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-[#0b0b14]" />
                )}
              </button>
              {showBell && (
                <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/15 bg-[#1b1b2b] shadow-2xl shadow-black/60">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <h2 className="font-bold text-white">Notificaciones</h2>
                    <button type="button" onClick={markAllRead} className="text-xs text-slate-400 hover:text-violet-300">Marcar leídas</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map((item) => (
                      <Link
                        key={item.id}
                        to={item.href}
                        className="flex items-start gap-3 border-b border-white/5 px-4 py-3 text-sm text-slate-200 hover:bg-white/5"
                      >
                        <span className="text-lg leading-none">{iconFor[item.kind]}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block leading-snug">{item.text}</span>
                          <span className="text-xs text-slate-500">{timeAgo(item.created_at)}</span>
                        </span>
                      </Link>
                    )) : (
                      <p className="px-4 py-8 text-center text-sm text-slate-400">
                        Aquí aparecerán nuevos seguidores, mensajes, me gusta y comentarios.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {user && (
            <NavLink
              to="/ajustes"
              className={({ isActive }) => `${linkClass({ isActive })} text-lg leading-none`}
              aria-label="Ajustes"
              title="Ajustes"
            >
              ⚙
            </NavLink>
          )}
          {user ? (
            <>
              <NavLink to="/perfil" className={linkClass}>
                {profile?.display_name ?? profile?.username ?? 'Mi perfil'}
              </NavLink>
              <button type="button" onClick={() => void signOut()} className="rounded-full px-3 py-2 text-xs text-slate-500 hover:text-rose-300 sm:px-4">
                Salir
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuth(true)}
              className="rounded-full bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-500"
            >
              Entrar
            </button>
          )}
        </nav>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
    </header>
  )
}
