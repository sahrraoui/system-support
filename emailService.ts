
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 1025,
  ignoreTLS: true,
});

export async function sendTicketCreatedEmail(emailaddr: string, ticketSubject: string) {
  await transporter.sendMail({
    from: "support@support.com",
    to: emailaddr,
    subject: "We received your ticket",
    html: `<strong>${ticketSubject}</strong>`,
  });
}

export async function sendAdminReplyEmail(remail: string, replyBody: string) {
  await transporter.sendMail({
    from: "support@support.com",
    to: remail,
    subject: "New reply to your ticket",
    html: replyBody,
  });
}
