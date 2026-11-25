import { View, Text, Pressable } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Trophy, Check } from 'lucide-react-native'
import { colors } from '../constants/theme'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function currentWeekDays() {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export function HeroChallengeCard({ challenges, completions, onToggle }: any) {
  const today = todayStr()
  const next = challenges.find((c: any) => !completions.some((comp: any) => comp.challenge_id === c.id && comp.completed_date === today))
  if (!next) return null

  const isDone = completions.some((c: any) => c.challenge_id === next.id && c.completed_date === today)
  const days = currentWeekDays()

  return (
    <LinearGradient colors={[colors.lime, colors.green]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 20, padding: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.15)', alignItems: 'center', justifyContent: 'center' }}>
          <Trophy color={colors.bg} size={20} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.bg, fontSize: 11, fontWeight: '700', opacity: 0.7, textTransform: 'uppercase' }}>
            {next.frequency === 'weekly' ? 'Weekly challenge' : "Today's challenge"}
          </Text>
          <Text style={{ color: colors.bg, fontSize: 14, fontWeight: '800' }} numberOfLines={1}>
            {next.title}
          </Text>
        </View>
        <Pressable
          onPress={() => onToggle(next.id)}
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          {isDone && <Check color={colors.lime} size={14} />}
          <Text style={{ color: colors.lime, fontWeight: '800', fontSize: 13 }}>{isDone ? 'Done' : 'Start'}</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
        {days.map((d) => {
          const isToday = d.toISOString().slice(0, 10) === today
          return (
            <View key={d.toISOString()} style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ color: colors.bg, fontSize: 10, fontWeight: '700', opacity: 0.7 }}>
                {d.toLocaleDateString('en-IN', { weekday: 'narrow' })}
              </Text>
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isToday ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.12)',
                }}
              >
                <Text style={{ color: isToday ? colors.lime : colors.bg, fontSize: 11, fontWeight: '700' }}>{d.getDate()}</Text>
              </View>
            </View>
          )
        })}
      </View>
    </LinearGradient>
  )
}
