import express from "express";
import crypto from "crypto";
const router = express.Router();
import db from "./db"
import { error } from "console";

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
    const ticketResult = db.prepare(`INSERT INTO tickets (
      subject,
      status,
      guest_email,
      guest_token
      
      )
      VALUES (
      ?,?,?,?)` ).run(subject,"open",guest_email,guest_token);
      const ticketId = ticketResult.lastInsertRowid as number;
        db.prepare(`INSERT INTO messages(
        ticket_id,
        sender_type,
        body
        )
        VALUES(?,?,?)`).run(ticketId,"user",message)
        return ticketId;
    })
  try {
    const ticketId = insertTicketAndMessage();
    const ticket = db.prepare(`SELECT * FROM tickets where id = ?`).get(ticketId);
    return res.status(201).json( { ticket })
  }catch(err){
    console.error(err);
    return res.status(500).json({ error: "Failed to create ticket" })
  }
});
router.get("/tickets/:id",(req,res) =>{
  const ticketId = Number(req.params.id)
    if (!Number.isInteger(ticketId)) {
      return res.status(400).json({
        error: "the id must be an integer "
      })
    }
    const ticket = db.prepare(`SELECT * FROM tickets where id =?`).get(ticketId)
    if (!ticket) {
      return res.status(404).json({error : "ticket not found! "})
    }
    const messages = db.prepare(`SELECT * FROM messages where  ticket_id = ? ORDER BY created_at ASC`).all(ticketId)
    return res.json({ticket , messages})
  });
  router.post("/tickets/:id/messages",(req,res) =>{
    const {sender_type , body} = req.body

    const ticketId = Number(req.params.id)
    if (!Number.isInteger(ticketId)) {
      return res.status(400).json({
        error: "the id must be an integer "
      })}
    if (!body || !sender_type){
      return res.status(400).json({error:"body are requierd"})
    }
    if (typeof body !== "string") {
      return res.status(400).json({error:"the body must be a text"})
    }
    if (sender_type !== "user"  && sender_type !== "admin") {
    return res.status(400).json({error:
      "operation not acceptaed"
    })
    }
    const ticket = db.prepare(`SELECT * FROM tickets where id = ?`).get(ticketId)
    if (!ticket) {
      return res.status(404).json({error: "ticket not found"})
    }
    }
)


export default router;