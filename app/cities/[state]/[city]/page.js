import { redirect } from "next/navigation";

export default async function CitiesCheckoutAliasPage({ params, searchParams }) {
  const { state, city } = await params;
  const resolvedSearchParams = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(resolvedSearchParams || {})) {
    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, entry));
    } else if (value != null) {
      query.set(key, value);
    }
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";
  redirect(`/move-to/${state}/${city}${suffix}`);
}
