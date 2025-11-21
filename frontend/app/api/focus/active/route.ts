import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import {prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const teamId = searchParams.get("teamId")

    const where: any = {
      userId: session.user.id,
      endedAt: null,
    }

    if (teamId) {
      // Get tasks for this team
      const tasks = await prisma.task.findMany({
        where: { teamId },
        select: { id: true },
      })

      const taskIds = tasks.map((t) => t.id)
      where.taskId = { in: taskIds }
    }

    const activeTimers = await prisma.timer.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    })

    return NextResponse.json(activeTimers)
  } catch (error) {
    console.error("Get active timers error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}






