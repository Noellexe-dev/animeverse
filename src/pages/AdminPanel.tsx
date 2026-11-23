import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAdmin } from '../hooks/useAdmin'
import { timeAgo } from '../utils/format'

type Tab = 'resumen' | 'usuarios' | 'reportes' | 'publicaciones' | 'comentarios'

function daysSince(date: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000))
}

export function AdminPanel() {
  const { profile, claimAdmin } = useAuth()
  const admin = useAdmin()
  const [tab, setTab] = useState<Tab>('resumen')
  const [reply, setReply] = useState<Record<string, string>>({})
  const [claimNotice, setClaimNotice] = useState<string | null>(null)

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-2xl font-black text-white">Panel de administración</p>
        <p className="mt-3 text-slate-400">Esta zona es solo para la persona administradora de ANIMEVERSE.</p>
        <button
          type="button"
          onClick={() => void claimAdmin().then((message) => setClaimNotice(message))}
          className="mt-6 rounded-full bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500"
        >
          Reclamar administración
        </button>
        <p className="mt-3 text-xs text-slate-500">Solo funciona si todavía no existe ninguna administradora.</p>
        {claimNotice && <p className="mt-4 rounded-xl bg-violet-500/15 px-4 py-3 text-sm text-violet-200">{claimNotice}</p>}
      </div>
    )
  }

  const tabs: Array<{ value: Tab; label: string }> = [
    { value: 'resumen', label: 'Resumen' },
    { value: 'usuarios', label: `Usuarios (${admin.users.length})` },
    { value: 'reportes', label: `Reportes (${admin.reports.length})` },
    { value: 'publicaciones', label: `Posts (${admin.posts.length})` },
    { value: 'comentarios', label: `Comentarios (${admin.comments.length})` },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Solo administración</p>
          <h1 className="mt-2 text-4xl font-black text-white">Panel de control</h1>
          <p className="mt-2 text-slate-400">Gestiona cuentas, verificación, reportes y contenido sin tocar código.</p>
        </div>
        <Link to="/" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-slate-300 hover:bg-white/5">← Volver a la web</Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button key={item.value} type="button" onClick={() => setTab(item.value)} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === item.value ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white' : 'border border-white/10 text-slate-300 hover:bg-white/5'}`}>
            {item.label}
          </button>
        ))}
      </div>

      {admin.notice && <p className="mt-6 rounded-xl bg-violet-500/15 px-4 py-3 text-sm text-violet-200">{admin.notice}</p>}

      {admin.loading ? (
        <p className="mt-10 text-slate-400">Cargando datos…</p>
      ) : (
        <div className="mt-8">
          {tab === 'resumen' && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Usuarios', admin.stats?.users ?? 0],
                ['Publicaciones', admin.stats?.posts ?? 0],
                ['Comentarios', admin.stats?.comments ?? 0],
                ['Opiniones', admin.stats?.reviews ?? 0],
                ['Reportes abiertos', admin.stats?.open_reports ?? 0],
                ['Cuentas bloqueadas', admin.stats?.banned ?? 0],
                ['Cuentas verificadas', admin.stats?.verified ?? 0],
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-slate-400">{label as string}</p>
                  <p className="mt-2 text-3xl font-black text-white">{value as number}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'usuarios' && (
            <div className="space-y-4">
              {admin.users.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex flex-wrap items-start gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-violet-600 font-bold text-white">{(item.display_name ?? item.username).slice(0, 1).toUpperCase()}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link to={`/perfil/${item.username}`} className="font-bold text-white hover:text-violet-300">{item.display_name ?? item.username}</Link>
                        <span className="text-xs text-slate-500">@{item.username}</span>
                        {item.is_verified && <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[11px] font-bold text-cyan-300">✓ Verificado</span>}
                        {item.role === 'admin' && <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-300">ADMIN</span>}
                        {item.role === 'mod' && <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[11px] font-bold text-violet-300">MOD</span>}
                        {item.is_banned && <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[11px] font-bold text-rose-300">BLOQUEADO</span>}
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{item.email}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        Registrada hace {daysSince(item.created_at)} d · Última actividad: {item.last_active_at ? timeAgo(item.last_active_at) : 'sin registro'} · {item.posts} posts · {item.comments} comentarios · {item.reviews} opiniones · {item.reports} reportes
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                    <button type="button" onClick={() => void admin.setVerified(item.id, !item.is_verified)} className="rounded-full border border-cyan-400/30 px-4 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/10">
                      {item.is_verified ? 'Quitar verificado' : 'Dar verificado ✓'}
                    </button>
                    <button type="button" onClick={() => void admin.setBanned(item.id, !item.is_banned)} className="rounded-full border border-rose-400/30 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/10">
                      {item.is_banned ? 'Desbloquear' : 'Bloquear cuenta'}
                    </button>
                    <select
                      value={item.role}
                      onChange={(event) => void admin.setRole(item.id, event.target.value as 'user' | 'mod' | 'admin')}
                      className="rounded-full border border-white/15 bg-[#141423] px-4 py-2 text-xs text-slate-300"
                      aria-label={`Rol de ${item.username}`}
                    >
                      <option value="user">Usuario</option>
                      <option value="mod">Moderador</option>
                      <option value="admin">Admin</option>
                    </select>
                    {item.id !== profile.id && (
                      <button type="button" onClick={() => { if (window.confirm(`¿Borrar la cuenta de ${item.username}?`)) void admin.deleteUser(item.id) }} className="ml-auto rounded-full border border-rose-500/40 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10">
                        Borrar cuenta
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {tab === 'reportes' && (
            <div className="space-y-4">
              {admin.reports.length > 0 ? admin.reports.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-bold text-violet-200">{item.kind}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${item.status === 'resuelto' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>{item.status}</span>
                    <span className="text-xs text-slate-500">{timeAgo(item.created_at)}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">De: {item.reporter ?? '?'} {item.reporter_email ? `· ${item.reporter_email}` : ''}{item.reported ? ` · Reportado: ${item.reported}` : ''}</p>
                  <p className="mt-3 text-slate-200">{item.message}</p>
                  {item.post_text && <p className="mt-2 rounded-xl bg-white/5 px-4 py-3 text-xs text-slate-400">Post: “{item.post_text}”</p>}
                  {item.admin_reply && <p className="mt-3 rounded-xl bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">Tu respuesta: {item.admin_reply}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <input value={reply[item.id] ?? ''} onChange={(event) => setReply((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Escribe tu respuesta…" className="min-w-[200px] flex-1 rounded-xl border border-white/10 bg-[#141423] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
                    <button type="button" onClick={() => void admin.replyReport(item.id, reply[item.id] ?? '')} className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500">Responder</button>
                    <button type="button" onClick={() => void admin.closeReport(item.id)} className="rounded-xl border border-white/15 px-5 py-2.5 text-sm text-slate-300 hover:bg-white/5">Cerrar</button>
                  </div>
                </article>
              )) : <p className="rounded-2xl border border-dashed border-white/15 py-12 text-center text-slate-400">No hay reportes.</p>}
            </div>
          )}

          {tab === 'publicaciones' && (
            <div className="space-y-4">
              {admin.posts.map((item) => (
                <article key={item.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500">@{item.author ?? '?'} · {timeAgo(item.created_at)} · ♥ {item.likes} · 💬 {item.comments}{item.reports > 0 ? ` · ${item.reports} reportes` : ''}</p>
                    <p className="mt-2 line-clamp-2 text-slate-200">{item.text ?? 'Solo imagen'}</p>
                    {item.image_url && <a href={item.image_url} target="_blank" rel="noreferrer" className="mt-1 text-xs text-cyan-300 hover:underline">Ver imagen</a>}
                  </div>
                  <button type="button" onClick={() => { if (window.confirm('¿Eliminar esta publicación?')) void admin.deletePost(item.id) }} className="rounded-full border border-rose-400/40 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/10">Eliminar</button>
                </article>
              ))}
            </div>
          )}

          {tab === 'comentarios' && (
            <div className="space-y-3">
              {admin.comments.map((item) => (
                <article key={item.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500">@{item.author ?? '?'} · {timeAgo(item.created_at)}</p>
                    <p className="mt-1 text-sm text-slate-200">{item.text}</p>
                  </div>
                  <button type="button" onClick={() => { if (window.confirm('¿Eliminar este comentario?')) void admin.deleteComment(item.id) }} className="rounded-full border border-rose-400/40 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/10">Eliminar</button>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
