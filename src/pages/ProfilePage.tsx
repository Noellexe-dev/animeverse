import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MoreMenu } from '../components/MoreMenu'
import { PostCard } from '../components/PostCard'
import { ReviewCard } from '../components/ReviewCard'
import { useAuth } from '../context/AuthContext'
import { animes } from '../data/anime'
import { useFollows, useProfile } from '../hooks/useFollows'
import { useLibrary } from '../hooks/useLibrary'
import { usePosts } from '../hooks/usePosts'
import { useReviewFeed } from '../hooks/useReviews'
import { useUserComments } from '../hooks/useUserComments'
import type { LibraryStatus } from '../types'
import { timeAgo } from '../utils/format'

const statusLabels: Record<LibraryStatus, string> = {
  favorito: '♥ Favoritos',
  viendo: '▶ Viendo',
  visto: '✓ Vistos',
}

const tabs = [
  { id: 'lista', label: 'Lista de animes' },
  { id: 'opiniones', label: 'Opiniones y puntuaciones' },
  { id: 'publicaciones', label: 'Publicaciones' },
] as const

type ProfileTab = typeof tabs[number]['id']

export function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user, profile: myProfile, updateProfile, deleteAccount } = useAuth()
  const { profile: viewedProfile } = useProfile(username)
  const { following, toggleFollow } = useFollows()
  const profile = username ? viewedProfile : myProfile
  const isMine = Boolean(profile && profile.id === user?.id)

  const { items } = useLibrary(profile?.id)
  const { posts, loading, toggleLike, addComment, deletePost } = usePosts('profile', profile?.id)
  const { reviews, loading: reviewsLoading } = useReviewFeed(profile ? [profile.id] : [])
  const { comments: userComments, loading: commentsLoading } = useUserComments(profile?.id)

  const [tab, setTab] = useState<ProfileTab>('lista')
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

  function handleDelete() {
    if (window.confirm('¿Seguro que quieres borrar tu cuenta? Esta acción no se puede deshacer.')) {
      void deleteAccount()
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 p-5 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <span className="mx-auto grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-3xl font-black text-white sm:mx-0">
            {(profile.display_name ?? profile.username).slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h1 className="flex flex-wrap items-center justify-center gap-2 text-2xl font-black text-white sm:justify-start sm:text-3xl">
              {profile.display_name ?? profile.username}
              {profile.is_verified && <span className="rounded-full bg-cyan-500/20 px-2 py-1 text-xs font-bold text-cyan-300">✓ Verificado</span>}
              {profile.role === 'admin' && <span className="rounded-full bg-amber-500/20 px-2 py-1 text-xs font-bold text-amber-300">ADMIN</span>}
              {profile.role === 'mod' && <span className="rounded-full bg-violet-500/20 px-2 py-1 text-xs font-bold text-violet-300">MOD</span>}
            </h1>
            <p className="text-sm text-slate-400">@{profile.username} · {profile.is_public ? 'Perfil público' : 'Perfil privado'}</p>
            <p className="mt-3 break-words text-slate-300">{profile.bio ?? 'Este fan aún no ha escrito su biografía.'}</p>
            <p className="mt-3 text-xs text-slate-500">
              {items.length} animes en su lista · {posts.length} publicaciones · {reviews.length} opiniones
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-start">
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
            <MoreMenu
              label={isMine ? 'Opciones de perfil' : 'Opciones de esta cuenta'}
              items={isMine ? [
                { label: 'Ajustes', to: '/ajustes' },
                { label: 'Borrar mi cuenta', onClick: handleDelete, danger: true },
              ] : [
                { label: 'Reportar cuenta', to: `/ayuda?user=${profile.id}` },
              ]}
            />
          </div>
        </div>

        {editing && (
          <form onSubmit={saveProfile} className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-[#141423] p-5 text-left">
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

      <div className="mt-10 flex gap-2 overflow-x-auto border-b border-white/10 pb-3" role="tablist" aria-label="Secciones del perfil">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors ${tab === item.id ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-white/5'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'lista' && (
          <section>
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
        )}

        {tab === 'opiniones' && (
          <section>
            <h2 className="text-2xl font-bold text-white">Opiniones y puntuaciones</h2>
            <div className="mt-5 space-y-4">
              {reviewsLoading ? <p className="text-slate-400">Cargando…</p> : reviews.length > 0 ? reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              )) : <p className="rounded-2xl border border-dashed border-white/15 py-10 text-center text-slate-400">Todavía no ha opinado sobre ningún anime.</p>}
            </div>
          </section>
        )}

        {tab === 'publicaciones' && (
          <section className="space-y-5">
            <h2 className="text-2xl font-bold text-white">Publicaciones</h2>
            {loading ? (
              <p className="text-slate-400">Cargando…</p>
            ) : posts.length > 0 ? posts.map((post) => (
              <PostCard key={post.id} post={post} onLike={(id) => void toggleLike(id)} onComment={(id, value) => void addComment(id, value)} onDelete={(id) => void deletePost(id)} />
            )) : (
              <p className="rounded-2xl border border-dashed border-white/15 py-10 text-center text-slate-400">Todavía no hay publicaciones.</p>
            )}

            <div className="border-t border-white/10 pt-8">
              <h3 className="text-xl font-bold text-white">Respuestas en la comunidad</h3>
              <p className="mt-1 text-sm text-slate-400">Comentarios que esta persona dejó en publicaciones de otros fans.</p>
              <div className="mt-4 space-y-3">
                {commentsLoading ? (
                  <p className="text-slate-400">Cargando…</p>
                ) : userComments.length > 0 ? userComments.map((activity) => (
                  <article key={activity.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-bold text-violet-200">Respondió</span>
                      {activity.post?.author && (
                        <Link to={`/perfil/${activity.post.author.username}`} className="text-cyan-300 hover:underline">
                          a @{activity.post.author.username}
                        </Link>
                      )}
                      <span>· {timeAgo(activity.created_at)}</span>
                    </div>
                    <p className="mt-2 break-words text-sm text-slate-200">{activity.text}</p>
                    {activity.post && (
                      <Link to={`/comunidad?post=${activity.post.id}`} className="mt-3 inline-block text-xs text-violet-300 hover:underline">
                        Ver la publicación →
                      </Link>
                    )}
                  </article>
                )) : (
                  <p className="rounded-2xl border border-dashed border-white/15 py-8 text-center text-sm text-slate-400">Todavía no ha respondido a nadie.</p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
