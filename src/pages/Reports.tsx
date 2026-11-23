import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthModal } from '../components/AuthModal'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Report } from '../types'
import { timeAgo } from '../utils/format'

const kinds: Array<{ value: Report['kind']; label: string }> = [
  { value: 'problema', label: 'Problema técnico' },
  { value: 'sugerencia', label: 'Sugerencia' },
  { value: 'usuario', label: 'Reportar a una persona' },
  { value: 'publicacion', label: 'Reportar una publicación' },
]

export function Reports() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [kind, setKind] = useState<Report['kind']>('problema')
  const [message, setMessage] = useState('')
  const [mine, setMine] = useState<Report[]>([])
  const [notice, setNotice] = useState<string | null>(null)
  const [showAuth, setShowAuth] = useState(false)

  const postId = searchParams.get('post')
  const reportedUser = searchParams.get('user')

  useEffect(() => {
    if (postId) setKind('publicacion')
    else if (reportedUser) setKind('usuario')
  }, [postId, reportedUser])

  const loadMine = async () => {
    if (!supabase || !user) return
    const { data } = await supabase.from('reports').select('*').eq('reporter_id', user.id).order('created_at', { ascending: false })
    setMine((data ?? []) as Report[])
  }

  useEffect(() => {
    void loadMine()
  }, [user?.id])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !user) return
    setNotice(null)
    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      kind,
      message: message.trim(),
      post_id: kind === 'publicacion' ? postId : null,
      reported_user_id: kind === 'usuario' ? reportedUser : null,
    })
    if (error) {
      setNotice(`Error: ${error.message}`)
      return
    }
    setMessage('')
    setNotice('¡Mensaje enviado! La administración lo revisará.')
    await loadMine()
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Ayuda</p>
      <h1 className="mt-2 text-4xl font-black text-white">Reportes y mensajes</h1>
      <p className="mt-3 text-slate-400">
        ¿Algo no funciona? ¿Quieres reportar una publicación o a una persona? Escríbenos aquí y la administración lo verá en su panel.
      </p>

      {user ? (
        <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-violet-400/20 bg-white/5 p-6">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Tipo de mensaje</span>
            <select value={kind} onChange={(event) => setKind(event.target.value as Report['kind'])} className="w-full rounded-xl border border-white/10 bg-[#141423] px-4 py-3 text-white focus:border-violet-400 focus:outline-none">
              {kinds.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          {(postId || reportedUser) && (
            <p className="mt-3 rounded-xl bg-cyan-500/10 px-4 py-3 text-xs text-cyan-200">
              {postId ? 'Este reporte está vinculado a una publicación.' : 'Este reporte está vinculado a una persona.'}
            </p>
          )}
          <label className="mt-5 block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Tu mensaje</span>
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={5} required className="w-full resize-y rounded-xl border border-white/10 bg-[#141423] px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" placeholder="Cuéntanos qué pasó…" />
          </label>
          <button type="submit" className="mt-5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white hover:opacity-90">
            Enviar a la administración
          </button>
        </form>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-white/15 p-8 text-center">
          <p className="text-lg font-semibold text-white">Inicia sesión para enviar un mensaje</p>
          <button type="button" onClick={() => setShowAuth(true)} className="mt-5 rounded-full bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500">Entrar / Registrarme</button>
        </div>
      )}

      {notice && <p className="mt-4 rounded-xl bg-violet-500/15 px-4 py-3 text-sm text-violet-200">{notice}</p>}

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-white">Mis mensajes</h2>
        <div className="mt-5 space-y-4">
          {mine.length > 0 ? mine.map((report) => (
            <article key={report.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-bold text-violet-200">{kinds.find((item) => item.value === report.kind)?.label ?? report.kind}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${report.status === 'resuelto' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                  {report.status}
                </span>
                <span className="text-xs text-slate-500">{timeAgo(report.created_at)}</span>
              </div>
              <p className="mt-3 text-slate-300">{report.message}</p>
              {report.admin_reply && (
                <div className="mt-4 rounded-xl border-l-2 border-cyan-400 bg-cyan-500/5 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Respuesta de la administración</p>
                  <p className="mt-1 text-sm text-slate-300">{report.admin_reply}</p>
                </div>
              )}
            </article>
          )) : <p className="rounded-2xl border border-dashed border-white/15 py-10 text-center text-slate-400">Todavía no has enviado mensajes.</p>}
        </div>
      </section>

      <p className="mt-10 text-center text-xs text-slate-500">
        <Link to="/" className="hover:text-violet-300">← Volver al catálogo</Link>
      </p>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
    </div>
  )
}
