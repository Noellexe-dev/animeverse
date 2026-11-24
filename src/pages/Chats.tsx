import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChats } from '../hooks/useChats'
import { useIntroVisible } from '../hooks/useIntroVisible'
import { timeAgo } from '../utils/format'

const GIFTS = ['🌸', '🍜', '⭐', '🎀', '🍡', '🐱', '💫', '🍰']

function giftFrom(text: string) {
  return text.startsWith('🎁 ') ? text.slice(2) : null
}

export function Chats() {
  const { user } = useAuth()
  const showIntro = useIntroVisible()
  const [searchParams] = useSearchParams()
  const { contacts, messages, loading, activeId, setActiveId, sendMessage } = useChats()
  const [text, setText] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [showGifts, setShowGifts] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const selected = contacts.find((contact) => contact.id === activeId) ?? null

  useEffect(() => {
    const contact = searchParams.get('con')
    if (contact) setActiveId(contact)
  }, [searchParams, setActiveId])

  useEffect(() => {
    const node = scrollRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [messages.length, activeId])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!activeId || !text.trim()) return
    void sendMessage(activeId, text).then((message) => {
      if (message) setNotice(message)
      else setText('')
    })
  }

  function sendGift(emoji: string) {
    if (!activeId) return
    setShowGifts(false)
    void sendMessage(activeId, `🎁 ${emoji}`).then((message) => {
      if (message) setNotice(message)
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
    <div className="flex h-full min-h-0 w-full">
      <div className="flex h-full min-h-0 w-full flex-col">
        {showIntro ? (
          <header className="shrink-0 border-b border-white/10 px-4 py-3 sm:px-6">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Mensajes</p>
            <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Chats</h1>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              Los mensajes se borran automáticamente después de 7 días, pero tus amigos se quedan aquí.
            </p>
          </header>
        ) : (
          <h1 className="sr-only">Mensajes</h1>
        )}

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <aside className="flex h-28 shrink-0 flex-col border-b border-white/10 md:h-auto md:w-72 md:border-b-0 md:border-r">
            <div className="flex shrink-0 items-center justify-between px-4 py-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Amigos</h2>
              {loading && <span className="text-xs text-slate-500">…</span>}
            </div>
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-3">
              {contacts.length > 0 ? contacts.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => { setActiveId(contact.id); setNotice(null) }}
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
                <header className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 py-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-violet-600 text-sm font-bold text-white">
                    {(selected.display_name ?? selected.username).slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-white">{selected.display_name ?? selected.username}</p>
                    <p className="text-xs text-slate-500">@{selected.username} · últimos 7 días</p>
                  </div>
                  <Link to={`/perfil/${selected.username}`} className="ml-auto rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5">
                    Ver perfil
                  </Link>
                </header>

                <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-5 sm:px-6">
                  {messages.map((message) => {
                    const mine = message.sender_id === user.id
                    const gift = giftFrom(message.text)
                    return (
                      <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        {gift ? (
                          <div className="gift-pop flex items-center gap-3 rounded-2xl border border-amber-300/30 bg-gradient-to-r from-amber-500/20 to-pink-500/20 px-4 py-3">
                            <span className="text-4xl">{gift}</span>
                            <span>
                              <span className="block text-sm font-bold text-amber-100">¡Regalo enviado!</span>
                              <span className="text-[10px] text-amber-200/60">{timeAgo(message.created_at)}</span>
                            </span>
                          </div>
                        ) : (
                          <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${mine ? 'bg-violet-600 text-white' : 'bg-white/10 text-slate-200'}`}>
                            <p className="whitespace-pre-wrap break-words text-sm">{message.text}</p>
                            <p className="mt-1 text-right text-[10px] opacity-60">{timeAgo(message.created_at)}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {notice && <p className="shrink-0 px-4 pb-2 text-sm text-rose-300">{notice}</p>}

                <form onSubmit={handleSubmit} className="flex shrink-0 items-end gap-2 border-t border-white/10 p-3 sm:p-4">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowGifts((value) => !value)}
                      aria-label="Enviar regalo"
                      title="Enviar regalo"
                      className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 text-2xl hover:bg-white/5"
                    >
                      🎁
                    </button>
                    {showGifts && (
                      <div className="absolute bottom-14 left-0 z-20 grid w-56 grid-cols-4 gap-1 rounded-2xl border border-amber-300/20 bg-[#1b1b2b] p-2 shadow-2xl shadow-black/60">
                        {GIFTS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => sendGift(emoji)}
                            className="grid h-11 place-items-center rounded-xl text-2xl hover:bg-white/10"
                            title={`Enviar ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Escribe un mensaje…"
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
                  />
                  <button type="submit" className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-500">
                    Enviar
                  </button>
                </form>
              </>
            ) : (
              <div className="grid min-h-0 flex-1 place-items-center text-6xl text-slate-700">💬</div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
