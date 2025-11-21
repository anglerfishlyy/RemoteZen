import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { taskId } = body

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      )
    }

    // Verify task exists and user has access
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Verify user is a member of the team
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId: task.teamId,
        userId: session.user.id,
      },
    })

    if (!teamMember) {
      return NextResponse.json(
        { error: "You are not a member of this team" },
        { status: 403 }
      )
    }

    // Check if there's an active timer for this task
    const activeTimer = await prisma.timer.findFirst({
      where: {
        taskId,
        userId: session.user.id,
        endedAt: null,
      },
    })

    if (activeTimer) {
      return NextResponse.json(
        { error: "Timer is already running for this task" },
        { status: 400 }
      )
    }

    // Create timer
    const timer = await prisma.timer.create({
      data: {
        taskId,
        userId: session.user.id,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json(timer, { status: 201 })
  } catch (error) {
    console.error("Start timer error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}






