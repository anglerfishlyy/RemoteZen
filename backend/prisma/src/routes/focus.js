import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Start Focus
router.post("/start", authMiddleware, async (req, res) => {
  const { taskId } = req.body;
  if (!taskId) return res.status(400).json({ error: "taskId is required" });

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return res.status(404).json({ error: "Task not found" });

  const membership = await prisma.teamMember.findFirst({
    where: { teamId: task.teamId, userId: req.user.id },
  });
  if (!membership) return res.status(401).json({ error: "Unauthorized for this team" });

  const log = await prisma.focusLog.create({
    data: { userId: req.user.id, startTime: new Date() },
  });
  res.json(log);
});

// End Focus
router.post("/end", authMiddleware, async (req, res) => {
  const { logId } = req.body;
  const log = await prisma.focusLog.findUnique({ where: { id: logId } });
  if (!log) return res.status(404).json({ error: "Log not found" });

  const end = new Date();
  const duration = Math.floor((end - log.startTime) / 60000);

  const updated = await prisma.focusLog.update({
    where: { id: logId },
    data: { endTime: end, duration },
  });
  res.json(updated);
});

// Get User Logs
router.get("/", authMiddleware, async (req, res) => {
  const logs = await prisma.focusLog.findMany({ where: { userId: req.user.id } });
  res.json(logs);
});

export default router;
