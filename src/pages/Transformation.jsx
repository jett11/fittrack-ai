import { useCallback, useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import Container from '../components/ui/Container'
import Card from '../components/ui/Card'
import MeasurementForm from '../components/transformation/MeasurementForm'
import MetricChart from '../components/transformation/MetricChart'
import PhotoGrid from '../components/transformation/PhotoGrid'
import GoalProgress from '../components/transformation/GoalProgress'
import Milestones from '../components/transformation/Milestones'
import PremiumGate from '../components/ui/PremiumGate'
import { useAuth } from '../hooks/useAuth'
import { isDemoMode } from '../services/supabaseClient'
import {
  logMeasurement,
  getMeasurementHistory,
  uploadProgressPhoto,
  getProgressPhotos,
  deleteProgressPhoto,
  periodSummary,
} from '../services/transformationService'

const METRICS = [
  { field: 'weight_kg', label: 'Weight', unit: 'kg' },
  { field: 'waist_cm', label: 'Waist', unit: 'cm' },
  { field: 'chest_cm', label: 'Chest', unit: 'cm' },
  { field: 'arm_cm', label: 'Arm', unit: 'cm' },
  { field: 'thigh_cm', label: 'Thigh', unit: 'cm' },
]

export default function Transformation() {
  const { user, profile } = useAuth()
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

  const weekSummary = periodSummary(history, 7)
  const monthSummary = periodSummary(history, 30)
  const latestWeight = [...history].reverse().find((h) => h.weight_kg != null)?.weight_kg ?? profile?.current_weight_kg

  return (
    <Container className="max-w-2xl py-6 sm:py-8">
      <h2 className="mb-5 text-2xl font-extrabold text-text">Transformation</h2>

      {isDemoMode && (
        <p className="mb-4 text-sm text-text-secondary">
          Demo mode doesn&rsquo;t simulate measurement history or photo storage — connect a real account to try this.
        </p>
      )}

      {(weekSummary || monthSummary) && (
        <Card className="mb-4 flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            <p className="text-sm text-text">
              {weekSummary && (
                <>
                  <span className="font-semibold">{weekSummary.change > 0 ? '+' : ''}{weekSummary.change}kg</span> this week
                </>
              )}
              {weekSummary && monthSummary && ' · '}
              {monthSummary && (
                <>
                  <span className="font-semibold">{monthSummary.change > 0 ? '+' : ''}{monthSummary.change}kg</span> over 30
                  days
                </>
              )}
            </p>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-4">
        <GoalProgress
          startingWeight={profile?.current_weight_kg}
          currentWeight={latestWeight}
          targetWeight={profile?.target_weight_kg}
        />

        <MeasurementForm onSave={handleSaveMeasurement} />

        {!loading && (
          <div className="grid gap-3 sm:grid-cols-2">
            {METRICS.map((m) => (
              <MetricChart key={m.field} {...m} history={history} />
            ))}
          </div>
        )}

        {!loading && <Milestones history={history} />}

        {profile?.is_premium ? (
          <PhotoGrid photos={photos} onUpload={handleUpload} onDelete={handleDeletePhoto} uploading={uploading} />
        ) : (
          <PremiumGate
            title="Keep a private photo timeline"
            description="Progress photos are a Premium feature — private to you, never shared."
          />
        )}
      </div>
    </Container>
  )
}
