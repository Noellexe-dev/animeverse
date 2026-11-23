export type AnimeStatus = 'Clásico' | 'Reciente' | 'Próximamente'
export type LibraryStatus = 'favorito' | 'viendo' | 'visto'

export interface Anime {
  id: string
  title: string
  japaneseTitle: string
  synopsis: string
  genres: string[]
  year: number
  episodes: number
  rating: number
  studio: string
  image: string
  status: AnimeStatus
}

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  is_public: boolean
  created_at: string
  role?: 'user' | 'mod' | 'admin'
  is_verified?: boolean
  is_banned?: boolean
  last_active_at?: string | null
}

export interface Report {
  id: string
  reporter_id: string
  reported_user_id: string | null
  post_id: string | null
  kind: 'problema' | 'sugerencia' | 'usuario' | 'publicacion'
  message: string
  status: 'abierto' | 'en revision' | 'resuelto'
  admin_reply: string | null
  created_at: string
}

export interface AdminUser {
  id: string
  username: string
  display_name: string | null
  email: string
  role: 'user' | 'mod' | 'admin'
  is_verified: boolean
  is_banned: boolean
  created_at: string
  last_active_at: string | null
  posts: number
  comments: number
  reviews: number
  reports: number
}

export interface AdminReport {
  id: string
  kind: string
  message: string
  status: string
  admin_reply: string | null
  created_at: string
  reporter: string | null
  reporter_email: string | null
  reported: string | null
  post_text: string | null
}

export interface AdminPost {
  id: string
  text: string | null
  image_url: string | null
  created_at: string
  author: string | null
  likes: number
  comments: number
  reports: number
}

export interface AdminComment {
  id: string
  text: string
  created_at: string
  author: string | null
  post_id: string
}

export interface AdminStats {
  users: number
  posts: number
  comments: number
  reviews: number
  open_reports: number
  banned: number
  verified: number
}

export interface Post {
  id: string
  user_id: string
  anime_id: string | null
  text: string | null
  image_url: string | null
  created_at: string
  author?: Profile | null
  like_count?: number
  liked_by_me?: boolean
  comments?: PostComment[]
}

export interface PostComment {
  id: string
  post_id: string
  user_id: string
  text: string
  created_at: string
  author?: Profile | null
}

export interface AnimeReview {
  id: string
  user_id: string
  anime_id: string
  rating: number
  text: string
  created_at: string
  author?: Profile | null
}

export interface LibraryItem {
  user_id: string
  anime_id: string
  status: LibraryStatus
  rating: number | null
  updated_at: string
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
  profile?: Profile | null
}

export interface Message {
  id: string
  sender_id: string
  recipient_id: string
  text: string
  created_at: string
}
