import { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Flame, Droplets, Dumbbell, Bell, Play } from 'lucide-react-native'
import { useAuth } from '../../hooks/useAuth'
import { useChallenges } from '../../hooks/useChallenges'
import { Card } from '../../components/Card'
import { Poster } from '../../components/Poster'
import { HeroChallengeCard } from '../../components/HeroChallengeCard'
import { colors } from '../../constants/theme'
import { getTodayWater, getTodayMealTotals, getTodayWorkoutSession } from '../../services/dashboardService'
import { getTemplates, getMyRoutines } from '../../services/workoutService'
import { getWorkoutPosterUrl } from '../../data/workoutPosters'
import { calculateCalorieTarget } from '../../utils/nutritionCalculations'

function firstName(name?: string | null) {
  return name ? name.split(' ')[0] : null
}

function StatTile({ icon: Icon, tint, value, label }: any) {
  return (
    <Card style={{ flex: 1 }}>
      <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: `${tint}26`, alignItems: 'center', justifyContent: 'center' }}>
        <Icon color={tint} size={17} />
      </View>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 10 }}>{value}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{label}</Text>
    </Card>
  )
}

export default function Home() {
  const { user, profile } = useAuth()
  const { challenges, completions, toggle } = useChallenges()
  const [loading, setLoading] = useState(true)
  const [water, setWater] = useState(0)
  const [meals, setMeals] = useState({ calories: 0 })
  const [todayWorkout, setTodayWorkout] = useState<any>(null)
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    Promise.all([
      getTodayWater(user.id),
      getTodayMealTotals(user.id),
      getTodayWorkoutSession(user.id),
      getMyRoutines(user.id),
      getTemplates(),
    ]).then(([w, m, workout, routines, templates]) => {
      setWater(w)
      setMeals(m)
      setTodayWorkout(workout)
      setRecentWorkouts([...routines, ...templates].slice(0, 6))
      setLoading(false)
    })
  }, [user])

  const calorieTarget = profile ? calculateCalorieTarget(profile) : null

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>
              Hello{firstName(profile?.full_name) ? ` ${firstName(profile?.full_name)}` : ''} 👋
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>Get ready</Text>
          </View>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.card,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell color={colors.textSecondary} size={18} />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.lime} style={{ marginTop: 40 }} />
        ) : (
          <>
            {challenges.length > 0 && <HeroChallengeCard challenges={challenges} completions={completions} onToggle={toggle} />}

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <StatTile
                icon={Flame}
                tint="#f97316"
                value={calorieTarget ? Math.round(meals.calories) : '—'}
                label={calorieTarget ? `/ ${calorieTarget} kcal` : 'Calories'}
              />
              <StatTile icon={Droplets} tint="#38bdf8" value={`${water}/8`} label="Glasses of water" />
            </View>

            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    backgroundColor: `${colors.lime}26`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Dumbbell color={colors.lime} size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>
                    {todayWorkout ? todayWorkout.workouts?.name ?? 'Workout' : 'No workout yet today'}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                    {todayWorkout ? (todayWorkout.status === 'completed' ? 'Completed' : 'In progress') : 'Head to the Workout tab to start one'}
                  </Text>
                </View>
              </View>
            </Card>

            {recentWorkouts.length > 0 && (
              <View>
                <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 10 }}>RECENT WORKOUTS</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {recentWorkouts.map((w) => (
                    <Pressable key={w.id} onPress={() => router.push(`/workout/${w.id}`)} style={{ width: 150 }}>
                      <Poster uri={getWorkoutPosterUrl(w)} aspectRatio={4 / 5}>
                        <View style={{ flex: 1, justifyContent: 'space-between', padding: 10 }}>
                          <View
                            style={{
                              alignSelf: 'flex-end',
                              width: 26,
                              height: 26,
                              borderRadius: 13,
                              backgroundColor: colors.lime,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Play color={colors.bg} size={11} fill={colors.bg} />
                          </View>
                          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }} numberOfLines={2}>
                            {w.name}
                          </Text>
                        </View>
                      </Poster>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
