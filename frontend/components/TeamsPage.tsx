"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { useAuth } from '@/app/providers'

type NavigateFunction = (page: 'landing' | 'analytics' | 'login' | 'dashboard' | 'tasks' | 'timer' | 'profile') => void;
type Role = "MEMBER" | "MANAGER" | "ADMIN"
interface TeamsPageProps {
  onNavigate: NavigateFunction
  onLogout: () => void
}

interface TeamMember { id: string; role: 'MEMBER' | 'MANAGER' | 'ADMIN'; user: { id: string; name: string; email: string } }

interface Invite { id: string; email: string; role: 'MEMBER'|'MANAGER'|'ADMIN'; status: 'PENDING'|'ACCEPTED'|'DECLINED'; createdAt: string }

export default function TeamsPage({ onNavigate }: TeamsPageProps) {
  const { user } = useAuth()
  const [teamId, setTeamId] = useState('')
  const [members, setMembers] = useState<TeamMember[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'MANAGER' | 'ADMIN'>('MEMBER')
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([])

  // Fix: Use NextAuth session and internal API routes
  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const meRes = await fetch('/api/user/me', { credentials: 'include' })
        if (!meRes.ok) return
        const me = await meRes.json()
        const firstTeam = me?.user?.teams?.[0]?.team
        if (firstTeam) {
          setTeamId(firstTeam.id)
          const res = await fetch(`/api/teams/${firstTeam.id}/members`, { credentials: 'include' })
          if (res.ok) {
            const mem = await res.json()
            setMembers(Array.isArray(mem) ? mem : [])
          }
          // Note: Invites endpoint might not exist, handle gracefully
          try {
            const inv = await fetch(`/api/teams/${firstTeam.id}/invites`, { credentials: 'include' })
            if (inv.ok) {
              const invData = await inv.json()
              setPendingInvites(Array.isArray(invData) ? invData : [])
            }
          } catch {}
        }
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [user])

  // Fix: Use internal API routes
  const invite = async () => {
    if (!teamId || !inviteEmail) return
    try {
      const res = await fetch(`/api/teams/${teamId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create invite')
      setInviteEmail('')
      setInviteRole('MEMBER')
      // Reload invites
      const inv = await fetch(`/api/teams/${teamId}/invites`, { credentials: 'include' })
      if (inv.ok) {
        const invData = await inv.json()
        setPendingInvites(Array.isArray(invData) ? invData : [])
      }
    } catch (error) {
      console.error('Failed to invite:', error)
    }
  }

  return (
    <div className="flex flex-col overflow-hidden">
        {/* Fix: Header - responsive layout */}
        <header className="bg-black/40 backdrop-blur-xl border-b border-white/10 px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xl md:text-2xl font-bold text-white">
                Team
              </motion.h1>
              <p className="text-gray-400 mt-1 text-sm md:text-base">Manage team members and invitations.</p>
            </div>
          </div>
        </header>

        {/* Fix: Main content - responsive padding */}
        <main className="flex-1 overflow-auto p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Fix: Members card - responsive padding */}
          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardContent className="p-4 md:p-6">
              <h3 className="text-white font-medium mb-3 md:mb-4 text-base md:text-lg">Members</h3>
              <div className="space-y-3">
                {members.length === 0 ? (
                  <div className="text-gray-400">No members found.</div>
                ) : (
                  members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div>
                        <div className="text-white">{m.user.name}</div>
                        <div className="text-gray-400 text-sm">{m.user.email}</div>
                      </div>
                      <Badge variant="outline" className="text-xs border-white/20 text-gray-300">{m.role}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Fix: Invite card - responsive padding */}
          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
              <h3 className="text-white font-medium text-base md:text-lg">Invite user</h3>
              {/* Fix: Responsive grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="bg-white/5 border-white/10 text-white" placeholder="name@company.com" />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={inviteRole} onValueChange={(v: Role) => setInviteRole(v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10">
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" onClick={invite}>Send Invite</Button>
                </div>
              </div>
              <p className="text-gray-400 text-sm">Invitations are automatically accepted if the invited user signs up with the same email.</p>
            </CardContent>
          </Card>

          {/* Fix: Pending invites card - responsive padding */}
          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardContent className="p-4 md:p-6">
              <h3 className="text-white font-medium mb-3 md:mb-4 text-base md:text-lg">Pending Invites</h3>
              <div className="space-y-3">
                {pendingInvites.length === 0 ? (
                  <div className="text-gray-400">No pending invites.</div>
                ) : (
                  pendingInvites.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div>
                        <div className="text-white">{inv.email}</div>
                        <div className="text-gray-400 text-sm">Created {new Date(inv.createdAt).toLocaleString()}</div>
                      </div>
                      <Badge variant="outline" className="text-xs border-white/20 text-gray-300">{inv.role}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </main>
    </div>
  )
}


