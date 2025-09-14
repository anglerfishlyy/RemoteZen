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
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  const [teamId, setTeamId] = useState('')
  const [members, setMembers] = useState<TeamMember[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'MANAGER' | 'ADMIN'>('MEMBER')
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || !user) return
    const load = async () => {
      const me = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await me.json()
      const firstTeam = data.teams?.[0]
      if (firstTeam) {
        setTeamId(firstTeam.id)
        const res = await fetch(`${API_URL}/teams/${firstTeam.id}/members`, { headers: { Authorization: `Bearer ${token}` } })
        const mem = await res.json()
        setMembers(mem)
        const inv = await fetch(`${API_URL}/invites?teamId=${firstTeam.id}`, { headers: { Authorization: `Bearer ${token}` } })
        const invData = await inv.json()
        setPendingInvites(Array.isArray(invData) ? invData : [])
      }
    }
    load()
  }, [API_URL, user])

  const invite = async () => {
    const token = localStorage.getItem('token')
    if (!token || !teamId || !inviteEmail) return
    const res = await fetch(`${API_URL}/invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ teamId, email: inviteEmail, role: inviteRole }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || 'Failed to create invite')
    setInviteEmail('')
    setInviteRole('MEMBER')
  }

  return (
    <div className="flex flex-col overflow-hidden">
        <header className="bg-black/40 backdrop-blur-xl border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-white">
                Team
              </motion.h1>
              <p className="text-gray-400 mt-1">Manage team members and invitations.</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 space-y-6">
          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <h3 className="text-white font-medium mb-4">Members</h3>
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

          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-white font-medium">Invite user</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <h3 className="text-white font-medium mb-4">Pending Invites</h3>
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


