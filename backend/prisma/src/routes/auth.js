import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

function mapTeams(teamMembers) {
  return teamMembers.map((tm) => ({
    id: tm.team.id,
    name: tm.team.name,
    role: tm.role,
  }));
}

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email and password are required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({ data: { name, email, passwordHash } });

      const personalTeam = await tx.team.create({
        data: { name: `${createdUser.name}'s Team` },
      });

      await tx.teamMember.create({
        data: { teamId: personalTeam.id, userId: createdUser.id, role: "MANAGER" },
      });

      // Accept pending invitations for this email
      const pendingInvites = await tx.invitation.findMany({
        where: { email: createdUser.email, status: "PENDING" },
      });

      for (const invite of pendingInvites) {
        await tx.teamMember.upsert({
          where: { teamId_userId: { teamId: invite.teamId, userId: createdUser.id } },
          update: {},
          create: { teamId: invite.teamId, userId: createdUser.id, role: invite.role },
        });
        await tx.invitation.update({ where: { id: invite.id }, data: { status: "ACCEPTED" } });
      }

      const userWithTeams = await tx.user.findUnique({
        where: { id: createdUser.id },
        include: { teams: { include: { team: true } } },
      });

      return userWithTeams;
    });

    const token = jwt.sign({ id: result.id, email: result.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({
      user: { id: result.id, email: result.email, name: result.name },
      teams: mapTeams(result.teams),
      token,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email }, include: { teams: { include: { team: true } } } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.status(200).json({
      user: { id: user.id, email: user.email, name: user.name },
      teams: mapTeams(user.teams),
      token,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /auth/me
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id }, include: { teams: { include: { team: true } } } });
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    return res.status(200).json({
      user: { id: user.id, email: user.email, name: user.name },
      teams: mapTeams(user.teams),
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
