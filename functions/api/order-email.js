// Cloudflare Pages Function: POST /api/order-email
// Sends Click & Collect order emails via Resend.
//   { type: 'order-placed', order: {...} }
//     -> confirmation to the customer (if they gave an email) AND a
//        notification to the store (shaipat01@gmail.com, jim@jwmorentz.com)
//   { type: 'status-changed', order: {...} }
//     -> status update to the customer only (if they gave an email)
// The Resend API key is NEVER in this file or in the frontend code.
// Set it in Cloudflare Pages > Settings > Environment variables:
//   RESEND_API_KEY = the Resend API key
//   CONTACT_FROM   = hello@pegasusgeneralstore.co.nz (verified domain)

const STORE_RECIPIENTS = ["shaipat01@gmail.com", "jim@jwmorentz.com"];
const DEFAULT_FROM = "onboarding@resend.dev";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function pickupReference(order) {
  const code = order.short_reference ? `PGS-${order.short_reference}` : "PGS";
  const date = order.collection_date
    ? new Date(`${order.collection_date}T12:00:00`).toLocaleDateString("en-NZ", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "";
  const parts = [date, order.collection_time].filter(Boolean).join(" · ");
  return parts ? `${code} — pickup ${parts}` : code;
}

function orderSummaryHtml(order) {
  return `<p><strong>Reference:</strong> ${escapeHtml(pickupReference(order))}</p>`
    + `<p><strong>Name:</strong> ${escapeHtml(order.customer_name || "")}</p>`
    + (order.phone ? `<p><strong>Phone:</strong> ${escapeHtml(order.phone)}</p>` : "")
    + (order.items ? `<p><strong>Items:</strong> ${escapeHtml(order.items)}</p>` : "")
    + `<p><strong>Total (pay at counter):</strong> $${Number(order.total || 0).toFixed(2)}</p>`
    + (order.notes ? `<p><strong>Notes:</strong> ${escapeHtml(order.notes)}</p>` : "");
}

function orderSummaryText(order) {
  return [
    `Reference: ${pickupReference(order)}`,
    `Name: ${order.customer_name || ""}`,
    order.phone ? `Phone: ${order.phone}` : "",
    order.items ? `Items: ${order.items}` : "",
    `Total (pay at counter): $${Number(order.total || 0).toFixed(2)}`,
    order.notes ? `Notes: ${order.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

const STATUS_MESSAGES = {
  confirmed: {
    subject: (ref) => `Your Pegasus order is confirmed — ${ref}`,
    heading: "Your order is confirmed.",
    body: "We've confirmed your Click & Collect order. We'll let you know when it's ready for collection.",
  },
  ready: {
    subject: (ref) => `Your Pegasus order is ready for collection — ${ref}`,
    heading: "Your order is ready for collection.",
    body: "Your Click & Collect order is ready. Please bring your reference below when you come to 60 Pegasus Main Street, and pay at the counter.",
  },
  collected: {
    subject: (ref) => `Thanks for collecting your Pegasus order — ${ref}`,
    heading: "Thanks for collecting your order.",
    body: "Thanks for shopping at Pegasus General Store — we hope to see you again soon.",
  },
  cancelled: {
    subject: (ref) => `Your Pegasus order has been cancelled — ${ref}`,
    heading: "Your order has been cancelled.",
    body: "Your Click & Collect order has been cancelled. If this wasn't expected, please call us on +64 3 312 6699.",
  },
  pending: {
    subject: (ref) => `Your Pegasus order is received — ${ref}`,
    heading: "We've received your order.",
    body: "We've received your Click & Collect order and will confirm it shortly.",
  },
};

async function sendEmail(apiKey, from, { to, subject, html, text, replyTo }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Pegasus General Store <${from}>`,
      to,
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      html,
      text,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend ${response.status}: ${detail}`);
  }
  const data = await response.json();
  return data.id || null;
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

  const type = body.type;
  const order = body.order || {};
  if (type !== "order-placed" && type !== "status-changed") {
    return Response.json({ error: "Unknown email type." }, { status: 400 });
  }
  if (!order.customer_name || !order.short_reference) {
    return Response.json({ error: "Order details are missing." }, { status: 400 });
  }

  const from = (env.CONTACT_FROM || DEFAULT_FROM).trim();
  const ref = pickupReference(order);
  const customerEmail = String(order.email || "").trim();
  const ids = [];

  try {
    if (type === "order-placed") {
      // 1) Confirmation to the customer, if they gave an email.
      if (customerEmail.includes("@")) {
        ids.push(
          await sendEmail(env.RESEND_API_KEY, from, {
            to: [customerEmail],
            subject: `Your Pegasus Click & Collect order — ${ref}`,
            html: `<p>Kia ora ${escapeHtml(order.customer_name)},</p><p>Thanks for your Click &amp; Collect order. Please bring your reference when you collect, and pay at the counter.</p>${orderSummaryHtml(order)}<p>Pegasus General Store, 60 Pegasus Main Street, Pegasus — +64 3 312 6699</p>`,
            text: `Kia ora ${order.customer_name},\n\nThanks for your Click & Collect order. Please bring your reference when you collect, and pay at the counter.\n\n${orderSummaryText(order)}\n\nPegasus General Store, 60 Pegasus Main Street, Pegasus — +64 3 312 6699`,
          }),
        );
      }
      // 2) Notification to the store, always.
      ids.push(
        await sendEmail(env.RESEND_API_KEY, from, {
          to: STORE_RECIPIENTS,
          ...(customerEmail.includes("@") ? { replyTo: customerEmail } : {}),
          subject: `New Click & Collect order ${ref} — ${order.customer_name}, $${Number(order.total || 0).toFixed(2)}`,
          html: `<p>A new Click &amp; Collect order was placed on the website.</p>${orderSummaryHtml(order)}${customerEmail ? `<p><strong>Customer email:</strong> ${escapeHtml(customerEmail)}</p>` : "<p><strong>Customer email:</strong> not given</p>"}`,
          text: `A new Click & Collect order was placed on the website.\n\n${orderSummaryText(order)}\nCustomer email: ${customerEmail || "not given"}`,
        }),
      );
      return Response.json({ ok: true, ids, emailedCustomer: customerEmail.includes("@") });
    }

    // status-changed: customer only, and only if they gave an email.
    if (!customerEmail.includes("@")) {
      return Response.json({ ok: true, emailedCustomer: false, reason: "No customer email on this order." });
    }
    const message = STATUS_MESSAGES[order.status] || STATUS_MESSAGES.pending;
    ids.push(
      await sendEmail(env.RESEND_API_KEY, from, {
        to: [customerEmail],
        subject: message.subject(ref),
        html: `<p>Kia ora ${escapeHtml(order.customer_name)},</p><p>${escapeHtml(message.heading)} ${escapeHtml(message.body)}</p>${orderSummaryHtml(order)}<p>Pegasus General Store, 60 Pegasus Main Street, Pegasus — +64 3 312 6699</p>`,
        text: `Kia ora ${order.customer_name},\n\n${message.heading} ${message.body}\n\n${orderSummaryText(order)}\n\nPegasus General Store, 60 Pegasus Main Street, Pegasus — +64 3 312 6699`,
      }),
    );
    return Response.json({ ok: true, ids, emailedCustomer: true });
  } catch (error) {
    return Response.json(
      { error: "Could not send the order email.", detail: error.message },
      { status: 502 },
    );
  }
}
