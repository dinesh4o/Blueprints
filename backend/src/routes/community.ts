import express from "express";
import { Thread } from "../models/Thread";

const router = express.Router();

// Get all threads
router.get("/", async (req, res) => {
  try {
    const threads = await Thread.find().sort({ createdAt: -1 });
    res.json(threads);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch threads" });
  }
});

// Create thread
router.post("/", async (req, res) => {
  try {
    const newThread = new Thread(req.body);
    const savedThread = await newThread.save();
    res.status(201).json(savedThread);
  } catch (error) {
    res.status(500).json({ error: "Failed to create thread" });
  }
});

// Add comment
router.post("/:id/comments", async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ error: "Thread not found" });

    thread.comments.push(req.body);
    await thread.save();
    res.status(201).json(thread);
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Toggle upvote
router.post("/:id/upvote", async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ error: "Thread not found" });

    // For simplicity, just increment. In a real app we would track user likes
    thread.upvotes += 1;
    await thread.save();
    res.json(thread);
  } catch (error) {
    res.status(500).json({ error: "Failed to upvote" });
  }
});

export default router;
