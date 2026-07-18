"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function BriefPrintControls({ backHref }) {
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="print:hidden sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">
          Choose <strong>Save as PDF</strong> in the print dialog
        </p>
        <div className="flex gap-2">
          <Link
            href={backHref}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Back to report
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500"
          >
            Save as PDF / Print
          </button>
        </div>
      </div>
    </div>
  );
}
