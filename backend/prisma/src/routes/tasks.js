import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Create Task
router.post("/", authMiddleware, async (req, res) => {
  const { teamId, title, description, assignedToId, dueDate } = req.body;
  if (!teamId || !title) {
    return res.status(400).json({ error: "teamId and title are required" });
  }

  // Ensure the requester belongs to the team
  const membership = await prisma.teamMember.findFirst({
    where: { teamId, userId: req.user.id },
  });
  if (!membership) {
    return res.status(401).json({ error: "Unauthorized for this team" });
  }

  // If assigning, ensure assignee belongs to the same team
  if (assignedToId) {
    const assigneeMembership = await prisma.teamMember.findFirst({
      where: { teamId, userId: assignedToId },
    });
    if (!assigneeMembership) {
      return res.status(400).json({ error: "Assigned user is not a member of the team" });
    }
  }

  const task = await prisma.task.create({
    data: {
      teamId,
      title,
      description,
      assignedToId: assignedToId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdById: req.user.id,
    },
    include: { assignedTo: true, createdBy: true, team: true },
  });
  res.json(task);
});

// List Tasks by team
router.get("/", authMiddleware, async (req, res) => {
  const { teamId } = req.query;
  if (!teamId) return res.status(400).json({ error: "teamId is required" });

  // validate membership
  const membership = await prisma.teamMember.findFirst({ where: { teamId: String(teamId), userId: req.user.id } });
  if (!membership) return res.status(401).json({ error: "Unauthorized for this team" });

  const tasks = await prisma.task.findMany({
    where: { teamId: String(teamId) },
    include: { assignedTo: true, createdBy: true, team: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(tasks);
});

// Get tasks assigned to me
router.get("/my", authMiddleware, async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { assignedToId: req.user.id },
    include: { assignedTo: true, createdBy: true, team: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(tasks);
});

// Update Task (status, title, description, assignedToId, dueDate)
router.patch("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status, title, description, assignedToId, dueDate } = req.body;

  const existing = await prisma.task.findUnique({ where: { id }, include: { team: true } });
  if (!existing) return res.status(404).json({ error: "Task not found" });

  const membership = await prisma.teamMember.findFirst({ where: { teamId: existing.teamId, userId: req.user.id } });
  if (!membership) return res.status(401).json({ error: "Unauthorized for this team" });

  let updateData = {};
  if (status) updateData.status = status;
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
  if (assignedToId !== undefined) {
    if (assignedToId === null) {
      updateData.assignedToId = null;
    } else {
      const assigneeMembership = await prisma.teamMember.findFirst({ where: { teamId: existing.teamId, userId: assignedToId } });
      if (!assigneeMembership) return res.status(400).json({ error: "Assigned user is not a member of the team" });
      updateData.assignedToId = assignedToId;
    }
  }

  const task = await prisma.task.update({
    where: { id },
    data: updateData,
    include: { assignedTo: true, createdBy: true, team: true },
  });
  res.json(task);
});

// Delete Task
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Task not found" });

  const membership = await prisma.teamMember.findFirst({ where: { teamId: existing.teamId, userId: req.user.id } });
  if (!membership) return res.status(401).json({ error: "Unauthorized for this team" });

  await prisma.task.delete({ where: { id } });
  res.json({ message: "Task deleted" });
});

export default router;
