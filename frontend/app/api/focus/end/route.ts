import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/authOptions"
import {prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(auth)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { timerId } = body

    if (!timerId) {
      return NextResponse.json(
        { error: "Timer ID is required" },
        { status: 400 }
      )
    }

    // Get timer
    const timer = await prisma.timer.findUnique({
      where: { id: timerId },
    })

    if (!timer) {
      return NextResponse.json({ error: "Timer not found" }, { status: 404 })
    }

    if (timer.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only end your own timers" },
        { status: 403 }
      )
    }

    if (timer.endedAt) {
      return NextResponse.json(
        { error: "Timer is already ended" },
        { status: 400 }
      )
    }

    // Calculate duration
    const endTime = new Date()
    const duration = Math.floor((endTime.getTime() - timer.startedAt.getTime()) / 1000)

    // Update timer
    const updatedTimer = await prisma.timer.update({
      where: { id: timerId },
      data: {
        endedAt: endTime,
        duration,
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

    // Create focus log
    await prisma.focusLog.create({
      data: {
        userId: session.user.id,
        startTime: timer.startedAt,
        endTime,
        duration,
      },
    })

    return NextResponse.json(updatedTimer)
  } catch (error) {
    console.error("End timer error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}






