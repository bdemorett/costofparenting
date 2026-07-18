"use client";

import { useState } from "react";

const TIMELINES = [
  "Within 30 days",
  "1–3 months",
  "3–6 months",
  "Just researching",
];

export default function AgentMatchForm() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      zip: String(formData.get("zip") || "").trim(),
      timeline: String(formData.get("timeline") || "").trim(),
    };

    try {
      const response = await fetch("/api/agent-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit your request.");
      }

      setStatus("success");
      form.reset();
    } catch (submitError) {
      setStatus("error");
      setError(submitError.message || "Unable to submit your request.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-center">
        <p className="text-lg font-semibold text-emerald-900">Request received</p>
        <p className="mt-2 text-sm leading-relaxed text-emerald-800">
          Thanks for your interest. Our team will follow up by email within 2 business
          days with agent-matching options for your target area.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
          Early access
        </p>
        <h3 className="mt-1 text-xl font-semibold">Request agent matching</h3>
        <p className="mt-2 text-sm text-slate-600">
          Tell us where you&apos;re headed. We&apos;ll connect you with a licensed agent
          who knows that market.
        </p>
      </div>
      <div>
        <label htmlFor="agent-name" className="mb-1.5 block text-sm font-medium text-slate-700">
          Full name
        </label>
        <input
          id="agent-name"
          type="text"
          name="name"
          required
          autoComplete="name"
          placeholder="Jane Smith"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>
      <div>
        <label htmlFor="agent-email" className="mb-1.5 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="agent-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="agent-zip" className="mb-1.5 block text-sm font-medium text-slate-700">
            Target zip code
          </label>
          <input
            id="agent-zip"
            type="text"
            name="zip"
            required
            inputMode="numeric"
            pattern="[0-9]{5}"
            maxLength={5}
            placeholder="78704"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div>
          <label htmlFor="agent-timeline" className="mb-1.5 block text-sm font-medium text-slate-700">
            Move timeline
          </label>
          <select
            id="agent-timeline"
            name="timeline"
            required
            defaultValue={TIMELINES[1]}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {TIMELINES.map((timeline) => (
              <option key={timeline} value={timeline}>
                {timeline}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-xl bg-emerald-600 py-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting..." : "Request Agent Match"}
      </button>
      <p className="text-center text-xs text-slate-500">
        By submitting, you agree to be contacted about agent matching. See our{" "}
        <a href="/privacy-policy" className="font-medium text-emerald-700 underline">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
