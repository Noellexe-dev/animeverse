import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSocial } from '../context/SocialContext'
import { animes } from '../data/anime'
import type { Post } from '../types'

const NICKNAME_KEY = 'animeverse:nickname'

function timeAgo(timestamp: number): string {
  const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000))
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  return `hace ${days} d`
}

interface PostCardProps {
  post: Post
  nickname: string
  onLike: (id: string) => void
  onComment: (postId: string, author: string, text: string) => void
  onDelete: (id: string) => void
}

function PostCard({ post, nickname, onLike, onComment, onDelete }: PostCardProps) {
  const [commentText, setCommentText] = useState('')
  const anime = animes.find((item) => item.id === post.animeId)
  const isMine = nickname.trim().toLowerCase() === post.author.toLowerCase()

  function handleComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!commentText.trim()) return
    onComment(post.id, nickname, commentText)
    setCommentText('')
  }

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <header className="flex items-start gap-4">
        {anime ? (
          <Link to={`/anime/${anime.id}`} className="shrink-0">
            <img
              src={anime.image}
              alt={`Póster de ${anime.title}`}
              loading="lazy"
              className="h-24 w-16 rounded-lg object-cover"
            />
          </Link>
        ) : (
          <div className="h-24 w-16 shrink-0 rounded-lg bg-white/10" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-500/20 px-2.5 py-1 text-xs font-semibold text-violet-200">
              {post.author}
            </span>
            <span className="text-xs text-slate-500">{timeAgo(post.createdAt)}</span>
            <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-300">
              ★ {post.rating}/10
            </span>
          </div>

          <Link
            to={`/anime/${post.animeId}`}
            className="mt-2 block text-lg font-bold text-white hover:text-violet-300"
          >
            {anime?.title ?? 'Anime desconocido'}
          </Link>

          <p className="mt-2 leading-relaxed text-slate-300">{post.text}</p>
        </div>
      </header>

      <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={() => onLike(post.id)}
          aria-pressed={post.likedByMe}
          className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
            post.likedByMe
              ? 'bg-rose-500 text-white'
              : 'border border-white/15 text-slate-300 hover:border-rose-400 hover:text-rose-300'
          }`}
        >
          ♥ {post.likes}
        </button>
        <span className="text-sm text-slate-400">{post.comments.length} comentarios</span>
        {isMine && (
          <button
            type="button"
            onClick={() => onDelete(post.id)}
            className="ml-auto text-xs text-slate-500 hover:text-rose-400"
          >
            Eliminar
          </button>
        )}
      </div>

      {post.comments.length > 0 && (
        <div className="mt-4 space-y-3 border-l-2 border-violet-500/30 pl-4">
          {post.comments.map((comment) => (
            <div key={comment.id} className="text-sm">
              <span className="font-semibold text-violet-200">{comment.author}</span>
              <span className="ml-2 text-xs text-slate-500">{timeAgo(comment.createdAt)}</span>
              <p className="mt-1 text-slate-300">{comment.text}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleComment} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Tu comentario</span>
          <input
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="Escribe un comentario…"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500"
        >
          Comentar
        </button>
      </form>
    </article>
  )
}

export function Community() {
  const [searchParams] = useSearchParams()
  const preselected = searchParams.get('anime') ?? ''
  const { posts, addPost, toggleLike, addComment, deletePost } = useSocial()

  const [nickname, setNickname] = useState(() => localStorage.getItem(NICKNAME_KEY) ?? '')
  const [animeId, setAnimeId] = useState(() =>
    animes.some((item) => item.id === preselected) ? preselected : animes[0].id,
  )
  const [text, setText] = useState('')
  const [rating, setRating] = useState(9)

  useEffect(() => {
    if (preselected && animes.some((item) => item.id === preselected)) {
      setAnimeId(preselected)
    }
  }, [preselected])

  useEffect(() => {
    try {
      localStorage.setItem(NICKNAME_KEY, nickname)
    } catch {
      // Ignorar si no hay almacenamiento disponible.
    }
  }, [nickname])

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => b.createdAt - a.createdAt),
    [posts],
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!text.trim()) return
    addPost({ animeId, author: nickname, text, rating })
    setText('')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Comunidad</p>
      <h1 className="mt-2 text-4xl font-black text-white">Recomienda y conversa</h1>
      <p className="mt-3 max-w-2xl text-slate-400">
        Comparte qué estás viendo, recomienda un anime y comenta las recomendaciones de los demás.
        Todo se guarda en este navegador: no hay cuentas ni datos enviados a internet.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-2xl border border-violet-400/20 bg-white/5 p-5 sm:p-6"
      >
        <h2 className="text-lg font-bold text-white">Nueva recomendación</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tu nombre
            </span>
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="Ej. Maru"
              className="w-full rounded-xl border border-white/10 bg-[#141423] px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
            />
          </label>

          <label>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Anime
            </span>
            <select
              value={animeId}
              onChange={(event) => setAnimeId(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#141423] px-4 py-3 text-white focus:border-violet-400 focus:outline-none"
            >
              {animes.map((anime) => (
                <option key={anime.id} value={anime.id}>
                  {anime.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Tu recomendación
          </span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="¿Por qué lo recomiendas?"
            rows={3}
            className="w-full resize-y rounded-xl border border-white/10 bg-[#141423] px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
          />
        </label>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="sm:w-40">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Puntuación: {rating}/10
            </span>
            <input
              type="range"
              min={1}
              max={10}
              value={rating}
              onChange={(event) => setRating(Number(event.target.value))}
              className="w-full accent-violet-500"
            />
          </label>

          <button
            type="submit"
            disabled={!text.trim()}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Publicar recomendación
          </button>
        </div>
      </form>

      <div className="mb-5 mt-12 flex items-baseline justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Muro de la comunidad</h2>
        <span className="text-sm text-slate-400">{sortedPosts.length} publicaciones</span>
      </div>

      {sortedPosts.length > 0 ? (
        <div className="space-y-5">
          {sortedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              nickname={nickname}
              onLike={toggleLike}
              onComment={addComment}
              onDelete={deletePost}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center">
          <p className="text-lg font-semibold text-white">Todavía no hay recomendaciones</p>
          <p className="mt-2 text-sm text-slate-400">Sé la primera persona en compartir una.</p>
        </div>
      )}
    </div>
  )
}
