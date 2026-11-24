import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MoreMenu } from '../components/MoreMenu'
import { useAuth } from '../context/AuthContext'

export function Settings() {
  const { profile, deleteAccount, signOut } = useAuth()
  const [notice, setNotice] = useState<string | null>(null)

  function handleDelete() {
    if (window.confirm('¿Seguro que quieres borrar tu cuenta? Esta acción no se puede deshacer.')) {
      void deleteAccount().catch(() => setNotice('No se pudo borrar la cuenta. Inténtalo de nuevo.'))
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Tu cuenta</p>
      <h1 className="mt-2 text-4xl font-black text-white">Ajustes</h1>
      <p className="mt-3 text-slate-400">Todas las herramientas de tu cuenta en un solo lugar.</p>

      {notice && <p className="mt-6 rounded-xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">{notice}</p>}

      <div className="mt-8 space-y-4">
        <Link to="/ayuda" className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-violet-400/40">
          <div>
            <h2 className="font-bold text-white">Reportes y ayuda</h2>
            <p className="mt-1 text-sm text-slate-400">Envía un problema, una sugerencia o reporta una publicación o una cuenta.</p>
          </div>
          <span className="text-slate-500" aria-hidden="true">→</span>
        </Link>

        {profile?.role === 'admin' && (
          <Link to="/panel" className="flex items-center justify-between gap-4 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-5 hover:border-amber-400/40">
            <div>
              <h2 className="font-bold text-white">Panel de administración</h2>
              <p className="mt-1 text-sm text-slate-400">Gestiona cuentas, verificaciones, reportes y contenido.</p>
            </div>
            <span className="text-slate-500" aria-hidden="true">→</span>
          </Link>
        )}

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div>
            <h2 className="font-bold text-white">Sesión</h2>
            <p className="mt-1 text-sm text-slate-400">Cerrar sesión en este navegador.</p>
          </div>
          <button type="button" onClick={() => void signOut()} className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-slate-300 hover:bg-white/5">
            Salir
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
          <div>
            <h2 className="font-bold text-white">Cuenta</h2>
            <p className="mt-1 text-sm text-slate-400">Eliminar tu cuenta y todos tus datos. Usa el menú ···</p>
          </div>
          <MoreMenu label="Opciones de cuenta" items={[
            { label: 'Borrar mi cuenta', onClick: handleDelete, danger: true },
          ]} />
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-slate-500">
        <Link to="/" className="hover:text-violet-300">← Volver al catálogo</Link>
      </p>
    </div>
  )
}
