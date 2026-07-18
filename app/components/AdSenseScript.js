import Script from "next/script";
import { getAdSenseClientId } from "../utils/adsense";

export default function AdSenseScript() {
  const clientId = getAdSenseClientId();
  if (!clientId) return null;

  return (
    <Script
      id="adsense-loader"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
