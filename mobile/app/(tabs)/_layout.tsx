import { Tabs } from 'expo-router'
import { Home, Dumbbell, Utensils, TrendingUp, User } from 'lucide-react-native'
import { colors } from '../../constants/theme'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.lime,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen
        name="workout"
        options={{ title: 'Workout', tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{ title: 'Meals', tabBarIcon: ({ color, size }) => <Utensils color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: 'Progress', tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  )
}
