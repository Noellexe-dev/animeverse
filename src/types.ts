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
