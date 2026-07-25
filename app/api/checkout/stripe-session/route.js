import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { buildCheckoutScenario } from "../../../utils/checkoutScenario";
import { getSiteUrl } from "../../../utils/siteUrl";
import { getStripeClient } from "../../../utils/stripe";

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

  const scenario = buildCheckoutScenario(body);
  const siteUrl = getSiteUrl(request);

  // PDF / calculator checkouts always land on success with a summary.
  // Generic pricing CTAs also use the success page.
  const successUrl = `${siteUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = scenario.hasCityPath
    ? `${siteUrl}/cost-of-parenting/${scenario.cityContext}`
    : `${siteUrl}/pricing`;

  const productName =
    scenario.intent === "pdf_report"
      ? "Cost of Parenting — Detailed PDF Budget Report + Lifetime Premium"
      : "Cost of Parenting - Lifetime Premium Access Pass";

  const productDescription =
    scenario.intent === "pdf_report"
      ? `Lifetime premium access plus a detailed budget report for ${scenario.metadata.cityLabel || "your city"}`
      : "One-time lifetime premium access to localized parenting cost forecasts";

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
              name: productName,
              description: productDescription,
            },
          },
        },
      ],
      metadata: {
        userId,
        userEmail,
        ...scenario.metadata,
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

    return NextResponse.json(
      { url: session.url, sessionId: session.id },
      { status: 200 },
    );
  } catch (error) {
    console.error("[stripe-session] Stripe session error:", error);
    return NextResponse.json(
      { error: "Unable to start checkout. Please try again." },
      { status: 500 },
    );
  }
}
