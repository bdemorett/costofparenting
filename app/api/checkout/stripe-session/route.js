import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSiteUrl } from "../../../utils/siteUrl";
import { getStripeClient } from "../../../utils/stripe";

function normalizeCityContext(value) {
  return String(value || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  if (!userEmail) {
    return NextResponse.json(
      { error: "A verified email is required before checkout." },
      { status: 400 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const cityContext = normalizeCityContext(body.cityContext || body.cityId) || "general";

  const siteUrl = getSiteUrl(request);
  const isReportCheckout =
    cityContext !== "general" && cityContext.includes("/");

  const successUrl = isReportCheckout
    ? `${siteUrl}/move-to/${cityContext}?success=true&session_id={CHECKOUT_SESSION_ID}`
    : `${siteUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = isReportCheckout
    ? `${siteUrl}/move-to/${cityContext}`
    : `${siteUrl}/pricing`;

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: userEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: 2900,
            product_data: {
              name: "Before You Move There - Lifetime Premium Access Pass",
              description: "One-time lifetime premium access to neighborhood intelligence",
            },
          },
        },
      ],
      metadata: {
        userId,
        userEmail,
        cityContext,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error("[stripe-session] Stripe session error:", error);
    return NextResponse.json(
      { error: "Unable to start checkout. Please try again." },
      { status: 500 },
    );
  }
}
