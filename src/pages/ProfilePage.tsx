import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PostCard } from '../components/PostCard'
import { useAuth } from '../context/AuthContext'
import { animes } from '../data/anime'
import { useFollows, useProfile } from '../hooks/useFollows'
import { useLibrary } from '../hooks/useLibrary'
import { usePosts } from '../hooks/usePosts'
import type { LibraryStatus } from '../types'

const statusLabels: Record<LibraryStatus, string> = {
  favorito: '♥ Favoritos',
  viendo: '▶ Viendo',
  visto: '✓ Vistos',
}

export function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user, profile: myProfile, updateProfile, deleteAccount } = useAuth()
  const { profile: viewedProfile } = useProfile(username)
  const { following, people, toggleFollow } = useFollows()
  const profile = username ? viewedProfile : myProfile
  const isMine = Boolean(profile && profile.id === user?.id)

  const { items } = useLibrary(profile?.id)
  const { posts, loading, toggleLike, addComment, deletePost } = usePosts('profile', profile?.id)

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)
  const [filter, setFilter] = useState<LibraryStatus | 'todos'>('todos')
  const [editing, setEditing] = useState(false)

  if (username && !profile) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-slate-400">Perfil no encontrado.</div>
  }
  if (!profile) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-slate-400">Inicia sesión para ver tu perfil.</div>
  }

  const visibleItems = (filter === 'todos' ? items : items.filter((item) => item.status === filter))
    .filter((item) => animes.some((anime) => anime.id === item.anime_id))
  const locked = !profile.is_public && !isMine

  function startEdit() {
    setDisplayName(profile!.display_name ?? profile!.username)
    setBio(profile!.bio ?? '')
    setIsPublic(profile!.is_public)
    setEditing(true)
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = await updateProfile({ display_name: displayName, bio, is_public: isPublic })
    setNotice(message ?? 'Perfil actualizado.')
    if (!message) setEditing(false)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 p-6 sm:p-8">
        <div className="flex flex-wrap items-start gap-5">
          <span className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-3xl font-black text-white">
            {(profile.display_name ?? profile.username).slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-black text-white">{profile.display_name ?? profile.username}</h1>
            <p className="text-sm text-slate-400">@{profile.username} · {profile.is_public ? 'Perfil público' : 'Perfil privado'}</p>
            <p className="mt-3 max-w-xl text-slate-300">{profile.bio ?? 'Este fan aún no ha escrito su biografía.'}</p>
            <p className="mt-3 text-xs text-slate-500">
              {items.length} animes en su lista · {posts.length} publicaciones
            </p>
          </div>
          <div className="flex gap-2">
            {isMine ? (
              <button type="button" onClick={startEdit} className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/5">
                Editar perfil
              </button>
            ) : user ? (
              <>
                <button type="button" onClick={() => void toggleFollow(profile.id)} className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500">
                  {following.includes(profile.id) ? 'Dejar de seguir' : 'Seguir'}
                </button>
                {following.includes(profile.id) && (
                  <Link to={`/chats?con=${profile.id}`} className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/5">
                    Chatear
                  </Link>
                )}
              </>
            ) : null}
          </div>
        </div>

        {editing && (
          <form onSubmit={saveProfile} className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-[#141423] p-5">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase text-slate-400">Nombre visible</span>
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-violet-400 focus:outline-none" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase text-slate-400">Biografía</span>
              <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={3} className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-violet-400 focus:outline-none" />
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} className="h-4 w-4 accent-violet-500" />
              Perfil público (otras personas pueden ver mi lista)
            </label>
            <div className="flex gap-3">
              <button type="submit" className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500">Guardar</button>
              <button type="button" onClick={() => setEditing(false)} className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-slate-300">Cancelar</button>
            </div>
          </form>
        )}

        {notice && <p className="mt-4 rounded-xl bg-violet-500/15 px-4 py-3 text-sm text-violet-200">{notice}</p>}
      </section>

      {isMine && (
        <section className="mt-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
          <h2 className="font-bold text-white">Cuenta</h2>
          <p className="mt-1 text-sm text-slate-400">Si borras tu cuenta se eliminan tus publicaciones, opiniones y mensajes. No se puede deshacer.</p>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Seguro que quieres borrar tu cuenta? Esta acción no se puede deshacer.')) {
                void deleteAccount()
              }
            }}
            className="mt-4 rounded-full border border-rose-500/40 px-5 py-2.5 text-sm font-bold text-rose-300 hover:bg-rose-500/10"
          >
            Borrar mi cuenta
          </button>
        </section>
      )}

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-white">Su lista de animes</h2>
        {locked ? (
          <p className="mt-4 rounded-2xl border border-dashed border-white/15 py-10 text-center text-slate-400">Este perfil es privado. Su lista no está disponible.</p>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {(['todos', 'favorito', 'viendo', 'visto'] as const).map((value) => (
                <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === value ? 'bg-violet-600 text-white' : 'border border-white/10 text-slate-300'}`}>
                  {value === 'todos' ? 'Todos' : statusLabels[value]}
                </button>
              ))}
            </div>
            {visibleItems.length > 0 ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {visibleItems.map((item) => {
                  const anime = animes.find((entry) => entry.id === item.anime_id)!
                  return (
                    <Link key={item.anime_id} to={`/anime/${anime.id}`} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 hover:border-violet-400/40">
                      <img src={anime.image} alt="" className="h-20 w-14 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="truncate font-bold text-white">{anime.title}</p>
                        <p className="text-xs text-cyan-300">{statusLabels[item.status]}</p>
                        {item.rating && <p className="mt-1 text-xs text-amber-300">{'★'.repeat(item.rating)}</p>}
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="mt-6 rounded-2xl border border-dashed border-white/15 py-10 text-center text-slate-400">Todavía no hay animes en esta lista.</p>
            )}
          </>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-white">Publicaciones</h2>
        <div className="mt-5 space-y-5">
          {loading ? <p className="text-slate-400">Cargando…</p> : posts.length > 0 ? posts.map((post) => (
            <PostCard key={post.id} post={post} onLike={(id) => void toggleLike(id)} onComment={(id, value) => void addComment(id, value)} onDelete={(id) => void deletePost(id)} />
          )) : <p className="rounded-2xl border border-dashed border-white/15 py-10 text-center text-slate-400">Todavía no hay publicaciones.</p>}
        </div>
      </section>

      {isMine && !username && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-white">Encontrar fans</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {people.length > 0 ? people.map((person) => (
              <div key={person.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <Link to={`/perfil/${person.username}`} className="grid h-10 w-10 place-items-center rounded-full bg-violet-600 font-bold text-white">
                  {(person.display_name ?? person.username).slice(0, 1).toUpperCase()}
                </Link>
                <Link to={`/perfil/${person.username}`} className="min-w-0 flex-1 truncate text-white hover:text-violet-300">{person.display_name ?? person.username}</Link>
                <button type="button" onClick={() => void toggleFollow(person.id)} className="rounded-full bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500">
                  {following.includes(person.id) ? 'Siguiendo' : 'Seguir'}
                </button>
              </div>
            )) : <p className="text-slate-400">Todavía no hay otros fans registrados.</p>}
          </div>
        </section>
      )}
    </div>
  )
}
