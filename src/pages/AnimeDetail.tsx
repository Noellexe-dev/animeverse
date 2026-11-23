import { Link, useParams } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'
import { animes } from '../data/anime'
import { NotFound } from './NotFound'

export function AnimeDetail() {
  const { id } = useParams<{ id: string }>()
  const anime = animes.find((item) => item.id === id)
  const { toggleFavorite, isFavorite } = useFavorites()

  if (!anime) {
    return <NotFound message="Ese anime no existe en el catálogo." />
  }

  const favorite = isFavorite(anime.id)

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
              ★ {anime.rating.toFixed(1)}
            </span>
            <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300">{anime.year}</span>
            <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300">
              {anime.episodes} episodios
            </span>
            <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300">{anime.studio}</span>
          </div>

          <p className="mt-7 leading-relaxed text-slate-300">{anime.synopsis}</p>

          <div className="mt-7 flex flex-wrap gap-2">
            {anime.genres.map((genre) => (
              <span key={genre} className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">
                {genre}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => toggleFavorite(anime.id)}
            aria-pressed={favorite}
            className={`mt-9 rounded-full px-6 py-3 text-sm font-bold transition-colors ${
              favorite
                ? 'bg-rose-500 text-white hover:bg-rose-400'
                : 'border border-white/20 text-white hover:border-rose-400 hover:bg-rose-500/20'
            }`}
          >
            {favorite ? '♥ En tus favoritos' : '♡ Agregar a favoritos'}
          </button>
        </div>
      </div>
    </div>
  )
}
