import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Welcome } from './components/Welcome'
import { useAuth } from './context/AuthContext'
import { useNotifications } from './context/NotificationsContext'
import { AdminPanel } from './pages/AdminPanel'
import { AnimeDetail } from './pages/AnimeDetail'
import { Chats } from './pages/Chats'
import { Community } from './pages/Community'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { ProfilePage } from './pages/ProfilePage'
import { Reports } from './pages/Reports'
import { Settings } from './pages/Settings'

export default function App() {
  const { loading, user } = useAuth()
  const { markChatsRead } = useNotifications()
  const [entered, setEntered] = useState(false)
  const location = useLocation()

  const isChats = location.pathname === '/chats'

  useEffect(() => {
    if (isChats && user) markChatsRead()
  }, [isChats, user?.id, markChatsRead])

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#0b0b14]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-violet-500" />
      </div>
    )
  }

  const guestPath = location.pathname === '/' ||
    location.pathname.startsWith('/anime/') ||
    location.pathname === '/comunidad'

  if (!user && !guestPath) {
    return <Navigate to="/" replace />
  }

  return (
    <div className={`flex flex-col bg-[#0b0b14] ${isChats ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      {!entered && <Welcome onEnter={() => setEntered(true)} />}
      <Header />
      <main className={isChats ? 'min-h-0 flex-1 overflow-hidden' : 'flex-1'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/anime/:id" element={<AnimeDetail />} />
          <Route path="/comunidad" element={<Community />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/perfil/:username" element={<ProfilePage />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/ayuda" element={<Reports />} />
          <Route path="/ajustes" element={<Settings />} />
          <Route path="/panel" element={<AdminPanel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isChats && <Footer />}
    </div>
  )
}
