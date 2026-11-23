import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthModal } from '../components/AuthModal'
import { PostCard } from '../components/PostCard'
import { useAuth } from '../context/AuthContext'
import { animes } from '../data/anime'
import { useFollows } from '../hooks/useFollows'
import { usePosts } from '../hooks/usePosts'
import { parseHashtags } from '../utils/format'

export function Community() {
  const { user } = useAuth()
  const { posts, loading, addPost, toggleLike, addComment, deletePost } = usePosts('feed')
  const { discover, friends, toggleFollow } = useFollows()
  const [text, setText] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [animeId, setAnimeId] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [tag, setTag] = useState<string | null>(null)
  const [showAuth, setShowAuth] = useState(false)

  const hashtags = useMemo(() => parseHashtags(posts.map((post) => post.text).join(' ')), [posts])
  const visiblePosts = tag ? posts.filter((post) => parseHashtags(post.text).includes(tag)) : posts

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setImage(file)
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(null)
    const message = await addPost({ text, image, animeId: animeId || null })
    if (message) {
      setNotice(message)
      return
    }
    setText('')
    setImage(null)
    setPreview(null)
    setAnimeId('')
    setNotice('¡Publicado!')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Comunidad</p>
      <h1 className="mt-2 text-4xl font-black text-white">Tu universo anime</h1>
      <p className="mt-3 max-w-2xl text-slate-400">
        Lo último que publican las personas que sigues y quienes te siguen. Comparte texto, imágenes o ambas cosas y usa hashtags como <span className="text-cyan-300">#Shonen</span>.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          {user ? (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-violet-400/20 bg-white/5 p-5">
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={3}
                placeholder="¿Qué estás viendo? Usa #hashtags…"
                className="w-full resize-y rounded-xl border border-white/10 bg-[#141423] px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
              />
              {preview && <img src={preview} alt="Vista previa" className="mt-3 max-h-64 rounded-xl object-cover" />}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="cursor-pointer rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
                  🖼️ {image ? 'Cambiar imagen' : 'Agregar imagen'}
                  <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                </label>
                <select
                  value={animeId}
                  onChange={(event) => setAnimeId(event.target.value)}
                  className="rounded-full border border-white/15 bg-[#141423] px-4 py-2 text-sm text-slate-300 focus:border-violet-400 focus:outline-none"
                >
                  <option value="">Sin anime específico</option>
                  {animes.map((anime) => <option key={anime.id} value={anime.id}>{anime.title}</option>)}
                </select>
                <button type="submit" disabled={!text.trim() && !image} className="rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40 sm:ml-auto">
                  Publicar
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-500">Puedes publicar solo texto, solo imagen o ambos.</p>
            </form>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
              <p className="text-lg font-semibold text-white">Inicia sesión para publicar y seguir a otros fans</p>
              <p className="mt-2 text-sm text-slate-400">Puedes explorar el catálogo igualmente como visitante.</p>
              <button type="button" onClick={() => setShowAuth(true)} className="mt-5 rounded-full bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500">
                Entrar / Registrarme
              </button>
            </div>
          )}

          {notice && <p className="mt-4 rounded-xl bg-violet-500/15 px-4 py-3 text-sm text-violet-200">{notice}</p>}

          <div className="mb-5 mt-10 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setTag(null)} className={`rounded-full px-4 py-2 text-sm font-bold ${tag === null ? 'bg-violet-600 text-white' : 'border border-white/10 text-slate-300'}`}>
              Siguiendo
            </button>
            {hashtags.slice(0, 6).map((item) => (
              <button key={item} type="button" onClick={() => setTag(item)} className={`rounded-full px-4 py-2 text-sm font-bold ${tag === item ? 'bg-cyan-600 text-white' : 'border border-white/10 text-cyan-300'}`}>
                {item}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-slate-400">Cargando publicaciones…</p>
          ) : visiblePosts.length > 0 ? (
            <div className="space-y-5">
              {visiblePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={(id) => void toggleLike(id).then((message) => message && setNotice(message))}
                  onComment={(id, value) => void addComment(id, value).then((message) => message && setNotice(message))}
                  onDelete={(id) => void deletePost(id).then((message) => message && setNotice(message))}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 py-14 text-center">
              <p className="text-lg font-semibold text-white">
                {user ? 'Tu muro está vacío' : 'Inicia sesión para ver tu muro'}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {user ? 'Sigue a otros fans o publica algo para empezar.' : 'El feed muestra publicaciones de personas que sigues y te siguen.'}
              </p>
              {user && (
                <Link to="/perfil" className="mt-5 inline-block rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-500">
                  Buscar personas
                </Link>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          {user && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="font-bold text-white">Personas para seguir</h2>
              <div className="mt-4 space-y-4">
                {discover.length > 0 ? discover.slice(0, 5).map((person) => (
                  <div key={person.id} className="flex items-center gap-3">
                    <Link to={`/perfil/${person.username}`} className="grid h-9 w-9 place-items-center rounded-full bg-violet-600 text-sm font-bold text-white">
                      {(person.display_name ?? person.username).slice(0, 1).toUpperCase()}
                    </Link>
                    <Link to={`/perfil/${person.username}`} className="min-w-0 flex-1 truncate text-sm text-white hover:text-violet-300">
                      {person.display_name ?? person.username}
                    </Link>
                    <button type="button" onClick={() => void toggleFollow(person.id)} className="rounded-full bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-500">
                      Seguir
                    </button>
                  </div>
                )) : <p className="text-sm text-slate-400">Ya sigues a todos los fans disponibles.</p>}
              </div>
            </div>
          )}

          {friends.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="font-bold text-white">Tus amigos</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {friends.map((person) => (
                  <Link key={person.id} to={`/chats?con=${person.id}`} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-400 hover:text-cyan-300">
                    💬 {person.display_name ?? person.username}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
    </div>
  )
}
