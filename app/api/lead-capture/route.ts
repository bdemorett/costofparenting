import { NextResponse } from "next/server";
import type { LeadCaptureBudgetSummary } from "@/types/leadCapture";

export const dynamic = "force-dynamic";

function asString(value: unknown, max = 200): string {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseBudget(raw: unknown): LeadCaptureBudgetSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const breakdown = b.monthlyBreakdown;
  if (!breakdown || typeof breakdown !== "object") return null;
  const bd = breakdown as Record<string, unknown>;

  const monthlyTotal = Number(b.monthlyTotal);
  const annualTotal = Number(b.annualTotal);
  if (!Number.isFinite(monthlyTotal) || !Number.isFinite(annualTotal)) {
    return null;
  }

  return {
    cityName: asString(b.cityName, 80),
    stateName: asString(b.stateName, 40),
    stateSlug: asString(b.stateSlug, 20).toLowerCase(),
    citySlug: asString(b.citySlug, 80).toLowerCase(),
    cityPath: asString(b.cityPath, 160),
    childCount: Math.min(8, Math.max(1, Math.floor(Number(b.childCount) || 1))),
    ageCategory: asString(b.ageCategory, 40),
    ageCategoryLabel: asString(b.ageCategoryLabel, 40),
    careType: asString(b.careType, 40),
    careTypeLabel: asString(b.careTypeLabel, 60),
    monthlyTotal: Math.round(monthlyTotal),
    annualTotal: Math.round(annualTotal),
    monthlyBreakdown: {
      housing: Math.round(Number(bd.housing) || 0),
      food: Math.round(Number(bd.food) || 0),
      healthcare: Math.round(Number(bd.healthcare) || 0),
      childcare: Math.round(Number(bd.childcare) || 0),
      clothing: Math.round(Number(bd.clothing) || 0),
      education: Math.round(Number(bd.education) || 0),
    },
    tool: asString(b.tool, 60) || undefined,
    preparednessScore: Number.isFinite(Number(b.preparednessScore))
      ? Math.min(100, Math.max(1, Math.round(Number(b.preparednessScore))))
      : undefined,
    preparednessLabel: asString(b.preparednessLabel, 120) || undefined,
    year1Surplus: Number.isFinite(Number(b.year1Surplus))
      ? Math.round(Number(b.year1Surplus))
      : undefined,
    year1OneTimeTotal: Number.isFinite(Number(b.year1OneTimeTotal))
      ? Math.round(Number(b.year1OneTimeTotal))
      : undefined,
    year1RecurringTotal: Number.isFinite(Number(b.year1RecurringTotal))
      ? Math.round(Number(b.year1RecurringTotal))
      : undefined,
    wizardInputs: parseWizardInputs(b.wizardInputs),
  };
}

function parseWizardInputs(
  raw: unknown,
): LeadCaptureBudgetSummary["wizardInputs"] | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const w = raw as Record<string, unknown>;
  const num = (key: string) => {
    const n = Number(w[key]);
    return Number.isFinite(n) ? Math.round(n) : undefined;
  };
  return {
    annualGrossIncome: num("annualGrossIncome"),
    monthlySavings: num("monthlySavings"),
    paidLeaveWeeks: num("paidLeaveWeeks"),
    nurseryGear: num("nurseryGear"),
    stroller: num("stroller"),
    medicalOopMax: num("medicalOopMax"),
    initialSupplies: num("initialSupplies"),
  };
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildEmailHtml(
  name: string,
  budget: LeadCaptureBudgetSummary,
): string {
  const place = `${budget.cityName}, ${budget.stateName}`;
  const rows = Object.entries(budget.monthlyBreakdown)
    .map(
      ([key, value]) =>
        `<tr><td style="padding:6px 0;text-transform:capitalize">${key}</td><td style="padding:6px 0;text-align:right">${formatUsd(value)}</td></tr>`,
    )
    .join("");

  return `
    <div style="font-family:Georgia,serif;color:#292524;max-width:560px;margin:0 auto">
      <p style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#0f766e;font-weight:700">Cost of Parenting</p>
      <h1 style="font-size:28px;line-height:1.2;margin:8px 0 16px">Your ${place} family budget</h1>
      <p style="font-size:16px;line-height:1.6;color:#57534e">Hi ${name}, here is a snapshot of the estimate you built.</p>
      <p style="font-size:15px;line-height:1.6"><strong>${budget.childCount}</strong> child(ren) · <strong>${budget.ageCategoryLabel}</strong> · <strong>${budget.careTypeLabel}</strong></p>
      ${
        budget.preparednessScore != null
          ? `<p style="font-size:15px;line-height:1.6;margin:12px 0;padding:12px 14px;background:#f0fdfa;border-radius:8px"><strong>Financial preparedness score:</strong> ${budget.preparednessScore}/100 — ${budget.preparednessLabel || ""}</p>`
          : ""
      }
      <p style="font-size:32px;margin:20px 0 4px;font-weight:700">${formatUsd(budget.monthlyTotal)}<span style="font-size:16px;font-weight:500;color:#78716c"> / month</span></p>
      <p style="font-size:16px;color:#57534e;margin:0 0 20px">${formatUsd(budget.annualTotal)} / year</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
      <p style="margin-top:24px;font-size:14px"><a href="https://costofparenting.com${budget.cityPath}" style="color:#0f766e">Open the full ${place} guide →</a></p>
    </div>
  `;
}

async function deliverLead(payload: {
  name: string;
  email: string;
  targetMoveDate: string | null;
  budget: LeadCaptureBudgetSummary;
  summary: Record<string, unknown>;
}): Promise<{ webhook: boolean; email: boolean }> {
  let webhook = false;
  let email = false;

  const webhookUrl = process.env.LEAD_CAPTURE_WEBHOOK_URL?.trim();
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "costofparenting.budget_export",
          ...payload,
          receivedAt: new Date().toISOString(),
        }),
      });
      webhook = res.ok;
      if (!res.ok) {
        console.error("[lead-capture] webhook failed", res.status);
      }
    } catch (error) {
      console.error("[lead-capture] webhook error", error);
    }
  }

  const resendKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.LEAD_CAPTURE_FROM_EMAIL?.trim() ||
    "Cost of Parenting <onboarding@resend.dev>";

  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [payload.email],
          subject: `Your ${payload.budget.cityName} family budget breakdown`,
          html: buildEmailHtml(payload.name, payload.budget),
        }),
      });
      email = res.ok;
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("[lead-capture] Resend failed", res.status, text);
      }
    } catch (error) {
      console.error("[lead-capture] Resend error", error);
    }
  }

  // Always accept the lead when validation passes — delivery is best-effort.
  if (!webhookUrl && !resendKey) {
    console.info("[lead-capture] stored (no webhook/email configured)", {
      email: payload.email,
      city: payload.budget.citySlug,
      monthlyTotal: payload.budget.monthlyTotal,
    });
  }

  return { webhook, email };
}

/**
 * Captures budget-export leads and returns a PDF/email-ready summary payload.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const record = (body ?? {}) as Record<string, unknown>;
  const name = asString(record.name, 100);
  const email = asString(record.email, 200).toLowerCase();
  const targetMoveDate = asString(record.targetMoveDate, 40) || null;
  const budget = parseBudget(record.budget);

  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }
  if (!budget?.citySlug || !budget.cityName) {
    return NextResponse.json(
      { error: "Missing budget estimate context." },
      { status: 400 },
    );
  }

  const summary = {
    lead: {
      name,
      email,
      targetMoveDate,
    },
    location: {
      cityName: budget.cityName,
      stateName: budget.stateName,
      stateSlug: budget.stateSlug,
      citySlug: budget.citySlug,
      path: budget.cityPath,
    },
    household: {
      childCount: budget.childCount,
      ageCategory: budget.ageCategory,
      ageCategoryLabel: budget.ageCategoryLabel,
      careType: budget.careType,
      careTypeLabel: budget.careTypeLabel,
    },
    totals: {
      monthly: budget.monthlyTotal,
      annual: budget.annualTotal,
      currency: "USD",
    },
    monthlyBreakdown: budget.monthlyBreakdown,
    preparedness:
      budget.preparednessScore != null
        ? {
            score: budget.preparednessScore,
            label: budget.preparednessLabel,
            year1Surplus: budget.year1Surplus,
            year1OneTimeTotal: budget.year1OneTimeTotal,
            year1RecurringTotal: budget.year1RecurringTotal,
            tool: budget.tool,
            wizardInputs: budget.wizardInputs,
          }
        : undefined,
    export: {
      formatHints: ["pdf", "email"],
      headline: `Family budget for ${budget.cityName}, ${budget.stateName}`,
      generatedAt: new Date().toISOString(),
    },
  };

  const delivery = await deliverLead({
    name,
    email,
    targetMoveDate,
    budget,
    summary,
  });

  return NextResponse.json({
    ok: true,
    message:
      "Check your inbox! Your custom budget breakdown is on its way.",
    delivery,
    summary,
  });
}
