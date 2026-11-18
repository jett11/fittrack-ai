import { LayoutDashboard, Dumbbell, Utensils, TrendingUp, Flame, User, Settings } from 'lucide-react'

export const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/nutrition', label: 'Nutrition', icon: Utensils },
  { to: '/transformation', label: 'Transformation', icon: TrendingUp },
  { to: '/challenges', label: 'Challenges', icon: Flame },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
]

// Shown in the mobile bottom bar — a trimmed subset so it stays uncluttered.
export const mobileNavItems = [
  navItems[0],
  navItems[1],
  navItems[2],
  navItems[3],
  navItems[4],
]
