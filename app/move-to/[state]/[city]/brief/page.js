import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getNeighborhoodData } from "../../../../utils/api";
import { resolveSchoolGrade } from "../../../../utils/schoolGrade";
import BriefPrintControls from "../../../../components/BriefPrintControls";
import { hasPremiumAccess } from "../../../../utils/premium";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function deslugifyCity(segment) {
  return decodeURIComponent(segment || "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function normalizeState(segment) {
  return decodeURIComponent(segment || "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function BriefSection({ title, children }) {
  return (
    <section className="mb-8 break-inside-avoid">
      <h2 className="border-b border-slate-300 pb-2 text-sm font-bold uppercase tracking-widest text-slate-800">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function BriefRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-2 text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  );
}

export default async function NeighborhoodBriefPage({ params }) {
  const { state, city } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect(
      `/sign-in?redirect_url=${encodeURIComponent(`/move-to/${state}/${city}/brief`)}`,
    );
  }

  const user = await currentUser();
  if (!hasPremiumAccess(user)) {
    redirect(`/move-to/${state}/${city}`);
  }

  const cleanCity = deslugifyCity(city);
  const cleanState = normalizeState(state);
  const report = await getNeighborhoodData(`${cleanCity}, ${cleanState}`);

  const {
    location,
    safety,
    schools,
    schoolsList,
    noise,
    premium,
  } = report;

  const backHref = `/move-to/${state}/${city}`;
  const generatedOn = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const annualTax = Math.round(
    (premium.medianHome * parseFloat(String(premium.propertyTax))) / 100
  );
  const schoolGrade = resolveSchoolGrade(schools);

  return (
    <div className="min-h-screen bg-white text-slate-900 print:min-h-0">
      <BriefPrintControls backHref={backHref} />

      <main className="mx-auto max-w-3xl px-8 py-10 print:px-0 print:py-0">
        <header className="mb-10 border-b-2 border-emerald-600 pb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Before You Move There · Premium Brief
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Comprehensive Neighborhood Brief
          </h1>
          <p className="mt-2 text-xl font-semibold text-slate-700">{location}</p>
          <p className="mt-1 text-sm text-slate-500">Generated {generatedOn}</p>
        </header>

        <BriefSection title="Executive Summary">
          <p className="text-sm leading-relaxed text-slate-700">
            This agent-ready relocation brief summarizes verified neighborhood intelligence
            for {location}, including safety indices, zoned school performance, financial
            carrying costs, environmental hazard exposure, and mobility context.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <p className="text-xs uppercase text-slate-500">Safety</p>
              <p className="mt-1 text-2xl font-bold">{safety.score}/100</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <p className="text-xs uppercase text-slate-500">Schools</p>
              <p className="mt-1 text-2xl font-bold">{schoolGrade}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <p className="text-xs uppercase text-slate-500">Median home</p>
              <p className="mt-1 text-2xl font-bold">
                ${premium.medianHome.toLocaleString()}
              </p>
            </div>
          </div>
        </BriefSection>

        <BriefSection title="Safety & Crime">
          <BriefRow label="Overall score" value={`${safety.score}/100 — ${safety.label}`} />
          <BriefRow label="Trend" value={safety.trend} />
          {safety.stats?.map((stat) => (
            <BriefRow key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </BriefSection>

        <BriefSection title="School & Family">
          <BriefRow label="District profile" value={schools.label} />
          <BriefRow label="District grade" value={schoolGrade} />
          <BriefRow label="Trend" value={schools.trend} />
          {schoolsList?.elementary && (
            <BriefRow
              label="Elementary"
              value={`${schoolsList.elementary.score}/10 — ${schoolsList.elementary.name}`}
            />
          )}
          {schoolsList?.middle && (
            <BriefRow
              label="Middle school"
              value={`${schoolsList.middle.score}/10 — ${schoolsList.middle.name}`}
            />
          )}
          {schoolsList?.high && (
            <BriefRow
              label="High school"
              value={`${schoolsList.high.score}/10 — ${schoolsList.high.name}`}
            />
          )}
        </BriefSection>

        <BriefSection title="Financial Intelligence">
          <BriefRow
            label="Median home price"
            value={`$${premium.medianHome.toLocaleString()}`}
          />
          <BriefRow
            label="Median rent"
            value={`$${premium.medianRent.toLocaleString()}/mo`}
          />
          <BriefRow label="5-year appreciation" value={`+${premium.appreciation}%`} />
          <BriefRow label="Property tax rate" value={`${premium.propertyTax}%`} />
          <BriefRow label="Est. annual property tax" value={`$${annualTax.toLocaleString()}`} />
          <BriefRow
            label="Insurance estimate"
            value={`$${premium.insuranceEst.toLocaleString()}/yr`}
          />
          <BriefRow label="Avg. HOA" value={`$${premium.hoaAvg}/mo`} />
          <BriefRow label="Days on market" value={`${premium.daysOnMarket} days`} />
        </BriefSection>

        <BriefSection title="Climate & Hazard Risk">
          <BriefRow label="Environmental profile" value={noise.label} />
          {noise.stats?.map((stat) => (
            <BriefRow key={stat.label} label={stat.label} value={stat.value} />
          ))}
          <BriefRow label="Insurance note" value={premium.changes?.insuranceEst ?? "—"} />
        </BriefSection>

        <BriefSection title="Mobility & Environment">
          <BriefRow label="Noise / environment" value={noise.score} />
          <BriefRow label="Noise trend" value={noise.trend} />
          {noise.stats?.slice(0, 2).map((stat) => (
            <BriefRow key={`mobility-${stat.label}`} label={stat.label} value={stat.value} />
          ))}
        </BriefSection>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-xs text-slate-500">
          <p>
            Prepared by Before You Move There · For informational purposes only · Not a
            formal appraisal, inspection, or lending document.
          </p>
          <p className="mt-2 print:hidden">
            <Link href={backHref} className="text-emerald-700 underline">
              Return to interactive report
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
