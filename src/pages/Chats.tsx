import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChats } from '../hooks/useChats'
import { timeAgo } from '../utils/format'

export function Chats() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const { contacts, messages, loading, activeId, setActiveId, sendMessage } = useChats()
  const [text, setText] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const selected = contacts.find((contact) => contact.id === activeId) ?? null

  useEffect(() => {
    const contact = searchParams.get('con')
    if (contact) setActiveId(contact)
  }, [searchParams, setActiveId])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!activeId || !text.trim()) return
    void sendMessage(activeId, text).then((message) => {
      if (message) setNotice(message)
      else setText('')
    })
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-lg font-semibold text-white">Inicia sesión para chatear con otros fans</p>
        <p className="mt-2 text-sm text-slate-400">Los chats son entre amigos (personas que se siguen mutuamente).</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Mensajes</p>
      <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Chats</h1>
      <p className="mt-2 text-sm text-slate-400">
        Los mensajes se borran automáticamente después de 7 días, pero tus amigos se quedan aquí.
      </p>

      <div className="mt-6 flex h-[calc(100vh-12rem)] min-h-[30rem] flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:flex-row">
        <aside className="flex h-40 shrink-0 flex-col border-b border-white/10 md:h-auto md:w-64 md:border-b-0 md:border-r">
          <h2 className="px-4 py-3 text-sm font-bold uppercase tracking-wider text-slate-400">Amigos</h2>
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-3">
            {loading ? <p className="px-2 text-sm text-slate-500">Cargando…</p> : contacts.length > 0 ? contacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => setActiveId(contact.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${activeId === contact.id ? 'bg-violet-600/30' : 'hover:bg-white/5'}`}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-600 text-sm font-bold text-white">
                  {(contact.display_name ?? contact.username).slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-white">{contact.display_name ?? contact.username}</span>
                {contact.is_verified && <span className="text-xs text-cyan-300">✓</span>}
              </button>
            )) : (
              <p className="px-2 text-sm text-slate-400">
                Aún no tienes amigos. Sigue a alguien y espera a que te siga en la <Link to="/comunidad" className="text-violet-300 hover:underline">Comunidad</Link>.
              </p>
            )}
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          {selected ? (
            <>
              <header className="flex shrink-0 items-center gap-3 border-b border-white/10 px-5 py-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-violet-600 text-sm font-bold text-white">
                  {(selected.display_name ?? selected.username).slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold text-white">{selected.display_name ?? selected.username}</p>
                  <p className="text-xs text-slate-500">@{selected.username} · últimos 7 días</p>
                </div>
              </header>
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
                {messages.length > 0 ? messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${message.sender_id === user.id ? 'bg-violet-600 text-white' : 'bg-white/10 text-slate-200'}`}>
                      <p className="whitespace-pre-wrap break-words text-sm">{message.text}</p>
                      <p className="mt-1 text-right text-[10px] opacity-60">{timeAgo(message.created_at)}</p>
                    </div>
                  </div>
                )) : <div className="grid h-full place-items-center text-4xl text-slate-700">💬</div>}
              </div>
              <form onSubmit={handleSubmit} className="flex shrink-0 gap-2 border-t border-white/10 p-3 sm:p-4">
                <input
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Escribe un mensaje…"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#141423] px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
                />
                <button type="submit" className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-500">
                  Enviar
                </button>
              </form>
            </>
          ) : (
            <div className="grid min-h-0 flex-1 place-items-center text-5xl text-slate-700">💬</div>
          )}
          {notice && <p className="shrink-0 px-5 pb-3 text-sm text-rose-300">{notice}</p>}
        </section>
      </div>
    </div>
  )
}
