import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";
import { prisma } from "@/lib/prisma";

// ---------------------- GET TASK ----------------------
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const id = context.params.id;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        team: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const teamMember = await prisma.teamMember.findFirst({
      where: { teamId: task.teamId, userId: session.user.id },
    });

    if (!teamMember) return NextResponse.json({ error: "You are not a member of this team" }, { status: 403 });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Get task error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---------------------- UPDATE TASK ----------------------
export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  const id = context.params.id;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, description, status, assignedToId, dueDate } = body;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const teamMember = await prisma.teamMember.findFirst({
      where: { teamId: existingTask.teamId, userId: session.user.id },
    });
    if (!teamMember) return NextResponse.json({ error: "You are not a member of this team" }, { status: 403 });

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        team: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---------------------- DELETE TASK ----------------------
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const id = context.params.id;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const teamMember = await prisma.teamMember.findFirst({
      where: { teamId: task.teamId, userId: session.user.id },
    });
    if (!teamMember) return NextResponse.json({ error: "You are not a member of this team" }, { status: 403 });

    if (
      task.createdById !== session.user.id &&
      teamMember.role !== "ADMIN" &&
      teamMember.role !== "MANAGER"
    ) {
      return NextResponse.json({ error: "Only the creator or team admin can delete this task" }, { status: 403 });
    }

    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
