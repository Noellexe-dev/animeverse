import { Link } from 'react-router-dom'
import { animes } from '../data/anime'
import type { AnimeReview } from '../types'
import { timeAgo } from '../utils/format'

interface ReviewCardProps {
  review: AnimeReview
}

export function ReviewCard({ review }: ReviewCardProps) {
  const anime = animes.find((item) => item.id === review.anime_id)

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <header className="flex items-start gap-3">
        <Link
          to={review.author ? `/perfil/${review.author.username}` : '/perfil'}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 font-bold text-white"
        >
          {(review.author?.display_name ?? review.author?.username ?? '?').slice(0, 1).toUpperCase()}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={review.author ? `/perfil/${review.author.username}` : '/perfil'}
              className="font-bold text-white hover:text-violet-300"
            >
              {review.author?.display_name ?? review.author?.username ?? 'Fan anónimo'}
            </Link>
            {review.author && <span className="text-xs text-slate-500">@{review.author.username}</span>}
            <span className="text-xs text-slate-500">· {timeAgo(review.created_at)}</span>
          </div>
          <Link
            to={`/anime/${review.anime_id}`}
            className="mt-1 inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20"
          >
            ★ {anime?.title ?? 'Anime'} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <span className="shrink-0 text-sm text-amber-300" title={`${review.rating} de 5 estrellas`}>
          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
        </span>
      </header>
      {review.text && <p className="mt-4 whitespace-pre-wrap leading-relaxed text-slate-300">{review.text}</p>}
    </article>
  )
}
