import { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Play } from 'lucide-react-native'
import { useAuth } from '../../hooks/useAuth'
import { Poster } from '../../components/Poster'
import { colors } from '../../constants/theme'
import { getTemplates, getMyRoutines } from '../../services/workoutService'
import { getWorkoutPosterUrl } from '../../data/workoutPosters'

const LABELS: Record<string, string> = {
  muscle_gain: 'Muscle gain',
  fat_loss: 'Fat loss',
  general_fitness: 'General fitness',
}

function WorkoutPosterCard({ workout }: { workout: any }) {
  return (
    <Pressable onPress={() => router.push(`/workout/${workout.id}`)} style={{ width: '48%', marginBottom: 14 }}>
      <Poster uri={getWorkoutPosterUrl(workout)} aspectRatio={4 / 5}>
        <View style={{ flex: 1, justifyContent: 'space-between', padding: 12 }}>
          <View style={{ alignSelf: 'flex-end' }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.lime,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Play color={colors.bg} size={14} fill={colors.bg} />
            </View>
          </View>
          <View>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }} numberOfLines={2}>
              {workout.name}
            </Text>
            {workout.goal && (
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 }}>{LABELS[workout.goal] ?? workout.goal}</Text>
            )}
          </View>
        </View>
      </Poster>
    </Pressable>
  )
}

export default function Workout() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<any[]>([])
  const [routines, setRoutines] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    Promise.all([getTemplates(), getMyRoutines(user.id)]).then(([t, r]) => {
      setTemplates(t)
      setRoutines(r)
      setLoading(false)
    })
  }, [user])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 16 }}>Workouts</Text>

        {loading ? (
          <ActivityIndicator color={colors.lime} style={{ marginTop: 40 }} />
        ) : (
          <>
            {routines.length > 0 && (
              <>
                <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 10 }}>MY ROUTINES</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  {routines.map((w) => (
                    <WorkoutPosterCard key={w.id} workout={w} />
                  ))}
                </View>
              </>
            )}

            <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 10, marginTop: routines.length ? 8 : 0 }}>
              TEMPLATES
            </Text>
            {templates.length === 0 ? (
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>No templates available yet.</Text>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {templates.map((w) => (
                  <WorkoutPosterCard key={w.id} workout={w} />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
