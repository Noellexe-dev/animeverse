export function timeAgo(timestamp: string | number): string {
  const time = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime()
  const minutes = Math.max(1, Math.floor((Date.now() - time) / 60000))
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `hace ${days} d`
  const months = Math.floor(days / 30)
  return `hace ${months} mes${months === 1 ? '' : 'es'}`
}

export function parseHashtags(text: string | null): string[] {
  if (!text) return []
  const matches = text.match(/#[\p{L}\p{N}_]+/gu) ?? []
  return Array.from(new Set(matches.map((tag) => tag.toLowerCase())))
}

export function renderTextWithHashtags(text: string | null) {
  if (!text) return null
  return text.split(/(#[\p{L}\p{N}_]+)/gu).map((part, index) =>
    part.startsWith('#') ? (
      <span key={index} className="font-semibold text-cyan-300">
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    ),
  )
}
