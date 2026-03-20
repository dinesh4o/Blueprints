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

    const userId = req.body.userId;
    if (!userId || userId === "anonymous") return res.status(401).json({ error: "Unauthorized" });

    const hasUpvotedIndex = thread.upvotedBy.indexOf(userId);

    if (hasUpvotedIndex > -1) {
      // User already upvoted, so remove their upvote (toggle off)
      thread.upvotedBy.splice(hasUpvotedIndex, 1);
      thread.upvotes = Math.max(0, thread.upvotes - 1);
    } else {
      // User hasn't upvoted yet, add their upvote (toggle on)
      thread.upvotedBy.push(userId);
      thread.upvotes += 1;
    }

    await thread.save();
    res.json(thread);
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle upvote" });
  }
});

// Delete thread
router.delete("/:id", async (req, res) => {
  try {
    await Thread.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete thread" });
  }
});

// Edit thread
router.put("/:id", async (req, res) => {
  try {
    const thread = await Thread.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      content: req.body.content
    }, { new: true });
    res.json(thread);
  } catch (error) {
    res.status(500).json({ error: "Failed to update thread" });
  }
});

// Delete comment
router.delete("/:id/comments/:commentId", async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ error: "Thread not found" });
    
    // @ts-ignore
    thread.comments.pull(req.params.commentId);
    await thread.save();
    res.json(thread);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// Edit comment
router.put("/:id/comments/:commentId", async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ error: "Thread not found" });
    
    const comment = thread.comments.id(req.params.commentId);
    if (comment) {
      comment.content = req.body.content;
      await thread.save();
    }
    res.json(thread);
  } catch (error) {
    res.status(500).json({ error: "Failed to edit comment" });
  }
});

export default router;

