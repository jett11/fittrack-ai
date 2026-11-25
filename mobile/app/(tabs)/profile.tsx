import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../hooks/useAuth'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { Chip } from '../../components/Chip'
import { colors } from '../../constants/theme'
import { getNotificationPreference, setNotificationPreference } from '../../services/preferencesService'
import { requestNotificationPermission } from '../../services/notificationService'

const GOALS = [
  { value: 'muscle_gain', label: 'Gain muscle' },
  { value: 'fat_loss', label: 'Lose fat' },
  { value: 'general_fitness', label: 'General fitness' },
]

export default function Profile() {
  const { user, profile, signOut, saveProfile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [goal, setGoal] = useState(profile?.fitness_goal ?? '')
  const [targetWeight, setTargetWeight] = useState(profile?.target_weight_kg?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [notifEnabled, setNotifEnabled] = useState(true)
  const [notifLoading, setNotifLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getNotificationPreference(user.id).then((enabled) => {
      setNotifEnabled(enabled)
      setNotifLoading(false)
    })
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await saveProfile({
      full_name: fullName.trim() || null,
      fitness_goal: goal || null,
      target_weight_kg: targetWeight ? Number(targetWeight) : null,
    })
    setSaving(false)
    if (error) return Alert.alert('Could not save', error.message)
    setSaved(true)
    setTimeout(() => setSaved(false), 1600)
  }

  const handleToggleNotifications = async () => {
    const next = !notifEnabled
    if (next) {
      const granted = await requestNotificationPermission()
      if (!granted) {
        Alert.alert('Permission denied', 'Enable notifications for FitTrack AI in your phone settings.')
        return
      }
    }
    setNotifEnabled(next)
    if (user) await setNotificationPreference(user.id, next)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>Profile</Text>

        <Card style={{ gap: 12 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{user?.email}</Text>
          <TextField placeholder="Full name" value={fullName} onChangeText={setFullName} />

          <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700' }}>GOAL</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {GOALS.map((g) => (
              <Chip key={g.value} selected={goal === g.value} onPress={() => setGoal(g.value)}>
                {g.label}
              </Chip>
            ))}
          </View>

          <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700' }}>TARGET WEIGHT (KG)</Text>
          <TextField placeholder="e.g. 70" keyboardType="numeric" value={targetWeight} onChangeText={setTargetWeight} />

          <Button onPress={handleSave} loading={saving}>
            {saved ? 'Saved' : 'Save changes'}
          </Button>
        </Card>

        <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>Notifications</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>Reminders and updates on this device</Text>
          </View>
          <Button variant="secondary" onPress={handleToggleNotifications} disabled={notifLoading}>
            {notifEnabled ? 'On' : 'Off'}
          </Button>
        </Card>

        <Card>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            Account deletion, data export and other privacy settings are in the next build — available right now on
            the website if you need them.
          </Text>
        </Card>

        <Button variant="secondary" onPress={signOut}>
          Log out
        </Button>
      </ScrollView>
    </SafeAreaView>
  )
}
