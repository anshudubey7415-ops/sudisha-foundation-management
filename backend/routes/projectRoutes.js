import express from "express";
import Project from "../models/Project.js";
import Intern from "../models/Intern.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET Projects assigned to logged-in Intern
router.get("/my/projects", verifyToken, async (req, res) => {
  try {
    let email = req.user?.email;
    if (!email && req.user?.id) {
      const userDoc = await User.findById(req.user.id);
      if (userDoc) email = userDoc.email;
    }

    if (!email) {
      return res.status(400).json({ message: "No email associated with logged in user." });
    }

    const cleanEmail = email.trim();
    const intern = await Intern.findOne({
      email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") }
    });

    if (!intern) {
      return res.status(404).json({ message: "Intern profile not found for this email." });
    }

    const projects = await Project.find({
      "members.memberId": intern._id
    });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 1. Project Create karna
router.post("/", async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Saare Projects dekhna
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Edit karne ke liye: Single Project fetch karna (by ID)
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Update project (Edit functionality)
router.put("/:id", async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.json(updatedProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Delete project (Naya route)
router.delete("/:id", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;