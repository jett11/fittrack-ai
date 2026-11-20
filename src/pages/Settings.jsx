import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Moon, Sun, Download, Trash2, LogOut, Crown, Bell, BellOff } from 'lucide-react'
import Container from '../components/ui/Container'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { supabase, isDemoMode } from '../services/supabaseClient'
import { getNotificationPreference, setNotificationPreference } from '../services/preferencesService'

const DATA_TABLES = [
  'profiles',
  'user_preferences',
  'workouts',
  'workout_sessions',
  'workout_logs',
  'meal_logs',
  'body_measurements',
  'progress_photos',
  'challenge_completions',
]

export default function Settings() {
  const { user, profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [notifLoading, setNotifLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode || !user) {
      setNotifLoading(false)
      return
    }
    getNotificationPreference(user.id).then((enabled) => {
      setNotificationsEnabled(enabled)
      setNotifLoading(false)
    })
  }, [user])

  const handleToggleNotifications = async () => {
    const next = !notificationsEnabled
    setNotificationsEnabled(next)
    if (next && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
    if (!isDemoMode && user) await setNotificationPreference(user.id, next)
  }

  const handleExport = async () => {
    if (isDemoMode || !user) return
    setExporting(true)
    const result = {}
    for (const table of DATA_TABLES) {
      const column = table === 'profiles' ? 'id' : table === 'user_preferences' ? 'user_id' : 'user_id'
      const { data } = await supabase.from(table).select('*').eq(column, user.id)
      result[table] = data ?? []
    }
    setExporting(false)

    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fittrack-ai-my-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDeleteData = async () => {
    if (isDemoMode || !user) return
    setDeleting(true)
    for (const table of DATA_TABLES) {
      if (table === 'profiles' || table === 'user_preferences') continue
      await supabase.from(table).delete().eq('user_id', user.id)
    }
    await supabase.from('profiles').update({ onboarding_completed: false, full_name: null }).eq('id', user.id)
    setDeleting(false)
    await signOut()
    navigate('/')
  }

  return (
    <Container className="max-w-2xl py-8">
      <h2 className="text-2xl font-extrabold text-text">Settings</h2>

      <Card className="mt-6 flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <Crown size={18} className="text-accent" />
          <div>
            <p className="text-sm font-semibold text-text">{profile?.is_premium ? 'Premium' : 'Free plan'}</p>
            <p className="text-xs text-text-secondary">
              {profile?.is_premium ? 'All features unlocked' : 'Routines, budget plans & photos are Premium'}
            </p>
          </div>
        </div>
        {!profile?.is_premium && (
          <Button as={Link} to="/upgrade" size="sm">
            Upgrade
          </Button>
        )}
      </Card>

      <Card className="mt-4 flex items-center justify-between p-5">
        <div>
          <p className="text-sm font-semibold text-text">Appearance</p>
          <p className="text-xs text-text-secondary">Light or dark theme</p>
        </div>
        <Button variant="secondary" size="sm" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </Button>
      </Card>

      <Card className="mt-4 flex items-center justify-between p-5">
        <div>
          <p className="text-sm font-semibold text-text">Daily reminders</p>
          <p className="text-xs text-text-secondary">
            A browser reminder if you haven&rsquo;t logged water or a workout by evening, while the app is open
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleToggleNotifications} disabled={notifLoading}>
          {notificationsEnabled ? <Bell size={15} /> : <BellOff size={15} />}
          {notificationsEnabled ? 'On' : 'Off'}
        </Button>
      </Card>

      <Card className="mt-4 flex items-center justify-between p-5">
        <div>
          <p className="text-sm font-semibold text-text">Account</p>
          <p className="text-xs text-text-secondary">{user?.email}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={signOut}>
          <LogOut size={15} /> Log out
        </Button>
      </Card>

      <Card className="mt-4 flex items-center justify-between p-5">
        <div>
          <p className="text-sm font-semibold text-text">Export your data</p>
          <p className="text-xs text-text-secondary">Download everything you&rsquo;ve logged as a JSON file</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExport} disabled={exporting || isDemoMode}>
          <Download size={15} /> {exporting ? 'Preparing…' : 'Export'}
        </Button>
      </Card>

      <Card className="mt-4 flex flex-col gap-3 !border-[var(--danger-soft)] p-5">
        <div>
          <p className="text-sm font-semibold text-danger">Delete my data</p>
          <p className="text-xs text-text-secondary">
            Permanently deletes your workouts, nutrition logs, measurements and photos, and resets your
            profile. This cannot be undone.{' '}
            {!isDemoMode && (
              <>
                To fully close your account (remove your login itself), email{' '}
                <a href="mailto:hello@fittrack.ai" className="text-primary underline">
                  hello@fittrack.ai
                </a>
                .
              </>
            )}
          </p>
        </div>
        {!confirmDelete ? (
          <Button variant="secondary" size="sm" className="self-start !text-danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={15} /> Delete my data
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="danger" onClick={handleDeleteData} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Yes, permanently delete'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        )}
      </Card>

      {profile && (
        <p className="mt-6 text-center text-xs text-text-secondary">
          FitTrack AI stores only what you enter. Estimates shown are not medical advice.
        </p>
      )}
    </Container>
  )
}
