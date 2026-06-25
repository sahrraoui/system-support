import express from "express";
import Database from "better-sqlite3";
import crypto from "crypto";
const router = express.Router();
import db from "./db.js"

router.post("/tickets", (req, res) => {
  const { subject, guest_email, message } = req.body;
  if (!subject || !guest_email || !message) {
    return res.status(400).json({
      error: "subject, guest_email and message are required",
    });
  }
  if (typeof subject !== "string") {
    return res.status(400).json({
      error: "subject must be  a string",
    });
  }
  if (typeof guest_email !== "string") {
    return res.status(400).json({
      error: "guest_email must be a string",
    });
  }

  if (typeof message !== "string") {
    return res.status(400).json({
      error: "message must be a string",
    });
  }
  const guest_token = crypto.randomBytes(64).toString("hex");
  const insertTicketAndMessage = db.transaction((
  ) => {
    
  })
});

