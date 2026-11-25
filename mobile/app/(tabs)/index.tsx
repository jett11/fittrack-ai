import { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Flame, Droplets, Dumbbell } from 'lucide-react-native'
import { useAuth } from '../../hooks/useAuth'
import { Card } from '../../components/Card'
import { colors } from '../../constants/theme'
import { getTodayWater, getTodayMealTotals, getTodayWorkoutSession } from '../../services/dashboardService'
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
  const [loading, setLoading] = useState(true)
  const [water, setWater] = useState(0)
  const [meals, setMeals] = useState({ calories: 0 })
  const [todayWorkout, setTodayWorkout] = useState<any>(null)

  useEffect(() => {
    if (!user) return
    Promise.all([getTodayWater(user.id), getTodayMealTotals(user.id), getTodayWorkoutSession(user.id)]).then(
      ([w, m, workout]) => {
        setWater(w)
        setMeals(m)
        setTodayWorkout(workout)
        setLoading(false)
      }
    )
  }, [user])

  const calorieTarget = profile ? calculateCalorieTarget(profile) : null

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>
            Hello{firstName(profile?.full_name) ? ` ${firstName(profile?.full_name)}` : ''} 👋
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>Get ready</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.lime} style={{ marginTop: 40 }} />
        ) : (
          <>
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
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
