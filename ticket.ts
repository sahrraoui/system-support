import express from "express";
import crypto from "crypto";
const router = express.Router();
import db from "./db"
import { error } from "console";
import { sendTicketCreatedEmail } from "./emailService";
import { sendAdminReplyEmail } from "./emailService";
interface Ticket {
  id: number;
  subject: string;
  status: string;
  guest_email: string;
  guest_token: string;
  created_at: string;
}

router.post("/tickets", async(req, res) => {
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
    await sendTicketCreatedEmail(guest_email, subject);
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
  router.post("/tickets/:id/messages",async (req,res) =>{
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
    try {
    const messageResult =
    db.prepare(`INSERT INTO messages (ticket_id, sender_type, body) VALUES (?, ?, ?)`).run(ticketId,sender_type,body)
    const messageId = messageResult.lastInsertRowid as number;
    
    const ticket = db.prepare(`SELECT * FROM tickets WHERE id = ?`).get(ticketId) as Ticket | undefined;
    if (!ticket) {
  return res.status(404).json({ error: "ticket not found" });
} 
    if (sender_type === "admin") {
  await sendAdminReplyEmail(ticket.guest_email, body);
}
    return res.status(201).json({messageId});
    }
    catch(err) {
      console.error(err)
      return res.status(500).json({error:"failed to add the messages"})
    }
    }
    
)
router.get("/tickets",(req,res)=>{
      const tickets = db.prepare(`SELECT * FROM tickets ORDER BY created_at DESC `).all()
      return res.json({tickets})
      
    })
    router.patch("/tickets/:id",(req,res) =>{
      const ticketId = Number(req.params.id)
      if(!Number.isInteger(ticketId)){
        return res.status(400).json({error:"the id must be an integer"})
      }
      const {status} = req.body
      if (status !== "open" && status !== "pending" && status !== "closed") {
      return res.status(400).json({error: "status must be open, pending, or closed"})
}
if (typeof status  !== "string") {
  return res.status(400).json({error:"the status must be an string"})
}try { 
const ticket = db.prepare(`SELECT * FROM tickets WHERE id = ?`).get(ticketId)
if (!ticket) {
  return res.status(404).json({ error: "ticket not found" })
}

db.prepare(`UPDATE tickets SET status = ? WHERE id = ?`).run(status, ticketId)
const updatedTicket = db.prepare(`SELECT * FROM tickets WHERE id = ?`).get(ticketId)
return res.status(200).json({ ticket: updatedTicket})}catch(err){
  console.error(err)
  return res.status(500).json({error:"failed to update status of the ticket"})
}
    })


export default router;