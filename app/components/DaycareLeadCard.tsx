"use client";

import { useState } from "react";
import DaycareLeadModal from "@/app/components/DaycareLeadModal";

export interface DaycareLeadCardProps {
  cityName: string;
  stateName: string;
  calculatedMonthlyCost?: number;
}

/**
 * Client island: daycare openings CTA + zip/email modal.
 */
export default function DaycareLeadCard({
  cityName,
  stateName,
  calculatedMonthlyCost,
}: DaycareLeadCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <article className="flex h-full flex-col rounded-2xl border border-stone-200/60 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-800">
          Childcare leads
        </p>
        <h3 className="font-serif mt-2 text-xl font-semibold tracking-tight text-stone-900">
          Top-Rated Daycares in {cityName}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
          See which centers near you have openings and how local rates compare
          to the {cityName} baseline.
          {calculatedMonthlyCost != null && calculatedMonthlyCost > 0 ? (
            <>
              {" "}
              Your estimate is about{" "}
              <strong className="font-semibold text-stone-800">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(calculatedMonthlyCost)}
              </strong>
              /mo.
            </>
          ) : null}
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-teal-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800"
        >
          Check Openings &amp; Local Rates
        </button>
      </article>

      <DaycareLeadModal
        open={open}
        onClose={() => setOpen(false)}
        cityName={cityName}
        stateName={stateName}
        calculatedMonthlyCost={calculatedMonthlyCost}
      />
    </>
  );
}
