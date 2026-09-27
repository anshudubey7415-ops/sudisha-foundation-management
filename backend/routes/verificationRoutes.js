import express from "express";
const router = express.Router();

import Intern from "../models/Intern.js";
import Volunteer from "../models/Volunteer.js";

/*
==================================
Verify Certificate
==================================
*/

router.get("/certificate/:certificateNumber", async (req, res) => {
  try {
    const certNum = req.params.certificateNumber?.trim();
    if (!certNum) {
      return res.status(400).json({
        verified: false,
        message: "Certificate number is required",
      });
    }

    const intern = await Intern.findOne({
      certificateNumber: { $regex: new RegExp(`^${certNum}$`, "i") },
    });

    if (intern) {
      return res.json({
        verified: true,
        type: "Intern",
        name: intern.name,
        internId: intern.internId,
        department: intern.department,
        college: intern.college,
        certificateNumber: intern.certificateNumber,
        startDate: intern.startDate,
        endDate: intern.endDate,
        status: intern.status,
      });
    }

    const volunteer = await Volunteer.findOne({
      $or: [
        { certificateNumber: { $regex: new RegExp(`^${certNum}$`, "i") } },
        { verificationId: { $regex: new RegExp(`^${certNum}$`, "i") } },
      ],
    });

    if (volunteer) {
      return res.json({
        verified: true,
        type: "Volunteer",
        name: volunteer.name,
        internId: volunteer.volunteerId,
        department: volunteer.skills?.join(", ") || volunteer.badge || "Volunteer Service",
        college: volunteer.education || "Volunteer",
        certificateNumber: volunteer.certificateNumber || volunteer.verificationId,
        startDate: volunteer.joiningDate,
        endDate: "Active / Contributor",
        status: volunteer.status,
        totalHours: volunteer.totalHours,
        badge: volunteer.badge,
      });
    }

    return res.status(404).json({
      verified: false,
      message: "Certificate Not Found",
    });
  } catch (error) {
    res.status(500).json({
      verified: false,
      message: error.message,
    });
  }
});

export default router;