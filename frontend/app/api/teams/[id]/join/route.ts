import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract the team id from the URL
    const url = new URL(req.url);
    const parts = url.pathname.split("/"); // /api/teams/[id]/join
    const teamId = parts[3]; // [0]='', [1]='api', [2]='teams', [3]=id

    // Check if already a member
    const existing = await prisma.teamMember.findFirst({
      where: { teamId, userId: session.user.id },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You are already a member of this team" },
        { status: 400 }
      );
    }

    // Verify team exists
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Add user as member
    const teamMember = await prisma.teamMember.create({
      data: {
        teamId,
        userId: session.user.id,
        role: "MEMBER",
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(teamMember, { status: 201 });
  } catch (error) {
    console.error("Join team error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

