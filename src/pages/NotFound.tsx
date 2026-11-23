import { Link } from 'react-router-dom'

interface NotFoundProps {
  message?: string
}

export function NotFound({ message = 'La página que buscas no existe.' }: NotFoundProps) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-7xl font-black text-violet-500/40">404</p>
      <h1 className="mt-4 text-3xl font-bold text-white">Fuera del universo</h1>
      <p className="mt-3 text-slate-400">{message}</p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-full bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
