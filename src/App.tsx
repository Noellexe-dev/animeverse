import { Route, Routes } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { AnimeDetail } from './pages/AnimeDetail'
import { Favorites } from './pages/Favorites'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0b0b14]">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/anime/:id" element={<AnimeDetail />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
