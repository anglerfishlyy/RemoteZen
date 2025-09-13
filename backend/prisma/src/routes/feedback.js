import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Create feedback submission
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get user ID from token if available (optional)
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        // Simple JWT decode (in production, use proper JWT library)
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        if (payload.userId) {
          userId = payload.userId;
        }
      } catch (e) {
        // Token invalid, continue without user ID
      }
    }

    const feedback = await prisma.feedback.create({
      data: {
        name: name?.trim() || null,
        email: email?.trim() || null,
        message: message.trim(),
        userId: userId
      }
    });

    return res.status(201).json({
      id: feedback.id,
      message: "Feedback submitted successfully"
    });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return res.status(500).json({ error: "Failed to submit feedback" });
  }
});

// Get all feedback (admin only)
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const feedback = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return res.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

export default router;
