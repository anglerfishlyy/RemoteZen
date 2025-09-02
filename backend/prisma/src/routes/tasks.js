import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Create Task
router.post("/", authMiddleware, async (req, res) => {
  const { teamId, title, description, assignedToId, dueDate } = req.body;
  const task = await prisma.task.create({
    data: { teamId, title, description, assignedToId, dueDate },
  });
  res.json(task);
});

// List Tasks
router.get("/", authMiddleware, async (req, res) => {
  const { team_id } = req.query;
  const tasks = await prisma.task.findMany({
    where: { teamId: team_id },
  });
  res.json(tasks);
});

// Update Task
router.patch("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const task = await prisma.task.update({ where: { id }, data });
  res.json(task);
});

// Delete Task
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  await prisma.task.delete({ where: { id } });
  res.json({ message: "Task deleted" });
});

export default router;
