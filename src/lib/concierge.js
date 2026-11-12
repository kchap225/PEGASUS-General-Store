const STORE = {
  name: "Pegasus General Store",
  address: "60 Pegasus Main Street, Pegasus 7612, New Zealand",
  phone: "+64 3 312 6699",
  email: "hello@pegasusgeneralstore.co.nz",
  hours: "Monday–Saturday: 7 AM–8 PM; Sunday: 8 AM–6 PM",
};

export function getConciergeResponse(message) {
  const question = message.toLowerCase().trim();

  if (!question) {
    return "Please type a question so I can help you.";
  }

if (
  (question.includes("open") ||
    question.includes("hour") ||
    question.includes("timing")) &&
  (question.includes("where") ||
    question.includes("located") ||
    question.includes("location") ||
    question.includes("address"))
) {
  return `Our opening hours are ${STORE.hours}. You can find us at ${STORE.address}.`;
}

if (
  question.includes("hour") ||
  question.includes("open") ||
  question.includes("close") ||
  question.includes("timing")
) {
  return `Our opening hours are ${STORE.hours}.`;
}


  if (
    question.includes("where") ||
    question.includes("location") ||
    question.includes("address") ||
    question.includes("directions")
  ) {
    return `You can find us at ${STORE.address}.`;
  }

  if (
    question.includes("contact") ||
    question.includes("phone") ||
    question.includes("email") ||
    question.includes("call")
  ) {
    return `You can contact us at ${STORE.phone} or ${STORE.email}.`;
  }

  if (
    question.includes("click and collect") ||
    question.includes("click & collect") ||
    question.includes("pickup") ||
    question.includes("pre-order")
  ) {
    return "You can browse our products, select what you'd like, and choose a collection date and time through Click & Collect. Payment is made at the counter when you pick up your order.";
  }

  if (
    question.includes("hello") ||
    question.includes("hi") ||
    question.includes("hey")
  ) {
    return "Kia ora! Welcome to Pegasus General Store. I can help with our opening hours, location, contact details, and Click & Collect.";
  }

  return "I can currently help with store hours, location, contact details, and Click & Collect. More shopping assistance features are coming soon!";
}




