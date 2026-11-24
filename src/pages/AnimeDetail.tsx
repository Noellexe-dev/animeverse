import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AuthModal } from '../components/AuthModal'
import { useAuth } from '../context/AuthContext'
import { animes } from '../data/anime'
import { useLibrary } from '../hooks/useLibrary'
import { useReviews } from '../hooks/useReviews'
import type { LibraryStatus } from '../types'
import { timeAgo } from '../utils/format'
import { NotFound } from './NotFound'

const statusOptions: Array<{ value: LibraryStatus; label: string }> = [
  { value: 'favorito', label: '♥ Favorito' },
  { value: 'viendo', label: '▶ Viendo' },
  { value: 'visto', label: '✓ Visto' },
]

export function AnimeDetail() {
  const { id } = useParams<{ id: string }>()
  const anime = animes.find((item) => item.id === id)
  const { user } = useAuth()
  const { items, setAnimeStatus } = useLibrary()
  const { reviews, loading, error: reviewsError, myReview, average, saveReview, deleteReview } = useReviews(id ?? '')
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [reviewNotice, setReviewNotice] = useState<string | null>(null)
  const [showAuth, setShowAuth] = useState(false)

  if (!anime) return <NotFound message="Ese anime no existe en el catálogo." />

  const current = items.find((item) => item.anime_id === anime.id)

  async function handleStatus(status: LibraryStatus) {
    setNotice(null)
    const message = await setAnimeStatus(anime!.id, status)
    setNotice(message ?? 'Listo, actualizado en tu perfil.')
  }

  async function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setReviewNotice(null)
    const message = await saveReview(rating, text)
    if (message) {
      setReviewNotice(message)
      return
    }
    if (!current && rating > 0) {
      await setAnimeStatus(anime!.id, 'visto', rating)
    }
    setText('')
    setReviewNotice('¡Opinión publicada!')
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
        <span aria-hidden="true">←</span> Volver al catálogo
      </Link>

      <div className="mt-8 grid gap-10 md:grid-cols-[280px_1fr]">
        <img
          src={anime.image}
          alt={`Póster de ${anime.title}`}
          className="mx-auto w-full max-w-[280px] rounded-2xl border border-white/10 shadow-2xl shadow-black/40"
        />

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">{anime.japaneseTitle}</p>
          <h1 className="mt-2 text-4xl font-black text-white sm:text-5xl">{anime.title}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-amber-400/15 px-3 py-1 font-semibold text-amber-300">
              {anime.rating > 0 ? `★ ${anime.rating.toFixed(1)}` : 'Próximamente'}
            </span>
            <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300">{anime.year}</span>
            <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300">
              {anime.episodes > 0 ? `${anime.episodes} episodios` : 'Por confirmar'}
            </span>
            <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300">{anime.studio}</span>
            <span className="rounded-full bg-violet-500/20 px-3 py-1 text-violet-200">{anime.status}</span>
          </div>

          <p className="mt-7 leading-relaxed text-slate-300">{anime.synopsis}</p>

          <div className="mt-7 flex flex-wrap gap-2">
            {anime.genres.map((genre) => (
              <span key={genre} className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">
                {genre}
              </span>
            ))}
          </div>

          <div className="mt-9 rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Agregar a mi perfil</h2>
            <p className="mt-1 text-xs text-slate-500">Solo tú puedes ver esto si tu perfil es privado.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => void handleStatus(option.value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    current?.status === option.value
                      ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white'
                      : 'border border-white/15 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {current && (
              <p className="mt-3 text-xs text-emerald-300">
                Guardado como {current.status}{current.rating ? ` · ${current.rating} estrellas` : ''}
              </p>
            )}
          </div>

          {notice && <p className="mt-4 rounded-xl bg-violet-500/15 px-4 py-3 text-sm text-violet-200">{notice}</p>}
        </div>
      </div>

      <section className="mt-16 border-t border-white/10 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">La comunidad opina</p>
            <h2 className="mt-2 text-3xl font-black text-white">Opiniones de los fans</h2>
          </div>
          {reviews.length > 0 && (
            <p className="text-sm text-slate-400">
              <span className="text-2xl font-black text-amber-300">★ {average.toFixed(1)}</span> / 5 · {reviews.length} opiniones
            </p>
          )}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {loading ? (
              <p className="text-slate-400">Cargando opiniones…</p>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-violet-600 text-sm font-bold text-white">
                      {(review.author?.display_name ?? review.author?.username ?? '?').slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <Link
                        to={review.author ? `/perfil/${review.author.username}` : '/perfil'}
                        className="text-sm font-bold text-white hover:text-violet-300"
                      >
                        {review.author?.display_name ?? review.author?.username ?? 'Fan'}
                      </Link>
                      <p className="text-xs text-slate-500">{timeAgo(review.created_at)}</p>
                    </div>
                    <span className="ml-auto text-amber-300">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  </div>
                  {review.text && <p className="mt-4 leading-relaxed text-slate-300">{review.text}</p>}
                  {review.user_id === user?.id && (
                    <button type="button" onClick={() => void deleteReview()} className="mt-4 text-xs text-slate-500 hover:text-rose-400">
                      Borrar mi opinión
                    </button>
                  )}
                </article>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-white/15 py-10 text-center text-slate-400">
                Aún no hay opiniones. ¡Sé la primera persona en contar qué te pareció!
              </p>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-violet-400/20 bg-white/5 p-5">
            <h3 className="font-bold text-white">{myReview ? 'Editar mi opinión' : 'Deja tu opinión'}</h3>
            {user ? (
              <form onSubmit={handleReview} className="mt-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`${star} estrellas`}
                      className={`text-2xl ${star <= rating ? 'text-amber-300' : 'text-slate-600'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  rows={4}
                  placeholder="¿Qué te pareció? (opcional, también puedes dejar solo las estrellas)"
                  className="mt-4 w-full resize-y rounded-xl border border-white/10 bg-[#141423] px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
                />
                <button type="submit" className="mt-4 w-full rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white hover:opacity-90">
                  Publicar opinión
                </button>
                {reviewNotice && <p className="mt-3 rounded-xl bg-violet-500/15 px-4 py-3 text-sm text-violet-200">{reviewNotice}</p>}
                {reviewsError && <p className="mt-3 rounded-xl bg-rose-500/15 px-4 py-3 text-xs text-rose-200">{reviewsError}</p>}
              </form>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-slate-400">Inicia sesión para opinar y puntuar este anime.</p>
                <button type="button" onClick={() => setShowAuth(true)} className="mt-4 w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-500">
                  Entrar / Registrarme
                </button>
              </div>
            )}
          </aside>
        </div>
      </section>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
    </div>
  )
}
