import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract team id from URL
    const url = new URL(req.url);
    const parts = url.pathname.split("/"); // ['', 'api', 'teams', '[id]', 'members']
    const teamId = parts[3];

    // Verify user is a member of the team
    const teamMember = await prisma.teamMember.findFirst({
      where: { teamId, userId: session.user.id },
    });

    if (!teamMember) {
      return NextResponse.json(
        { error: "You are not a member of this team" },
        { status: 403 }
      );
    }

    // Fetch all team members
    const members = await prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Get team members error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
