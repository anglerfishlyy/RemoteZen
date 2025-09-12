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
  // ensure requester is a member
  const membership = await prisma.teamMember.findFirst({ where: { teamId: id, userId: req.user.id } });
  if (!membership) return res.status(401).json({ error: "Unauthorized for this team" });

  const members = await prisma.teamMember.findMany({
    where: { teamId: id },
    include: { user: true },
    orderBy: { joinedAt: 'asc' }
  });
  res.json(members.map(m => ({ id: m.id, role: m.role, joinedAt: m.joinedAt, user: { id: m.user.id, name: m.user.name, email: m.user.email } })));
});

export default router;
