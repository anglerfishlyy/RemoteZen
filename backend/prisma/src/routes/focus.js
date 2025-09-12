import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Start Focus - create active Timer (and optional FocusLog for history)
router.post("/start", authMiddleware, async (req, res) => {
  const { taskId } = req.body;
  if (!taskId) return res.status(400).json({ error: "taskId is required" });

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return res.status(404).json({ error: "Task not found" });

  const membership = await prisma.teamMember.findFirst({ where: { teamId: task.teamId, userId: req.user.id } });
  if (!membership) return res.status(401).json({ error: "Unauthorized for this team" });

  // Prevent multiple active timers for a user
  const existing = await prisma.timer.findFirst({ where: { userId: req.user.id, endedAt: null } });
  if (existing) return res.status(400).json({ error: "You already have an active timer" });

  const startedAt = new Date();
  const timer = await prisma.timer.create({
    data: { userId: req.user.id, taskId: task.id, startedAt },
  });

  // Also log into FocusLog for simple history list (optional)
  await prisma.focusLog.create({ data: { userId: req.user.id, startTime: startedAt } });

  return res.status(201).json(timer);
});

// End Focus - stop active Timer for user or by timerId
router.post("/end", authMiddleware, async (req, res) => {
  const { timerId, logId } = req.body || {};

  // Prefer explicit timerId, otherwise use active timer for user
  const timer = timerId
    ? await prisma.timer.findUnique({ where: { id: timerId } })
    : await prisma.timer.findFirst({ where: { userId: req.user.id, endedAt: null } });

  if (!timer) return res.status(404).json({ error: "Active timer not found" });

  // Authorization: user must own timer and belong to team
  const task = await prisma.task.findUnique({ where: { id: timer.taskId } });
  if (!task) return res.status(404).json({ error: "Task not found" });
  const membership = await prisma.teamMember.findFirst({ where: { teamId: task.teamId, userId: req.user.id } });
  if (!membership) return res.status(401).json({ error: "Unauthorized for this team" });

  const endedAt = new Date();
  const durationSec = Math.floor((endedAt.getTime() - new Date(timer.startedAt).getTime()) / 1000);
  const updated = await prisma.timer.update({ where: { id: timer.id }, data: { endedAt, duration: durationSec } });

  // If a focusLog was provided, finish it as well (best-effort)
  if (logId) {
    const log = await prisma.focusLog.findUnique({ where: { id: logId } });
    if (log && !log.endTime) {
      await prisma.focusLog.update({ where: { id: logId }, data: { endTime: endedAt, duration: Math.floor(durationSec / 60) } });
    }
  }

  return res.json(updated);
});

// Get User Logs (focus logs)
router.get("/", authMiddleware, async (req, res) => {
  const logs = await prisma.focusLog.findMany({ where: { userId: req.user.id }, orderBy: { startTime: 'desc' } });
  return res.json(logs);
});

// Get active timers for a team
router.get("/active", authMiddleware, async (req, res) => {
  const { teamId } = req.query;
  if (!teamId) return res.status(400).json({ error: "teamId is required" });

  const membership = await prisma.teamMember.findFirst({ where: { teamId: String(teamId), userId: req.user.id } });
  if (!membership) return res.status(401).json({ error: "Unauthorized for this team" });

  const timers = await prisma.timer.findMany({
    where: { endedAt: null, task: { teamId: String(teamId) } },
    include: { user: true, task: true },
    orderBy: { startedAt: 'desc' },
  });

  return res.json(timers.map(t => ({
    id: t.id,
    startedAt: t.startedAt,
    user: { id: t.user.id, name: t.user.name },
    task: { id: t.task.id, title: t.task.title },
  })));
});

export default router;
