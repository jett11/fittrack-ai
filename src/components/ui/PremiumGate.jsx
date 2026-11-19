import { Link } from 'react-router-dom'
import { Crown } from 'lucide-react'
import Card from './Card'
import Button from './Button'

export default function PremiumGate({ title, description }) {
  return (
    <Card className="flex flex-col items-center gap-2 p-8 text-center">
      <Crown size={22} className="text-accent" />
      <p className="font-bold text-text">{title}</p>
      <p className="max-w-[36ch] text-sm text-text-secondary">{description}</p>
      <Button as={Link} to="/upgrade" size="sm" className="mt-2">
        Upgrade to Premium
      </Button>
    </Card>
  )
}
