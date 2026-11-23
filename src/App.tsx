import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Welcome } from './components/Welcome'
import { useAuth } from './context/AuthContext'
import { AdminPanel } from './pages/AdminPanel'
import { AnimeDetail } from './pages/AnimeDetail'
import { Chats } from './pages/Chats'
import { Community } from './pages/Community'
import { Favorites } from './pages/Favorites'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { ProfilePage } from './pages/ProfilePage'
import { Reports } from './pages/Reports'

export default function App() {
  const { loading } = useAuth()
  const [entered, setEntered] = useState(false)

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#0b0b14]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-violet-500" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0b0b14]">
      {!entered && <Welcome onEnter={() => setEntered(true)} />}
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/anime/:id" element={<AnimeDetail />} />
          <Route path="/comunidad" element={<Community />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/perfil/:username" element={<ProfilePage />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/ayuda" element={<Reports />} />
          <Route path="/panel" element={<AdminPanel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
