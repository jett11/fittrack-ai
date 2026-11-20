// Warms the module cache for the main bottom-nav destinations during idle
// time, so switching tabs feels instant instead of fetching each page's
// code on first tap. Import specifiers must match the lazy() calls in
// App.jsx exactly, so Vite resolves them to the same cached chunk.
const ROUTE_IMPORTS = [
  () => import('../pages/Dashboard'),
  () => import('../pages/Workouts'),
  () => import('../pages/Nutrition'),
  () => import('../pages/Transformation'),
  () => import('../pages/Challenges'),
]

function shouldSkipForSlowConnection() {
  const conn = navigator.connection
  if (!conn) return false
  if (conn.saveData) return true
  return conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g'
}

export function prefetchMainRoutes() {
  if (shouldSkipForSlowConnection()) return

  const run = () => {
    ROUTE_IMPORTS.forEach((load) => {
      load().catch(() => {})
    })
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(run, { timeout: 4000 })
  } else {
    setTimeout(run, 2000)
  }
}
