import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import { Play, Square, X } from 'lucide-react'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import CardioShareCard from '../components/workouts/CardioShareCard'
import { useAuth } from '../hooks/useAuth'
import { startCardioSession, completeCardioSession, abandonSession } from '../services/workoutService'
import { haversineKm, formatDuration, formatPace } from '../utils/geo'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow })

const TYPES = [
  { value: 'run', label: 'Run' },
  { value: 'walk', label: 'Walk' },
  { value: 'cycle', label: 'Cycle' },
]

const MIN_MOVE_METERS = 5

function Recenter({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.setView(position, map.getZoom())
  }, [position, map])
  return null
}

export default function CardioSession() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cardioType, setCardioType] = useState('run')
  const [phase, setPhase] = useState('idle') // idle | tracking | finished
  const [session, setSession] = useState(null)
  const [points, setPoints] = useState([])
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)

  const watchIdRef = useRef(null)
  const wakeLockRef = useRef(null)
  const startTimeRef = useRef(null)
  const timerRef = useRef(null)
  const lastPointRef = useRef(null)
  const distanceRef = useRef(0)

  useEffect(
    () => () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
      wakeLockRef.current?.release?.().catch(() => {})
    },
    []
  )

  const handleStart = async () => {
    setError('')
    if (!navigator.geolocation) {
      setError('GPS isn’t available on this device/browser.')
      return
    }
    const { data, error: startError } = await startCardioSession(user.id, cardioType)
    if (startError) {
      setError(startError.message)
      return
    }

    setSession(data)
    setPoints([])
    distanceRef.current = 0
    lastPointRef.current = null
    startTimeRef.current = Date.now()
    setElapsed(0)
    setPhase('tracking')

    try {
      wakeLockRef.current = await navigator.wakeLock?.request('screen')
    } catch {
      // best-effort — screen may still sleep on unsupported browsers
    }

    timerRef.current = setInterval(() => {
      setElapsed(Math.round((Date.now() - startTimeRef.current) / 1000))
    }, 1000)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        const last = lastPointRef.current
        if (!last || haversineKm([last.lat, last.lng], [next.lat, next.lng]) * 1000 >= MIN_MOVE_METERS) {
          if (last) distanceRef.current += haversineKm([last.lat, last.lng], [next.lat, next.lng])
          lastPointRef.current = next
          setPoints((p) => [...p, next])
        }
      },
      () => setError('Couldn’t get your location — check location permission for this site.'),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    )
  }

  const stopTracking = () => {
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    wakeLockRef.current?.release?.().catch(() => {})
  }

  const handleFinish = async () => {
    stopTracking()
    const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
    const distanceKm = distanceRef.current
    await completeCardioSession(session.id, { distanceKm, durationSeconds, routePoints: points })
    setSummary({
      cardioType,
      distanceKm,
      durationMin: Math.max(1, Math.round(durationSeconds / 60)),
      paceLabel: formatPace(distanceKm > 0 ? durationSeconds / distanceKm : NaN),
    })
    setPhase('finished')
  }

  const handleDiscard = async () => {
    if (!confirm('Discard this session? It won’t be saved.')) return
    stopTracking()
    if (session) await abandonSession(session.id)
    navigate('/workouts')
  }

  if (phase === 'finished' && summary) {
    return (
      <Container className="max-w-2xl py-10 text-center">
        <h2 className="text-2xl font-extrabold text-text">Nice {cardioType === 'cycle' ? 'ride' : cardioType}!</h2>
        <p className="mt-1 text-sm text-text-secondary">
          {summary.distanceKm.toFixed(2)}km &middot; {summary.durationMin} min &middot; {summary.paceLabel} min/km
        </p>
        <div className="mt-6">
          <CardioShareCard {...summary} />
        </div>
        <Button onClick={() => navigate('/workouts')} size="lg" variant="secondary" className="mt-6 w-full sm:w-auto">
          Done
        </Button>
      </Container>
    )
  }

  if (phase === 'idle') {
    return (
      <Container className="max-w-xl py-10">
        <h2 className="text-2xl font-extrabold text-text">Track a run, walk, or ride</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Uses your phone&rsquo;s GPS while this tab is open and the screen is on — it can&rsquo;t track in the background
          or once the phone locks.
        </p>
        <Card className="mt-5 p-5">
          <p className="mb-2 text-sm font-semibold text-text">Type</p>
          <div className="flex gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setCardioType(t.value)}
                className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                  cardioType === t.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface-2 text-text-secondary hover:text-text'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {error && <p className="mt-3 text-sm font-medium text-danger">{error}</p>}
          <Button onClick={handleStart} size="lg" className="mt-5 w-full">
            <Play size={16} fill="currentColor" /> Start tracking
          </Button>
        </Card>
      </Container>
    )
  }

  const latest = points[points.length - 1]
  const polyline = points.map((p) => [p.lat, p.lng])
  const distance = distanceRef.current

  return (
    <Container className="max-w-2xl py-4 sm:py-6">
      <div className="relative h-[52vh] w-full overflow-hidden rounded-2xl border border-border">
        {latest ? (
          <MapContainer center={[latest.lat, latest.lng]} zoom={16} className="h-full w-full" zoomControl={false}>
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {polyline.length > 1 && <Polyline positions={polyline} pathOptions={{ color: '#c6ff00', weight: 4 }} />}
            <Marker position={[latest.lat, latest.lng]} />
            <Recenter position={[latest.lat, latest.lng]} />
          </MapContainer>
        ) : (
          <div className="grid h-full place-items-center bg-surface-2 text-sm text-text-secondary">Finding your location…</div>
        )}
      </div>

      <Card className="mt-4 p-5">
        {error && <p className="mb-3 text-sm font-medium text-danger">{error}</p>}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-extrabold text-text">{distance.toFixed(2)}</p>
            <p className="text-xs text-text-secondary">KM</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-text">{formatDuration(elapsed)}</p>
            <p className="text-xs text-text-secondary">TIME</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-text">{formatPace(distance > 0 ? elapsed / distance : NaN)}</p>
            <p className="text-xs text-text-secondary">MIN/KM</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={handleDiscard} variant="ghost" className="flex-1">
            <X size={16} /> Discard
          </Button>
          <Button onClick={handleFinish} className="flex-1">
            <Square size={16} fill="currentColor" /> Finish
          </Button>
        </div>
      </Card>
    </Container>
  )
}
