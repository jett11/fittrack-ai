import { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { CheckCircle2, Circle, TrendingUp } from 'lucide-react-native'
import { useAuth } from '../../hooks/useAuth'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { RestTimer } from '../../components/RestTimer'
import { colors } from '../../constants/theme'
import {
  getActiveSession,
  getSessionLogs,
  logSet,
  completeSession,
  abandonSession,
  getLastSetsForExercises,
} from '../../services/workoutService'
import { suggestProgression } from '../../utils/progressiveOverload'

function SetRow({ setNumber, existing, onLog }: any) {
  const [reps, setReps] = useState(existing?.reps_completed?.toString() ?? '')
  const [weight, setWeight] = useState(existing?.weight_kg?.toString() ?? '')
  const done = !!existing?.completed

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: colors.cardElevated,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700' }}>{setNumber}</Text>
      </View>
      <TextField
        placeholder="reps"
        keyboardType="numeric"
        value={reps}
        onChangeText={setReps}
        style={{ width: 70, paddingVertical: 8 }}
      />
      <TextField
        placeholder="kg"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
        style={{ width: 70, paddingVertical: 8 }}
      />
      <Pressable
        onPress={() => onLog(reps ? Number(reps) : null, weight ? Number(weight) : null)}
        style={{ marginLeft: 'auto', padding: 4 }}
      >
        {done ? <CheckCircle2 color={colors.lime} size={24} /> : <Circle color={colors.textSecondary} size={24} />}
      </Pressable>
    </View>
  )
}

export default function WorkoutSession() {
  const { user } = useAuth()
  const [session, setSession] = useState<any>(null)
  const [logs, setLogs] = useState<Record<string, any>>({})
  const [lastSets, setLastSets] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [resting, setResting] = useState<number | null>(null)
  const [finishing, setFinishing] = useState(false)

  useEffect(() => {
    if (!user) return
    getActiveSession(user.id).then(async (s) => {
      if (!s) {
        setLoading(false)
        return
      }
      const existingLogs = await getSessionLogs(s.id)
      const map: Record<string, any> = {}
      existingLogs.forEach((l: any) => {
        map[`${l.exercise_id}-${l.set_number}`] = l
      })
      setSession(s)
      setLogs(map)
      setLoading(false)

      const exerciseIds = (s.workouts?.workout_exercises ?? []).map((we: any) => we.exercise_id)
      getLastSetsForExercises(exerciseIds, s.id).then(setLastSets)
    })
  }, [user])

  const handleLogSet = async (exerciseId: string, setNumber: number, reps: number | null, weight: number | null, restSeconds: number) => {
    const key = `${exerciseId}-${setNumber}`
    setLogs((l) => ({ ...l, [key]: { reps_completed: reps, weight_kg: weight, completed: true } }))
    await logSet(session.id, exerciseId, setNumber, { repsCompleted: reps, weightKg: weight, completed: true })
    if (restSeconds) setResting(restSeconds)
  }

  const handleFinish = async () => {
    setFinishing(true)
    await completeSession(session.id)
    setFinishing(false)
    router.replace('/(tabs)/workout')
  }

  const handleAbandon = async () => {
    await abandonSession(session.id)
    router.replace('/(tabs)/workout')
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.lime} />
      </SafeAreaView>
    )
  }

  if (!session) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>No workout in progress right now.</Text>
        <View style={{ marginTop: 16, width: '100%' }}>
          <Button variant="secondary" onPress={() => router.replace('/(tabs)/workout')}>
            Browse workouts
          </Button>
        </View>
      </SafeAreaView>
    )
  }

  const exercises = session.workouts?.workout_exercises ?? []
  const totalSets = exercises.reduce((sum: number, we: any) => sum + we.target_sets, 0)
  const doneSets = Object.values(logs).filter((l: any) => l.completed).length
  const progressPct = totalSets ? Math.round((doneSets / totalSets) * 100) : 0

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120, gap: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', flex: 1 }}>{session.workouts?.name ?? 'Workout'}</Text>
          <Pressable onPress={handleAbandon}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>End early</Text>
          </Pressable>
        </View>

        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Workout progress</Text>
            <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>
              {doneSets}/{totalSets} sets
            </Text>
          </View>
          <View style={{ height: 6, backgroundColor: colors.cardElevated, borderRadius: 999, overflow: 'hidden' }}>
            <View style={{ width: `${progressPct}%`, height: '100%', backgroundColor: colors.lime }} />
          </View>
        </View>

        {exercises.map((we: any) => {
          const suggestion = suggestProgression(lastSets[we.exercise_id])
          return (
            <Card key={we.id}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{we.exercises.name}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                Target: {we.target_sets} sets × {we.target_reps}
              </Text>
              {suggestion && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <TrendingUp color={colors.lime} size={13} />
                  <Text style={{ color: colors.lime, fontSize: 12, fontWeight: '600' }}>{suggestion}</Text>
                </View>
              )}
              <View style={{ gap: 8, marginTop: 10 }}>
                {Array.from({ length: we.target_sets }).map((_, i) => {
                  const setNumber = i + 1
                  const key = `${we.exercise_id}-${setNumber}`
                  return (
                    <SetRow
                      key={setNumber}
                      setNumber={setNumber}
                      existing={logs[key]}
                      onLog={(reps: number | null, weight: number | null) =>
                        handleLogSet(we.exercise_id, setNumber, reps, weight, we.rest_seconds)
                      }
                    />
                  )
                })}
              </View>
            </Card>
          )
        })}

        <Button onPress={handleFinish} loading={finishing}>
          Finish workout
        </Button>
      </ScrollView>

      {resting != null && <RestTimer seconds={resting} onDismiss={() => setResting(null)} />}
    </SafeAreaView>
  )
}
