import { useMemo, useState } from 'react'
import { AnimeCard } from '../components/AnimeCard'
import { allGenres, animes } from '../data/anime'
import type { AnimeStatus } from '../types'

const statusOptions: Array<AnimeStatus | 'Todos'> = ['Todos', 'Clásico', 'Reciente', 'Próximamente']
const labels: Record<AnimeStatus | 'Todos', string> = {
  Todos: 'Todo el catálogo',
  Clásico: 'Clásicos',
  Reciente: 'Recientes',
  Próximamente: 'Próximamente',
}

export function Home() {
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('Todos')
  const [status, setStatus] = useState<AnimeStatus | 'Todos'>('Todos')

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return animes.filter((anime) => {
      const matchesQuery =
        normalizedQuery === '' ||
        anime.title.toLowerCase().includes(normalizedQuery) ||
        anime.japaneseTitle.toLowerCase().includes(normalizedQuery) ||
        anime.genres.some((item) => item.toLowerCase().includes(normalizedQuery))
      const matchesGenre = genre === 'Todos' || anime.genres.includes(genre)
      const matchesStatus = status === 'Todos' || anime.status === status
      return matchesQuery && matchesGenre && matchesStatus
    })
  }, [query, genre, status])

  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/10 py-12 sm:py-16">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">Explora el universo</p>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Tu próxima obsesión está aquí
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
            Clásicos, estrenos y títulos por venir. Busca, guarda y opina con otros fans.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Buscar animes</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por título o género…"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
            />
          </label>
          <label className="sm:w-56">
            <span className="sr-only">Filtrar por género</span>
            <select
              value={genre}
              onChange={(event) => setGenre(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#141423] px-4 py-3 text-white focus:border-violet-400 focus:outline-none"
            >
              <option value="Todos">Todos los géneros</option>
              {allGenres.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setStatus(option)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                status === option
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white'
                  : 'border border-white/10 text-slate-300 hover:bg-white/5'
              }`}
            >
              {labels[option]}
            </button>
          ))}
        </div>

        <div className="mb-6 mt-10 flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-bold text-white">{labels[status]}</h2>
          <span className="text-sm text-slate-400">{filtered.length} resultados</span>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {filtered.map((anime) => <AnimeCard key={anime.id} anime={anime} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center">
            <p className="text-lg font-semibold text-white">No encontramos resultados</p>
            <p className="mt-2 text-sm text-slate-400">Prueba con otro título o cambia los filtros.</p>
            <button
              type="button"
              onClick={() => { setQuery(''); setGenre('Todos'); setStatus('Todos') }}
              className="mt-5 rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-500"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
