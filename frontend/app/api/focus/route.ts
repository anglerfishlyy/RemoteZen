import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import {prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(auth)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const focusLogs = await prisma.focusLog.findMany({
      where: { userId: session.user.id },
      orderBy: {
        startTime: "desc",
      },
      take: 100,
    })

    return NextResponse.json(focusLogs)
  } catch (error) {
    console.error("Get focus logs error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}






