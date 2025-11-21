import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import {prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { email, role = "MEMBER" } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Verify user is a member and has permission to invite
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId: params.id,
        userId: session.user.id,
      },
    })

    if (!teamMember) {
      return NextResponse.json(
        { error: "You are not a member of this team" },
        { status: 403 }
      )
    }

    if (teamMember.role !== "ADMIN" && teamMember.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Only admins and managers can invite members" },
        { status: 403 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User with this email does not exist" },
        { status: 404 }
      )
    }

    // Check if already a member
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId: params.id,
        userId: user.id,
      },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this team" },
        { status: 400 }
      )
    }

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        role: role as "MEMBER" | "MANAGER" | "ADMIN",
        teamId: params.id,
        invitedById: session.user.id,
      },
    })

    return NextResponse.json(invitation, { status: 201 })
  } catch (error) {
    console.error("Create invitation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}






