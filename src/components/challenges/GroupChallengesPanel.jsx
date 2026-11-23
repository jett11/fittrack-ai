import { useEffect, useState } from 'react'
import { Users, Plus, Copy, LogOut, Crown } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Chip from '../ui/Chip'
import { useAuth } from '../../hooks/useAuth'
import {
  getMyGroups,
  createChallengeGroup,
  joinChallengeGroupByCode,
  getGroupLeaderboard,
  leaveGroup,
} from '../../services/challengeService'

export default function GroupChallengesPanel({ challenges }) {
  const { user } = useAuth()
  const [groups, setGroups] = useState(null)
  const [activeGroup, setActiveGroup] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [name, setName] = useState('')
  const [challengeId, setChallengeId] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const loadGroups = () => getMyGroups(user.id).then(setGroups)

  useEffect(() => {
    loadGroups()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id])

  useEffect(() => {
    if (activeGroup) getGroupLeaderboard(activeGroup.id).then(setLeaderboard)
  }, [activeGroup])

  const handleCreate = async () => {
    setError('')
    if (!name.trim() || !challengeId) return setError('Pick a challenge and name your group.')
    setSaving(true)
    const { data, error: createError } = await createChallengeGroup(user.id, { name: name.trim(), challengeId })
    setSaving(false)
    if (createError) return setError(createError.message)
    setShowCreate(false)
    setName('')
    setChallengeId('')
    loadGroups()
    setActiveGroup(data)
  }

  const handleJoin = async () => {
    setError('')
    if (!joinCode.trim()) return setError('Enter a join code.')
    setSaving(true)
    const { data, error: joinError } = await joinChallengeGroupByCode(user.id, joinCode)
    setSaving(false)
    if (joinError) return setError(joinError.message)
    setShowJoin(false)
    setJoinCode('')
    loadGroups()
    setActiveGroup(data)
  }

  const handleLeave = async (groupId) => {
    if (!confirm('Leave this group?')) return
    await leaveGroup(groupId, user.id)
    setActiveGroup(null)
    loadGroups()
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  if (groups === null) return <p className="mt-5 text-sm text-text-secondary">Loading…</p>

  if (activeGroup) {
    return (
      <div className="mt-5 flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setActiveGroup(null)}
          className="text-left text-sm font-medium text-text-secondary hover:text-text"
        >
          &larr; Back to groups
        </button>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{activeGroup.challenges?.title}</p>
          <p className="mt-0.5 text-lg font-extrabold text-text">{activeGroup.name}</p>
          <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3.5 py-2.5">
            <span className="font-mono text-sm text-text">{activeGroup.join_code}</span>
            <Button size="sm" variant="ghost" onClick={() => copyCode(activeGroup.join_code)}>
              <Copy size={13} /> {copied ? 'Copied' : 'Copy code'}
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => handleLeave(activeGroup.id)} className="mt-3 text-danger">
            <LogOut size={14} /> Leave group
          </Button>
        </Card>

        <Card className="p-5">
          <p className="mb-3 text-sm font-semibold text-text">Leaderboard &middot; total check-ins</p>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-text-secondary">No check-ins logged yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {leaderboard.map((row, i) => (
                <div key={row.user_id} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-bold text-text-secondary">
                    {i === 0 ? <Crown size={14} className="text-primary" /> : i + 1}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-text">
                    {row.full_name ?? 'Member'} {row.user_id === user.id ? '(you)' : ''}
                  </p>
                  <span className="text-sm font-bold text-text">{row.total_completions}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="mt-5 flex flex-col gap-4">
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => {
            setShowCreate((s) => !s)
            setShowJoin(false)
            setError('')
          }}
          className="flex-1"
        >
          <Plus size={15} /> Create group
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setShowJoin((s) => !s)
            setShowCreate(false)
            setError('')
          }}
          className="flex-1"
        >
          <Users size={15} /> Join with code
        </Button>
      </div>

      {showCreate && (
        <Card className="p-5">
          <Input label="Group name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Office Squad" />
          <p className="mb-2 mt-3 text-sm font-semibold text-text">Challenge</p>
          <div className="flex flex-wrap gap-2">
            {challenges.map((c) => (
              <Chip key={c.id} selected={challengeId === c.id} onClick={() => setChallengeId(c.id)}>
                {c.title}
              </Chip>
            ))}
          </div>
          {error && <p className="mt-3 text-sm font-medium text-danger">{error}</p>}
          <Button size="sm" onClick={handleCreate} disabled={saving} className="mt-4 w-full">
            {saving ? 'Creating…' : 'Create group'}
          </Button>
        </Card>
      )}

      {showJoin && (
        <Card className="p-5">
          <Input
            label="Join code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="e.g. 7K3QXD"
          />
          {error && <p className="mt-3 text-sm font-medium text-danger">{error}</p>}
          <Button size="sm" onClick={handleJoin} disabled={saving} className="mt-4 w-full">
            {saving ? 'Joining…' : 'Join group'}
          </Button>
        </Card>
      )}

      {groups.length === 0 ? (
        <Card className="p-8 text-center text-sm text-text-secondary">
          No groups yet — create one or join with a friend&rsquo;s code.
        </Card>
      ) : (
        <div className="flex flex-col gap-2.5">
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setActiveGroup(g)}
              className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 text-left hover:bg-surface-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text">{g.name}</p>
                <p className="text-xs text-text-secondary">{g.challenges?.title}</p>
              </div>
              <span className="shrink-0 font-mono text-xs text-text-secondary">{g.join_code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
