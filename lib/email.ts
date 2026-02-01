import nodemailer from "nodemailer";

export async function sendSupportEmail({
  name,
  email,
  description
}: {
  name: string;
  email: string;
  description: string;
}) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.SUPPORT_EMAIL_TO;
  const from = process.env.SUPPORT_EMAIL_FROM || to;

  if (!host || !port || !user || !pass || !to || !from) {
    throw new Error("Missing email configuration");
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass }
  });

  await transporter.sendMail({
    to,
    from,
    replyTo: email,
    subject: `SloaneX Support Request from ${name}`,
    text: description,
    html: `<p><strong>Name:</strong> ${name}</p>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Description:</strong></p>
           <p>${description.replace(/\n/g, "<br />")}</p>`
  });
}
