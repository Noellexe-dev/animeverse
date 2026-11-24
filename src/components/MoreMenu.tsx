import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

interface MoreMenuItem {
  label: string
  to?: string
  onClick?: () => void
  danger?: boolean
}

interface MoreMenuProps {
  items: MoreMenuItem[]
  label?: string
}

export function MoreMenu({ items, label = 'Más opciones' }: MoreMenuProps) {
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="relative shrink-0" ref={container}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={label}
        aria-expanded={open}
        className={`grid h-8 w-8 place-items-center rounded-full border text-sm font-bold transition-colors ${
          open ? 'border-violet-400/50 bg-violet-500/20 text-violet-200' : 'border-white/15 text-slate-400 hover:bg-white/10 hover:text-white'
        }`}
      >
        ···
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-white/15 bg-[#1b1b2b] py-1 shadow-2xl shadow-black/60">
          {items.map((item) => {
            const className = `block w-full px-4 py-2.5 text-left text-sm transition-colors ${
              item.danger ? 'text-rose-300 hover:bg-rose-500/10' : 'text-slate-200 hover:bg-white/10'
            }`
            return item.to ? (
              <Link key={item.label} to={item.to} onClick={() => setOpen(false)} className={className}>
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                onClick={() => { setOpen(false); item.onClick?.() }}
                className={className}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
