import { Link } from 'react-router-dom'
import type { Anime } from '../types'
import { useFavorites } from '../context/FavoritesContext'

interface AnimeCardProps {
  anime: Anime
}

export function AnimeCard({ anime }: AnimeCardProps) {
  const { toggleFavorite, isFavorite } = useFavorites()
  const favorite = isFavorite(anime.id)

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl shadow-black/20 transition-transform duration-300 hover:-translate-y-1">
      <Link to={`/anime/${anime.id}`} className="block" aria-label={`Ver detalles de ${anime.title}`}>
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={anime.image}
            alt={`Póster de ${anime.title}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur">
            {anime.rating > 0 ? `★ ${anime.rating.toFixed(1)}` : 'Próximamente'}
          </span>
          <span className="absolute bottom-3 left-3 rounded-full bg-violet-600/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
            {anime.status}
          </span>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => toggleFavorite(anime.id)}
        aria-label={favorite ? `Quitar ${anime.title} de favoritos` : `Agregar ${anime.title} a favoritos`}
        aria-pressed={favorite}
        className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border text-lg backdrop-blur transition-colors ${
          favorite
            ? 'border-rose-400/60 bg-rose-500/80 text-white'
            : 'border-white/20 bg-black/50 text-white/80 hover:bg-rose-500/70 hover:text-white'
        }`}
      >
        {favorite ? '♥' : '♡'}
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link to={`/anime/${anime.id}`} className="text-lg font-bold leading-tight text-white hover:text-violet-300">
          {anime.title}
        </Link>
        <p className="text-xs text-slate-400">{anime.japaneseTitle}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {anime.genres.slice(0, 2).map((genre) => (
            <span key={genre} className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-slate-300">
              {genre}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
