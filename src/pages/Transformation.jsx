import { useCallback, useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import Container from '../components/ui/Container'
import Card from '../components/ui/Card'
import MeasurementForm from '../components/transformation/MeasurementForm'
import MetricChart from '../components/transformation/MetricChart'
import PhotoGrid from '../components/transformation/PhotoGrid'
import { useAuth } from '../hooks/useAuth'
import { isDemoMode } from '../services/supabaseClient'
import {
  logMeasurement,
  getMeasurementHistory,
  uploadProgressPhoto,
  getProgressPhotos,
  deleteProgressPhoto,
  monthlySummary,
} from '../services/transformationService'

const METRICS = [
  { field: 'weight_kg', label: 'Weight', unit: 'kg' },
  { field: 'waist_cm', label: 'Waist', unit: 'cm' },
  { field: 'chest_cm', label: 'Chest', unit: 'cm' },
  { field: 'arm_cm', label: 'Arm', unit: 'cm' },
  { field: 'thigh_cm', label: 'Thigh', unit: 'cm' },
]

export default function Transformation() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const load = useCallback(() => {
    if (isDemoMode || !user) {
      setHistory([])
      setPhotos([])
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([getMeasurementHistory(user.id), getProgressPhotos(user.id)]).then(([h, p]) => {
      setHistory(h)
      setPhotos(p)
      setLoading(false)
    })
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const handleSaveMeasurement = async (data) => {
    await logMeasurement(user.id, data)
    load()
  }

  const handleUpload = async (file) => {
    setUploading(true)
    await uploadProgressPhoto(user.id, file)
    setUploading(false)
    load()
  }

  const handleDeletePhoto = async (photo) => {
    setPhotos((p) => p.filter((x) => x.id !== photo.id))
    await deleteProgressPhoto(photo.id, photo.storage_path)
  }

  const summary = monthlySummary(history)

  return (
    <Container className="max-w-2xl py-6 sm:py-8">
      <h2 className="mb-5 text-2xl font-extrabold text-text">Transformation</h2>

      {isDemoMode && (
        <p className="mb-4 text-sm text-text-secondary">
          Demo mode doesn&rsquo;t simulate measurement history or photo storage — connect a real account to try this.
        </p>
      )}

      {summary && (
        <Card className="mb-4 flex items-center gap-3 p-4">
          <TrendingUp size={18} className="text-primary" />
          <p className="text-sm text-text">
            <span className="font-semibold">{summary.change > 0 ? '+' : ''}{summary.change}kg</span> over the last 30 days,
            from {summary.entries} log{summary.entries === 1 ? '' : 's'}.
          </p>
        </Card>
      )}

      <div className="flex flex-col gap-4">
        <MeasurementForm onSave={handleSaveMeasurement} />

        {!loading && (
          <div className="grid gap-3 sm:grid-cols-2">
            {METRICS.map((m) => (
              <MetricChart key={m.field} {...m} history={history} />
            ))}
          </div>
        )}

        <PhotoGrid photos={photos} onUpload={handleUpload} onDelete={handleDeletePhoto} uploading={uploading} />
      </div>
    </Container>
  )
}
