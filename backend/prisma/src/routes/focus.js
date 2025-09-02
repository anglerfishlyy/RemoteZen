import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Start Focus
router.post("/start", authMiddleware, async (req, res) => {
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
