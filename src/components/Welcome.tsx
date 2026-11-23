import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { AuthModal } from './AuthModal'

interface WelcomeProps {
  onEnter: () => void
}

export function Welcome({ onEnter }: WelcomeProps) {
  const { user, profile, enterAsGuest } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0b0b14]">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-violet-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[24rem] w-[24rem] rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="relative mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-2xl font-black text-white shadow-lg shadow-violet-900/50">
          A
        </span>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.4em] text-cyan-300">Bienvenido a</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-white sm:text-7xl">
          ANIME<span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">VERSE</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
          Descubre animes reales, guarda lo que ves, opina con otros fans y conversa en un lugar hecho solo para nosotros.
        </p>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
          {user ? (
            <button
              type="button"
              onClick={onEnter}
              className="rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-8 py-4 text-base font-bold text-white hover:opacity-90"
            >
              Continuar como {profile?.display_name ?? profile?.username ?? 'fan'} →
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowAuth(true)}
                className="rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-8 py-4 text-base font-bold text-white hover:opacity-90"
              >
                Entrar / Registrarme
              </button>
              <button
                type="button"
                onClick={() => { enterAsGuest(); onEnter() }}
                className="rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-slate-200 hover:bg-white/5"
              >
                Entrar como visitante
              </button>
            </>
          )}
        </div>

        <p className="mt-8 max-w-md text-xs leading-relaxed text-slate-500">
          Como visitante puedes explorar y leer. Para publicar, opinar, seguir a otros fans y chatear necesitas crear una cuenta gratis.
        </p>
      </div>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => { setShowAuth(false); onEnter() }}
        />
      )}
    </div>
  )
}
