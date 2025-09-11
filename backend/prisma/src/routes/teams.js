import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Create Team
router.post("/", authMiddleware, async (req, res) => {
  const { name } = req.body;
  const team = await prisma.team.create({
    data: { name, members: { create: { userId: req.user.id, role: "ADMIN" } } },
  });
  res.json(team);
});

// Join Team
router.post("/:id/join", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const member = await prisma.teamMember.create({
      data: { teamId: id, userId: req.user.id },
    });
    res.json(member);
  } catch (err) {
    res.status(400).json({ error: "Already a member" });
  }
});

// List Members
router.get("/:id/members", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const members = await prisma.teamMember.findMany({
    where: { teamId: id },
    include: { user: true },
  });
  res.json(members);
});

export default router;
