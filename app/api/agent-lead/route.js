import { NextResponse } from "next/server";
import { sendAgentLeadEmail } from "../../utils/email";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidZip(value) {
  return /^\d{5}$/.test(value);
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const zip = String(body.zip || "").trim();
  const timeline = String(body.timeline || "").trim();

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  if (!isValidZip(zip)) {
    return NextResponse.json({ error: "Please enter a 5-digit US zip code." }, { status: 400 });
  }

  if (!timeline) {
    return NextResponse.json({ error: "Please select a move timeline." }, { status: 400 });
  }

  const lead = {
    name,
    email,
    zip,
    timeline,
    submittedAt: new Date().toISOString(),
    source: "homepage-agent-form",
  };

  const webhookUrl = process.env.AGENT_LEAD_WEBHOOK_URL?.trim();
  const hasEmailConfig =
    Boolean(process.env.RESEND_API_KEY?.trim()) &&
    Boolean(process.env.AGENT_LEAD_NOTIFY_EMAIL?.trim());

  try {
    if (hasEmailConfig) {
      const result = await sendAgentLeadEmail(lead);
      if (!result.sent) {
        throw new Error("Email delivery is not configured.");
      }
    } else if (webhookUrl) {
      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook returned ${webhookResponse.status}`);
      }
    } else {
      console.info(
        "[agent-lead] New request (configure RESEND_API_KEY + AGENT_LEAD_NOTIFY_EMAIL):",
        lead,
      );

      if (process.env.VERCEL || process.env.NODE_ENV === "production") {
        return NextResponse.json(
          {
            error:
              "Agent matching is not fully configured yet. Please email support@beforeyoumovethere.com.",
          },
          { status: 503 },
        );
      }
    }
  } catch (error) {
    console.error("[agent-lead] Delivery failed:", error);
    return NextResponse.json(
      {
        error:
          "We could not save your request right now. Please email support@beforeyoumovethere.com.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
