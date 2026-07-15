import express from "express";
const router = express.Router();

import Intern from "../models/Intern.js";

/*
==================================
Verify Certificate
==================================
*/

router.get("/certificate/:certificateNumber", async (req, res) => {
  try {
    const intern = await Intern.findOne({
      certificateNumber: req.params.certificateNumber,
    });

    if (!intern) {
      return res.status(404).json({
        verified: false,
        message: "Certificate Not Found",
      });
    }

    res.json({
      verified: true,
      name: intern.name,
      internId: intern.internId,
      department: intern.department,
      college: intern.college,
      certificateNumber: intern.certificateNumber,
      startDate: intern.startDate,
      endDate: intern.endDate,
      status: intern.status,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;