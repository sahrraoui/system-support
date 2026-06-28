
import { Resend } from "resend";


const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTicketCreatedEmail(emailaddr:string,ticketSubjet:string) {
  const {data,error}= await resend.emails.send({
    
    from: "Acme <onboarding@resend.dev>",
    to: emailaddr,
    subject: "we receive your ticket",
    html: `<strong>${ticketSubjet}</strong>`
  })
if (error) {
  console.error(error)
  
}

}
export async function sendAdminReplyEmail (remail:string,replyBody:string) {
const {data , error} = await resend.emails.send({
  from:"Acme <onboarding@resend.dev>",
  to:remail,
  subject:"New reply to your ticket",
  html:`${replyBody}`
  
})
if (error) { console.error(error) }  
}
