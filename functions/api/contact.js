// Cloudflare Pages Function: POST /api/contact
// Sends the contact-form message via Resend to the store contacts.
// The Resend API key is NEVER in this file or in the frontend code.
// Set it in Cloudflare Pages > Settings > Environment variables:
//   RESEND_API_KEY = re_... (from the Resend dashboard)
// Optional overrides (same place):
//   CONTACT_FROM = hello@pegasusgeneralstore.co.nz  (after the domain is
//                  verified in Resend; until then leave the default
//                  onboarding@resend.dev — Resend only delivers test mail
//                  to the Resend account owner until a domain is verified)
//   CONTACT_TO   = comma-separated recipients, default below

const RECIPIENTS = ["shaipat01@gmail.com", "jim@jwmorentz.com"];
const DEFAULT_FROM = "onboarding@resend.dev";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function onRequestPost(context) {
  const { env } = context;

  if (!env.RESEND_API_KEY) {
    return Response.json(
      { error: "Email is not configured yet (RESEND_API_KEY is missing)." },
      { status: 500 },
    );
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name || "").trim().slice(0, 100);
  const email = String(body.email || "").trim().slice(0, 200);
  const subject = String(body.subject || "").trim().slice(0, 200);
  const message = String(body.message || "").trim().slice(0, 5000);

  if (!name || !email || !subject || !message || !email.includes("@")) {
    return Response.json(
      { error: "Please fill in your name, a valid email, subject and message." },
      { status: 400 },
    );
  }

  const to = (env.CONTACT_TO || "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  if (to.length === 0) to.push(...RECIPIENTS);

  const from = (env.CONTACT_FROM || DEFAULT_FROM).trim();

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Pegasus General Store <${from}>`,
      to,
      reply_to: email,
      subject: `Website contact: ${subject}`,
      html: `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><p><strong>Subject:</strong> ${escapeHtml(subject)}</p><p>${escapeHtml(message).replaceAll("\n", "<br>")}</p>`,
      text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
    }),
  });

  if (!resendResponse.ok) {
    const detail = await resendResponse.text();
    // Resend returns 403 while the sending domain is unverified:
    // "You can only send testing emails to your own email address."
    return Response.json(
      { error: "Could not send the message. Please try again later.", detail },
      { status: 502 },
    );
  }

  const data = await resendResponse.json();
  return Response.json({ ok: true, id: data.id || null });
}
