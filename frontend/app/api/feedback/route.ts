import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, message } = body

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Get session if available (optional - feedback can be anonymous)
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    const feedback = await prisma.feedback.create({
      data: {
        name: name || null,
        email: email || null,
        message,
        userId,
      },
    })

    return NextResponse.json(feedback, { status: 201 })
  } catch (error) {
    console.error("Submit feedback error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}






