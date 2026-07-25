/**
 * Safely serialize JSON-LD for a native <script> tag.
 * Escapes `<` as `\u003c` so payloads cannot break out of the script element (XSS).
 * @see https://nextjs.org/docs/app/guides/json-ld
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export interface JsonLdProps {
  /** One schema object, an array of schemas, or a `@graph` document. */
  data: unknown;
}

/**
 * Server Component that emits a native application/ld+json script tag.
 * Prefer this over `next/script` — JSON-LD is data, not executable JS.
 */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
