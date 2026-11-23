import type { Anime } from '../types'
import { assetPath } from '../utils/assetPath'

export const animes: Anime[] = [
  {
    id: 'nebula',
    title: 'Nebula Odyssey',
    japaneseTitle: '星雲の旅',
    synopsis:
      'Una nave perdida cruza galaxias desconocidas mientras su tripulación descubre que el universo guarda recuerdos de quienes alguna vez miraron el cielo.',
    genres: ['Ciencia ficción', 'Aventura', 'Drama'],
    year: 2025,
    episodes: 24,
    rating: 8.7,
    studio: 'Estudio Lumen',
    image: assetPath('images/nebula.svg'),
  },
  {
    id: 'kai',
    title: 'Kai: El Último Fuego',
    japaneseTitle: '火の的使用者',
    synopsis:
      'En un mundo donde el fuego se ha apagado, un joven aprende a dominar la última llama para proteger a su aldea de las sombras que avanzan.',
    genres: ['Acción', 'Fantasía', 'Shonen'],
    year: 2024,
    episodes: 12,
    rating: 8.3,
    studio: 'Akari Works',
    image: assetPath('images/kai.svg'),
  },
  {
    id: 'sakura',
    title: 'Sakura en Silencio',
    japaneseTitle: '桜の静けさ',
    synopsis:
      'Una estudiante descubre un diario olvidado bajo un cerezo y, con cada página, reconstruye la historia de una amistad que el tiempo quiso borrar.',
    genres: ['Romance', 'Drama', 'Escolar'],
    year: 2025,
    episodes: 13,
    rating: 8.9,
    studio: 'Hanami Studio',
    image: assetPath('images/sakura.svg'),
  },
  {
    id: 'nocturne',
    title: 'Nocturne City',
    japaneseTitle: '夜想都市',
    synopsis:
      'Cuando la luna desaparece, los habitantes de una ciudad dormida empiezan a soñar despierto. Una detective investiga el origen de la extraña luz.',
    genres: ['Misterio', 'Supernatural', 'Thriller'],
    year: 2023,
    episodes: 22,
    rating: 8.1,
    studio: 'Tsuki Films',
    image: assetPath('images/nocturne.svg'),
  },
  {
    id: 'orbit',
    title: 'Órbita Cero',
    japaneseTitle: 'ゼロ軌道',
    synopsis:
      'Dos hermanas separadas por una estación espacial compiten por reconstruir el motor que podría devolverlas a casa antes de que su órbita se pierda.',
    genres: ['Ciencia ficción', 'Aventura', 'Familia'],
    year: 2024,
    episodes: 26,
    rating: 8.5,
    studio: 'Estudio Lumen',
    image: assetPath('images/orbit.svg'),
  },
  {
    id: 'samurai',
    title: 'Samurai del Amanecer',
    japaneseTitle: '暁の侍',
    synopsis:
      'Un ronin sin nombre recorre el país con una espada rota, buscando redimir una promesa que hizo mucho antes de que comenzara la guerra.',
    genres: ['Acción', 'Histórico', 'Drama'],
    year: 2022,
    episodes: 20,
    rating: 9.1,
    studio: 'Kage Produce',
    image: assetPath('images/samurai.svg'),
  },
]

export const allGenres = Array.from(new Set(animes.flatMap((anime) => anime.genres))).sort()
