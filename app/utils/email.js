function getResendFromEmail() {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Before You Move There <onboarding@resend.dev>"
  );
}

function formatAgentLeadText(lead) {
  return [
    "New agent matching request",
    "",
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Target zip: ${lead.zip}`,
    `Timeline: ${lead.timeline}`,
    `Submitted: ${lead.submittedAt}`,
    `Source: ${lead.source}`,
  ].join("\n");
}

function formatAgentLeadHtml(lead) {
  return `
    <h2>New agent matching request</h2>
    <p><strong>Name:</strong> ${lead.name}</p>
    <p><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></p>
    <p><strong>Target zip:</strong> ${lead.zip}</p>
    <p><strong>Timeline:</strong> ${lead.timeline}</p>
    <p><strong>Submitted:</strong> ${lead.submittedAt}</p>
  `.trim();
}

export async function sendAgentLeadEmail(lead) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.AGENT_LEAD_NOTIFY_EMAIL?.trim();

  if (!apiKey || !to) {
    return { sent: false, reason: "missing_config" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getResendFromEmail(),
      to: [to],
      reply_to: lead.email,
      subject: `Agent lead: ${lead.name} (${lead.zip})`,
      text: formatAgentLeadText(lead),
      html: formatAgentLeadHtml(lead),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend error ${response.status}: ${errorBody}`);
  }

  return { sent: true };
}
