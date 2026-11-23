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
}

export interface Comment {
  id: string
  author: string
  text: string
  createdAt: number
}

export interface Post {
  id: string
  animeId: string
  author: string
  text: string
  rating: number
  likes: number
  likedByMe: boolean
  createdAt: number
  comments: Comment[]
}
