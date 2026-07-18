import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  grantPremiumAccess,
  isPaidCheckoutSession,
  sessionBelongsToUser,
} from "../../../utils/premium";
import { getStripeClient } from "../../../utils/stripe";

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const sessionId = String(body.sessionId || body.session_id || "").trim();
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!isPaidCheckoutSession(session)) {
      return NextResponse.json(
        { error: "Checkout session is not paid." },
        { status: 400 },
      );
    }

    if (!sessionBelongsToUser(session, userId)) {
      return NextResponse.json(
        { error: "Checkout session does not belong to this account." },
        { status: 403 },
      );
    }

    await grantPremiumAccess(userId, {
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id || null,
    });

    return NextResponse.json({ premium: true });
  } catch (error) {
    console.error("[premium/verify-session] Failed:", error);
    return NextResponse.json(
      { error: "Unable to verify checkout session." },
      { status: 500 },
    );
  }
}
