export function getAdSenseClientId() {
  return process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || "";
}

/** Server/runtime env lookup — used by ads.txt so it works after Vercel env changes. */
export function getAdSenseClientIdFromServerEnv() {
  return (
    process.env.ADSENSE_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() ||
    ""
  );
}

export function getAdSenseSlots() {
  return {
    leaderboard: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD?.trim() || "",
    infeed: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED?.trim() || "",
  };
}

export function getAdSensePublisherId(clientId = getAdSenseClientId()) {
  if (!clientId) return "";

  if (clientId.startsWith("ca-pub-")) {
    return clientId.replace("ca-pub-", "pub-");
  }

  if (clientId.startsWith("pub-")) {
    return clientId;
  }

  return `pub-${clientId}`;
}

export function isAdSenseConfigured() {
  return Boolean(getAdSenseClientId());
}

export function isAdSenseUnitReady(slot) {
  return Boolean(getAdSenseClientId() && slot);
}
