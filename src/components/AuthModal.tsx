import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'

interface AuthModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setNotice(null)
    setBusy(true)
    const message =
      mode === 'login'
        ? await signIn(email, password)
        : await signUp(email, password, username)
    setBusy(false)
    if (message) {
      setError(message)
      return
    }
    if (mode === 'register') {
      setNotice('¡Cuenta creada! Si Supabase pide confirmación, revisa tu correo.')
      return
    }
    onSuccess()
  }

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-[#141423] px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none'

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/80 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#121220] p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">
            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="mt-6 flex gap-2 rounded-full bg-white/5 p-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); setNotice(null) }}
            className={`flex-1 rounded-full py-2 text-sm font-bold ${mode === 'login' ? 'bg-violet-600 text-white' : 'text-slate-400'}`}
          >
            Ya tengo cuenta
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); setNotice(null) }}
            className={`flex-1 rounded-full py-2 text-sm font-bold ${mode === 'register' ? 'bg-violet-600 text-white' : 'text-slate-400'}`}
          >
            Registrarme
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Nombre de usuario</span>
              <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="ej. otaku_luna" className={inputClass} required minLength={3} />
            </label>
          )}
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Correo</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" className={inputClass} required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Contraseña</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 6 caracteres" className={inputClass} required minLength={6} />
          </label>

          {error && <p className="rounded-xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">{error}</p>}
          {notice && <p className="rounded-xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-200">{notice}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Un momento…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}
