import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Fix: Endpoint to check if a user exists by email
// Used by login page to redirect to sign-up if user doesn't exist
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    })

    return NextResponse.json({ exists: !!user })
  } catch (error) {
    console.error("Check user error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

