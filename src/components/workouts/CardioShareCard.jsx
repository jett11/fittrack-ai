import { useEffect, useState } from 'react'
import { Share2, Download } from 'lucide-react'
import Button from '../ui/Button'
import { renderCardioShareCard } from '../../utils/shareCard'

export default function CardioShareCard({ cardioType, distanceKm, durationMin, paceLabel }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [blob, setBlob] = useState(null)

  useEffect(() => {
    let url
    let cancelled = false
    renderCardioShareCard({ cardioType, distanceKm, durationMin, paceLabel }).then((b) => {
      if (cancelled) return
      setBlob(b)
      url = URL.createObjectURL(b)
      setImageUrl(url)
    })
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [cardioType, distanceKm, durationMin, paceLabel])

  const handleDownload = () => {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = 'fittrack-cardio.png'
    a.click()
  }

  const handleShare = async () => {
    if (!blob) return
    const file = new File([blob], 'fittrack-cardio.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'My FitTrack AI cardio session' })
      } catch {
        // user dismissed the share sheet
      }
      return
    }
    handleDownload()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {imageUrl ? (
        <img src={imageUrl} alt="Cardio summary card" className="w-full max-w-xs rounded-2xl border border-border" />
      ) : (
        <div className="flex aspect-[4/5] w-full max-w-xs items-center justify-center rounded-2xl border border-border bg-surface-2 text-sm text-text-secondary">
          Preparing your card…
        </div>
      )}
      <div className="flex w-full max-w-xs gap-2">
        <Button onClick={handleShare} disabled={!blob} className="flex-1">
          <Share2 size={16} /> Share
        </Button>
        <Button onClick={handleDownload} disabled={!blob} variant="secondary" className="flex-1">
          <Download size={16} /> Save
        </Button>
      </div>
    </div>
  )
}
