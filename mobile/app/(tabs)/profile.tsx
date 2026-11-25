import { View, Text, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../hooks/useAuth'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { colors } from '../../constants/theme'

const GOAL_LABELS: Record<string, string> = {
  muscle_gain: 'Muscle gain',
  fat_loss: 'Fat loss',
  general_fitness: 'General fitness',
}

export default function Profile() {
  const { user, profile, signOut } = useAuth()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>Profile</Text>

        <Card>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{profile?.full_name ?? 'Your profile'}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>{user?.email}</Text>
          {profile?.fitness_goal && (
            <View
              style={{
                marginTop: 10,
                alignSelf: 'flex-start',
                backgroundColor: colors.cardElevated,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                {GOAL_LABELS[profile.fitness_goal] ?? profile.fitness_goal}
              </Text>
            </View>
          )}
        </Card>

        <Card>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            Full profile editing, settings and photos are coming in the next build — this account is already the same
            one you use on the website.
          </Text>
        </Card>

        <Button variant="secondary" onPress={signOut}>
          Log out
        </Button>
      </ScrollView>
    </SafeAreaView>
  )
}
