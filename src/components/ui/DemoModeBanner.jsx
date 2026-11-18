import { Info } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function DemoModeBanner() {
  const { isDemoMode } = useAuth()
  if (!isDemoMode) return null

  return (
    <div className="flex items-center gap-2 bg-accent px-4 py-2 text-center text-sm font-medium text-accent-foreground">
      <Info size={15} className="shrink-0" />
      Demo mode — saved only to this browser, not synced to a real account yet.
    </div>
  )
}
