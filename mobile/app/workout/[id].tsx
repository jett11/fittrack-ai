import { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { useAuth } from '../../hooks/useAuth'
import { Poster } from '../../components/Poster'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { colors } from '../../constants/theme'
import { getWorkoutWithExercises, startSession } from '../../services/workoutService'
import { getWorkoutPosterUrl } from '../../data/workoutPosters'

export default function WorkoutDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuth()
  const [workout, setWorkout] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (!id) return
    getWorkoutWithExercises(id).then((data) => {
      setWorkout(data)
      setLoading(false)
    })
  }, [id])

  const handleStart = async () => {
    if (!user || !id) return
    setStarting(true)
    const { error } = await startSession(user.id, id)
    setStarting(false)
    if (!error) router.push('/workout/session')
  }

  if (loading || !workout) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.lime} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <ArrowLeft color={colors.textSecondary} size={18} />
          <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Back</Text>
        </Pressable>

        <Poster uri={getWorkoutPosterUrl(workout)} aspectRatio={4 / 3}>
          <View style={{ flex: 1, justifyContent: 'flex-end', padding: 16 }}>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>{workout.name}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 }}>
              {workout.workout_exercises.length} exercises · {workout.location}
            </Text>
          </View>
        </Poster>

        <Button onPress={handleStart} loading={starting}>
          Start this workout
        </Button>

        <View style={{ gap: 10 }}>
          {workout.workout_exercises.map((we: any, i: number) => (
            <Card key={we.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: colors.cardElevated,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '700', fontSize: 12 }}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{we.exercises.name}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                  {we.target_sets} sets × {we.target_reps} · rest {we.rest_seconds}s
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
