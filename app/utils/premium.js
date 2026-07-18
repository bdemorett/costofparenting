import { clerkClient } from "@clerk/nextjs/server";

export const PREMIUM_PRODUCT = "lifetime_premium_pass";

export function hasPremiumAccess(user) {
  if (!user) return false;

  const premium = user.publicMetadata?.premium;
  if (premium === true) return true;
  if (premium && typeof premium === "object" && premium.active === true) {
    return true;
  }

  return false;
}

export async function grantPremiumAccess(userId, details = {}) {
  if (!userId) {
    throw new Error("userId is required to grant premium access.");
  }

  const client = await clerkClient();
  const existing = await client.users.getUser(userId);
  const currentPremium =
    existing.publicMetadata?.premium &&
    typeof existing.publicMetadata.premium === "object"
      ? existing.publicMetadata.premium
      : {};

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      premium: {
        ...currentPremium,
        active: true,
        product: PREMIUM_PRODUCT,
        purchasedAt: details.purchasedAt || new Date().toISOString(),
        stripeSessionId: details.stripeSessionId || currentPremium.stripeSessionId || null,
        stripePaymentIntentId:
          details.stripePaymentIntentId ||
          currentPremium.stripePaymentIntentId ||
          null,
      },
    },
  });
}

export function isPaidCheckoutSession(session) {
  return (
    session?.payment_status === "paid" &&
    (session?.status === "complete" || session?.status === "paid")
  );
}

export function sessionBelongsToUser(session, userId) {
  return String(session?.metadata?.userId || "") === String(userId || "");
}
