import Link from "next/link";

export interface BreadcrumbsProps {
  stateName: string;
  stateSlug: string;
  cityName: string;
  citySlug: string;
}

/**
 * Semantic breadcrumb trail for programmatic city cost pages.
 * Home → State → City (all internal Next.js links).
 */
export default function Breadcrumbs({
  stateName,
  stateSlug,
  cityName,
  citySlug,
}: BreadcrumbsProps) {
  const stateHref = `/cost-of-parenting/${stateSlug}`;
  const cityHref = `/cost-of-parenting/${stateSlug}/${citySlug}`;

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-stone-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-teal-800">
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href={stateHref} className="hover:text-teal-800">
            {stateName}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link
            href={cityHref}
            className="font-medium text-stone-700 hover:text-teal-800"
            aria-current="page"
          >
            {cityName}
          </Link>
        </li>
      </ol>
    </nav>
  );
}
