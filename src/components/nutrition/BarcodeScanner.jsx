import { useEffect, useRef, useState } from 'react'
import { X, Keyboard } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { lookupBarcode } from '../../services/barcodeService'

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e']

export default function BarcodeScanner({ onFound, onClose }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const [error, setError] = useState('')
  const [manualCode, setManualCode] = useState('')
  const [looking, setLooking] = useState(false)
  const supported = typeof window !== 'undefined' && 'BarcodeDetector' in window

  useEffect(() => {
    if (!supported) return
    let cancelled = false
    let detector

    async function scanLoop() {
      if (cancelled || !videoRef.current) return
      try {
        const codes = await detector.detect(videoRef.current)
        if (codes.length) {
          handleCode(codes[0].rawValue)
          return
        }
      } catch {
        // transient detection error — keep trying next frame
      }
      rafRef.current = requestAnimationFrame(scanLoop)
    }

    async function start() {
      try {
        detector = new window.BarcodeDetector({ formats: FORMATS })
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        scanLoop()
      } catch {
        setError('Camera access denied — enter the barcode number instead.')
      }
    }

    start()
    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported])

  const handleCode = async (code) => {
    if (looking) return
    setLooking(true)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    const product = await lookupBarcode(code)
    setLooking(false)
    if (product) onFound(product)
    else setError(`No product found for "${code}" — try a different item or enter it manually.`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-sm rounded-t-3xl bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-3xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-text">Scan barcode</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close scanner"
            className="grid h-8 w-8 place-items-center rounded-full text-text-secondary transition-colors hover:bg-surface-2 hover:text-text"
          >
            <X size={16} />
          </button>
        </div>

        {supported && !error && (
          <div className="relative overflow-hidden rounded-2xl bg-black">
            <video ref={videoRef} className="aspect-[4/3] w-full object-cover" muted playsInline />
            {looking && (
              <div className="absolute inset-0 grid place-items-center bg-black/50 text-sm text-white">Looking it up…</div>
            )}
          </div>
        )}

        {(!supported || error) && (
          <div className="flex flex-col gap-2">
            {!supported && (
              <p className="text-xs text-text-secondary">
                Barcode camera scanning isn&rsquo;t supported on this browser — enter the number instead.
              </p>
            )}
            {error && <p className="text-xs text-danger">{error}</p>}
            <div className="flex items-center gap-2">
              <Keyboard size={16} className="shrink-0 text-text-secondary" />
              <Input placeholder="Barcode number" value={manualCode} onChange={(e) => setManualCode(e.target.value)} />
              <Button size="sm" onClick={() => manualCode.trim() && handleCode(manualCode.trim())} disabled={looking}>
                Find
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
