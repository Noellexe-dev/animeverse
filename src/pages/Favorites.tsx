import { Link } from 'react-router-dom'
import { AnimeCard } from '../components/AnimeCard'
import { useFavorites } from '../context/FavoritesContext'
import { animes } from '../data/anime'

export function Favorites() {
  const { favorites } = useFavorites()
  const favoriteAnimes = animes.filter((anime) => favorites.includes(anime.id))

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Tu colección</p>
      <h1 className="mt-2 text-4xl font-black text-white">Mis favoritos</h1>
      <p className="mt-3 text-slate-400">
        {favoriteAnimes.length > 0
          ? `${favoriteAnimes.length} ${favoriteAnimes.length === 1 ? 'anime guardado' : 'animes guardados'} en este navegador.`
          : 'Aún no has guardado ningún anime.'}
      </p>

      {favoriteAnimes.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {favoriteAnimes.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-white/15 py-16 text-center">
          <p className="text-lg font-semibold text-white">Tu lista está vacía</p>
          <p className="mt-2 text-sm text-slate-400">
            Explora el catálogo y toca el corazón para guardar tus historias favoritas.
          </p>
          <Link
            to="/"
            className="mt-5 inline-block rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-500"
          >
            Explorar catálogo
          </Link>
        </div>
      )}
    </div>
  )
}
