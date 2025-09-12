import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// POST /invites
router.post("/", authMiddleware, async (req, res) => {
  const { teamId, email, role } = req.body || {};
  if (!teamId || !email) {
    return res.status(400).json({ error: "teamId and email are required" });
  }

  // Ensure requester is MANAGER or ADMIN on the team
  const requester = await prisma.teamMember.findFirst({ where: { teamId, userId: req.user.id } });
  if (!requester) return res.status(401).json({ error: "Unauthorized for this team" });
  if (!(requester.role === "MANAGER" || requester.role === "ADMIN")) {
    return res.status(401).json({ error: "Only managers or admins can invite" });
  }

  try {
    const invite = await prisma.invitation.create({
      data: {
        email,
        role: role && ["MEMBER", "MANAGER", "ADMIN"].includes(role) ? role : "MEMBER",
        teamId,
        invitedById: req.user.id,
      },
    });
    return res.status(201).json(invite);
  } catch (e) {
    return res.status(500).json({ error: "Failed to create invite" });
  }
});

export default router;
// GET /invites?teamId=...
router.get('/', authMiddleware, async (req, res) => {
  const { teamId } = req.query;
  if (!teamId) return res.status(400).json({ error: 'teamId is required' });
  const membership = await prisma.teamMember.findFirst({ where: { teamId: String(teamId), userId: req.user.id } });
  if (!membership) return res.status(401).json({ error: 'Unauthorized for this team' });
  const invites = await prisma.invitation.findMany({ where: { teamId: String(teamId), status: 'PENDING' }, orderBy: { createdAt: 'desc' } });
  return res.json(invites);
});


