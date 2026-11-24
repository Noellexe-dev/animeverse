import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthModal } from '../components/AuthModal'
import { MoreMenu } from '../components/MoreMenu'
import { PostCard } from '../components/PostCard'
import { ReviewCard } from '../components/ReviewCard'
import { useAuth } from '../context/AuthContext'
import { animes } from '../data/anime'
import { useFollows } from '../hooks/useFollows'
import { useIntroVisible } from '../hooks/useIntroVisible'
import { usePosts } from '../hooks/usePosts'
import { useReviewFeed } from '../hooks/useReviews'
import { parseHashtags } from '../utils/format'

type Tab = 'general' | 'siguiendo'

interface FeedItem {
  id: string
  created_at: string
  node: ReactNode
}

export function Community() {
  const { user } = useAuth()
  const showIntro = useIntroVisible()
  const [searchParams] = useSearchParams()
  const highlightedPost = searchParams.get('post')
  const [tab, setTab] = useState<Tab>('general')
  const [search, setSearch] = useState('')
  const { posts, loading, error: postsError, addPost, toggleLike, addComment, deletePost } = usePosts(tab === 'general' ? 'all' : 'feed')
  const { following, people, friends, toggleFollow } = useFollows()
  const { reviews, loading: reviewsLoading, error: reviewsError } = useReviewFeed(tab === 'general' ? undefined : following)
  const [text, setText] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [tag, setTag] = useState<string | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [composerOpen, setComposerOpen] = useState(false)

  const hashtags = useMemo(() => parseHashtags(posts.map((post) => post.text).join(' ')), [posts])

  const searchTerm = search.trim().toLowerCase().replace(/^#/, '')
  const matches = (...values: Array<string | null | undefined>) =>
    !searchTerm || values.some((value) => value?.toLowerCase().includes(searchTerm))

  const visiblePosts = posts.filter((post) => {
    if (tag && !parseHashtags(post.text).includes(tag)) return false
    const animeTitle = animes.find((item) => item.id === post.anime_id)?.title
    return matches(post.text, post.author?.display_name, post.author?.username, animeTitle, ...parseHashtags(post.text))
  })

  const visibleReviews = reviews.filter((review) => {
    const animeTitle = animes.find((item) => item.id === review.anime_id)?.title
    return matches(review.text, review.author?.display_name, review.author?.username, animeTitle)
  })

  const visiblePeople = people.filter((person) =>
    matches(person.display_name, person.username),
  )

  const feed = useMemo<FeedItem[]>(() => {
    const postItems: FeedItem[] = visiblePosts.map((post) => ({
      id: post.id,
      created_at: post.created_at,
      node: (
        <PostCard
          post={post}
          onLike={(id) => void toggleLike(id).then((message) => message && setNotice(message))}
          onComment={(id, value) => void addComment(id, value).then((message) => message && setNotice(message))}
          onDelete={(id) => void deletePost(id).then((message) => message && setNotice(message))}
        />
      ),
    }))
    if (tag) return postItems
    const reviewItems: FeedItem[] = visibleReviews.map((review) => ({
      id: review.id,
      created_at: review.created_at,
      node: <ReviewCard review={review} />,
    }))
    return [...postItems, ...reviewItems].sort((a, b) => b.created_at.localeCompare(a.created_at))
  }, [visiblePosts, visibleReviews, tag, toggleLike, addComment, deletePost])

  useEffect(() => {
    if (!highlightedPost || loading) return
    document.getElementById(`post-${highlightedPost}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [highlightedPost, loading])

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setImage(file)
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  function openComposer() {
    if (!user) {
      setShowAuth(true)
      return
    }
    setComposerOpen(true)
    setNotice(null)
  }

  function closeComposer() {
    setComposerOpen(false)
    setText('')
    setImage(null)
    setPreview(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(null)
    const message = await addPost({ text, image })
    if (message) {
      setNotice(message)
      return
    }
    closeComposer()
    setNotice('¡Publicado!')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {showIntro ? (
        <>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Comunidad</p>
          <h1 className="mt-2 text-4xl font-black text-white">Tu universo anime</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Lo que sube la gente: publicaciones, opiniones y puntuaciones de todos los animes. Comparte texto, imágenes o ambas cosas y usa hashtags como <span className="text-cyan-300">#Shonen</span>.
          </p>
        </>
      ) : (
        <h1 className="text-2xl font-black text-white sm:text-3xl">Comunidad</h1>
      )}

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Buscar en la comunidad</span>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar hashtags, palabras, animes o usuarios…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
          />
        </label>
        {search && (
          <button type="button" onClick={() => setSearch('')} className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-300 hover:bg-white/5">
            Limpiar
          </button>
        )}
      </div>

      <div className="mb-5 mt-5 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => { setTab('general'); setTag(null) }} className={`rounded-full px-5 py-2 text-sm font-bold ${tab === 'general' ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white' : 'border border-white/10 text-slate-300'}`}>
          General
        </button>
        <button type="button" onClick={() => { setTab('siguiendo'); setTag(null) }} className={`rounded-full px-5 py-2 text-sm font-bold ${tab === 'siguiendo' ? 'bg-violet-600 text-white' : 'border border-white/10 text-slate-300'}`}>
          Siguiendo
        </button>
        {hashtags.slice(0, 5).map((item) => (
          <button key={item} type="button" onClick={() => setTag(tag === item ? null : item)} className={`rounded-full px-4 py-2 text-sm font-bold ${tag === item ? 'bg-cyan-600 text-white' : 'border border-white/10 text-cyan-300'}`}>
            {item}
          </button>
        ))}
      </div>

      {notice && <p className="mt-4 rounded-xl bg-violet-500/15 px-4 py-3 text-sm text-violet-200">{notice}</p>}
      {(postsError || reviewsError) && <p className="mt-3 rounded-xl bg-rose-500/15 px-4 py-3 text-xs text-rose-200">{postsError || reviewsError}</p>}

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          {loading || reviewsLoading ? (
            <p className="text-slate-400">Cargando publicaciones…</p>
          ) : feed.length > 0 ? (
            <div className="space-y-5">{feed.map((item) => (
              <div
                key={item.id}
                id={`post-${item.id}`}
                className={highlightedPost === item.id ? 'rounded-2xl ring-2 ring-violet-400' : undefined}
              >
                {item.node}
              </div>
            ))}</div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 py-14 text-center">
              <p className="text-lg font-semibold text-white">
                {searchTerm
                  ? `Sin resultados para «${search.trim()}»`
                  : tab === 'siguiendo' && !user
                    ? 'Inicia sesión para ver a quienes sigues'
                    : tag
                      ? `No hay publicaciones con ${tag}`
                      : 'Todavía no hay actividad por aquí'}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {tab === 'general' ? 'La comunidad se llena con publicaciones y opiniones de los fans.' : 'Sigue a otros fans para ver su actividad aquí.'}
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="font-bold text-white">Fans de ANIMEVERSE</h2>
            <div className="mt-4 space-y-4">
              {visiblePeople.length > 0 ? visiblePeople.map((person) => (
                <div key={person.id} className="flex items-center gap-3">
                  <Link to={`/perfil/${person.username}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-600 text-sm font-bold text-white">
                    {(person.display_name ?? person.username).slice(0, 1).toUpperCase()}
                  </Link>
                  <Link to={`/perfil/${person.username}`} className="min-w-0 flex-1 truncate text-sm text-white hover:text-violet-300">
                    {person.display_name ?? person.username}
                    {person.is_verified && <span className="ml-1 text-xs text-cyan-300">✓</span>}
                  </Link>
                  <button type="button" onClick={() => void toggleFollow(person.id)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${following.includes(person.id) ? 'border border-white/15 text-slate-300' : 'bg-violet-600 text-white hover:bg-violet-500'}`}>
                    {following.includes(person.id) ? 'Siguiendo' : 'Seguir'}
                  </button>
                </div>
              )) : <p className="text-sm text-slate-400">Todavía no hay fans registrados.</p>}
            </div>
          </div>

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

          {user && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <MoreMenu label="Opciones de comunidad" items={[
                { label: 'Reportes y ayuda', to: '/ayuda' },
                { label: 'Ajustes', to: '/ajustes' },
              ]} />
              <p className="mt-3 text-xs text-slate-500">Más opciones</p>
            </div>
          )}
        </aside>
      </div>

      {composerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 p-3 sm:items-end sm:p-6" onClick={closeComposer}>
          <form
            onSubmit={handleSubmit}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-violet-400/30 bg-[#161626] p-5 shadow-2xl shadow-black/70"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Nueva publicación</h2>
              <button type="button" onClick={closeComposer} className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Cerrar">✕</button>
            </div>
            <textarea
              autoFocus
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={4}
              placeholder="¿Qué estás viendo? Usa #hashtags…"
              className="mt-4 w-full resize-y rounded-xl border border-white/10 bg-[#101020] px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
            />
            {preview && <img src={preview} alt="Vista previa" className="mt-3 max-h-56 w-full rounded-xl object-cover" />}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="cursor-pointer rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
                🖼️ {image ? 'Cambiar imagen' : 'Agregar imagen'}
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
              <button type="submit" disabled={!text.trim() && !image} className="ml-auto rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40">
                Publicar
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-500">Solo texto, solo imagen o ambos. Elegir un anime no es obligatorio.</p>
          </form>
        </div>
      )}

      {!composerOpen && (
        <button
          type="button"
          onClick={openComposer}
          aria-label="Nueva publicación"
          className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-3xl font-light leading-none text-white shadow-2xl shadow-violet-900/60 transition-transform hover:scale-110"
        >
          +
        </button>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
    </div>
  )
}
