import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import authRoutes from "./routes/auth.js";
import teamRoutes from "./routes/teams.js";
import taskRoutes from "./routes/tasks.js";
import focusRoutes from "./routes/focus.js";
import inviteRoutes from "./routes/invites.js";
import feedbackRoutes from "./routes/feedback.js";

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/teams", teamRoutes);
app.use("/tasks", taskRoutes);
app.use("/focus", focusRoutes);
app.use("/invites", inviteRoutes);
app.use("/feedback", feedbackRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
