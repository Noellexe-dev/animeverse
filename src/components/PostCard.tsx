import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { animes } from '../data/anime'
import type { Post } from '../types'
import { renderTextWithHashtags, timeAgo } from '../utils/format'

interface PostCardProps {
  post: Post
  onLike: (id: string) => void
  onComment: (id: string, text: string) => void
  onDelete: (id: string) => void
  onTagClick?: (tag: string) => void
}

export function PostCard({ post, onLike, onComment, onDelete, onTagClick }: PostCardProps) {
  const { user } = useAuth()
  const [comment, setComment] = useState('')
  const [showComments, setShowComments] = useState(false)
  const anime = post.anime_id ? animes.find((item) => item.id === post.anime_id) : null
  const isMine = post.user_id === user?.id

  function handleComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!comment.trim()) return
    onComment(post.id, comment)
    setComment('')
  }

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <header className="flex items-start gap-3">
        <Link to={post.author ? `/perfil/${post.author.username}` : '/perfil'} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 font-bold text-white">
          {(post.author?.display_name ?? post.author?.username ?? '?').slice(0, 1).toUpperCase()}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={post.author ? `/perfil/${post.author.username}` : '/perfil'} className="font-bold text-white hover:text-violet-300">
              {post.author?.display_name ?? post.author?.username ?? 'Fan anónimo'}
            </Link>
            {post.author && <span className="text-xs text-slate-500">@{post.author.username}</span>}
            <span className="text-xs text-slate-500">· {timeAgo(post.created_at)}</span>
          </div>
          {anime && (
            <Link to={`/anime/${anime.id}`} className="mt-1 block text-xs font-semibold text-cyan-300 hover:underline">
              Sobre {anime.title}
            </Link>
          )}
        </div>
        {isMine && (
          <button type="button" onClick={() => onDelete(post.id)} className="text-xs text-slate-500 hover:text-rose-400">
            Borrar
          </button>
        )}
      </header>

      {post.text && (
        <p className="mt-4 whitespace-pre-wrap leading-relaxed text-slate-200">
          {renderTextWithHashtags(post.text)}
        </p>
      )}

      {post.image_url && (
        <img src={post.image_url} alt="Imagen de la publicación" loading="lazy" className="mt-4 max-h-[28rem] w-full rounded-xl border border-white/10 object-cover" />
      )}

      <div className="mt-5 flex items-center gap-5 border-t border-white/10 pt-4 text-sm">
        <button
          type="button"
          onClick={() => onLike(post.id)}
          aria-pressed={post.liked_by_me}
          className={`flex items-center gap-1.5 font-semibold ${post.liked_by_me ? 'text-rose-400' : 'text-slate-400 hover:text-rose-300'}`}
        >
          {post.liked_by_me ? '♥' : '♡'} {post.like_count ?? 0}
        </button>
        <button type="button" onClick={() => setShowComments((value) => !value)} className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300">
          💬 {post.comments?.length ?? 0}
        </button>
        {onTagClick && (
          <span className="ml-auto text-xs text-slate-500">
            {(post.text?.match(/#[\p{L}\p{N}_]+/gu) ?? []).slice(0, 2).join(' ')}
          </span>
        )}
      </div>

      {showComments && (
        <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
          {(post.comments ?? []).map((item) => (
            <div key={item.id} className="text-sm">
              <span className="font-bold text-violet-200">{item.author?.display_name ?? item.author?.username ?? 'Fan'}</span>
              <span className="ml-2 text-xs text-slate-500">{timeAgo(item.created_at)}</span>
              <p className="mt-1 text-slate-300">{item.text}</p>
            </div>
          ))}
          {user ? (
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Responder…"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
              />
              <button type="submit" className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-500">
                Enviar
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-500">Inicia sesión para responder.</p>
          )}
        </div>
      )}
    </article>
  )
}
