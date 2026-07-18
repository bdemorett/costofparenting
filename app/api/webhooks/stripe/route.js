import { NextResponse } from "next/server";
import {
  grantPremiumAccess,
  isPaidCheckoutSession,
} from "../../../utils/premium";
import { getStripeClient } from "../../../utils/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is not configured.");
    return NextResponse.json(
      { error: "Webhook is not configured." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event;

  try {
    const stripe = getStripeClient();
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe-webhook] Signature verification failed:", error);
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (!isPaidCheckoutSession(session)) {
        return NextResponse.json({ received: true, skipped: "unpaid" });
      }

      const userId = String(session.metadata?.userId || "").trim();
      if (!userId) {
        console.error("[stripe-webhook] Missing userId metadata on session", session.id);
        return NextResponse.json({ received: true, skipped: "missing-user" });
      }

      await grantPremiumAccess(userId, {
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id || null,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe-webhook] Handler failed:", error);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }
}
