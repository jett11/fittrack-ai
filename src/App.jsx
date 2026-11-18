import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import AuthLayout from './layouts/AuthLayout'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LandingPage from './pages/LandingPage'

const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Workouts = lazy(() => import('./pages/Workouts'))
const WorkoutDetail = lazy(() => import('./pages/WorkoutDetail'))
const RoutineBuilder = lazy(() => import('./pages/RoutineBuilder'))
const WorkoutSession = lazy(() => import('./pages/WorkoutSession'))
const Nutrition = lazy(() => import('./pages/Nutrition'))
const Transformation = lazy(() => import('./pages/Transformation'))
const Challenges = lazy(() => import('./pages/Challenges'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/workouts/new" element={<RoutineBuilder />} />
            <Route path="/workouts/session" element={<WorkoutSession />} />
            <Route path="/workouts/:id" element={<WorkoutDetail />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/transformation" element={<Transformation />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
