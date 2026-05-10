"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormState, ToolName } from "@/lib/types";
import { runAudit, AuditResult } from "@/lib/auditEngine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FLAG_STYLES: Record<string, string> = {
  overpaying: "bg-red-500/10 text-red-400 border-red-500/20",
  redundant: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  credits: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  optimal: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const FLAG_LABELS: Record<string, string> = {
  overpaying: "Overpaying",
  redundant: "Redundant",
  credits: "Credits Opportunity",
  optimal: "Optimal",
};

export default function AuditPage() {
  const router = useRouter();
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Email capture state
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("credex-audit-form");
    if (!saved) {
      router.push("/");
      return;
    }
    const parsedForm: FormState = JSON.parse(saved);
    setForm(parsedForm);
    const result = runAudit(parsedForm);
    setAudit(result);

    // Fetch AI summary
    fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: result.summary,
        totalMonthlySavings: result.totalMonthlySavings,
        totalAnnualSavings: result.totalAnnualSavings,
        useCase: parsedForm.useCase,
        teamSize: parsedForm.teamSize,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setAiSummary(data.summary || result.summary);
      })
      .catch(() => {
        setAudit((prev) => prev);
      })
      .finally(() => setSummaryLoading(false));
  }, [router]);

  const handleEmailSubmit = async () => {
    if (!email || !audit || !form) return;
    setSubmitting(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          companyName,
          role,
          website, // honeypot
          teamSize: form.teamSize,
          toolsData: form.tools,
          monthlySavings: audit.totalMonthlySavings,
          annualSavings: audit.totalAnnualSavings,
          useCase: form.useCase,
        }),
      });
      setSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!audit) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-8 text-center">
        <p className="text-slate-400 text-sm mb-2 uppercase tracking-widest">
          Your AI Spend Audit
        </p>
        <h1 className="text-4xl font-bold tracking-tight">
          You could save{" "}
          <span className="text-emerald-400">
            ${audit.totalMonthlySavings.toFixed(0)}/mo
          </span>
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          That's{" "}
          <span className="text-white font-semibold">
            ${audit.totalAnnualSavings.toFixed(0)}/year
          </span>{" "}
          back in your budget
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {/* AI Summary */}
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="pt-5">
            {summaryLoading ? (
              <div className="text-slate-500 text-sm animate-pulse">
                Generating personalized summary...
              </div>
            ) : (
              <p className="text-slate-300 text-sm leading-relaxed">
                {aiSummary || audit.summary}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Per-tool breakdown */}
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            Tool Breakdown
          </h2>
          {audit.results.map((r) => (
            <Card key={r.tool} className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-base">
                    {r.toolLabel}
                  </CardTitle>
                  <Badge className={`text-xs border ${FLAG_STYLES[r.flag]}`}>
                    {FLAG_LABELS[r.flag]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Current Spend</p>
                    <p className="text-white font-medium">
                      ${r.currentSpend}/mo
                    </p>
                  </div>
                  {r.estimatedSavings > 0 && (
                    <div>
                      <p className="text-slate-500 text-xs">Potential Saving</p>
                      <p className="text-emerald-400 font-medium">
                        -${r.estimatedSavings.toFixed(0)}/mo
                      </p>
                    </div>
                  )}
                </div>
                <div className="bg-slate-800 rounded-md p-3">
                  <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">
                    Recommendation
                  </p>
                  <p className="text-sm text-white">{r.recommendedAction}</p>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {r.reason}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Credex CTA */}
        {audit.showCredex && (
          <Card className="bg-emerald-950 border-emerald-800">
            <CardContent className="pt-6 text-center space-y-3">
              <p className="text-emerald-300 font-semibold text-lg">
                You qualify for Credex discounted credits
              </p>
              <p className="text-emerald-400/80 text-sm">
                Credex sources discounted AI infrastructure credits from
                companies that overforecast. With $
                {audit.totalMonthlySavings.toFixed(0)}/mo in identified
                overspend, you could save even more through credits.
              </p>
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">
                Book a Credex Consultation →
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Optimal spend */}
        {audit.totalMonthlySavings === 0 && (
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="pt-6 text-center space-y-2">
              <p className="text-emerald-400 font-semibold">
                You're spending well ✓
              </p>
              <p className="text-slate-400 text-sm">
                No major savings opportunities found right now.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Email capture */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-base">
              {audit.totalMonthlySavings > 0
                ? "Get your full report by email"
                : "Get notified when optimizations apply to your stack"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <p className="text-emerald-400 text-sm">
                ✓ Report sent! Check your inbox.
              </p>
            ) : (
              <div className="space-y-3">
                {/* Honeypot - hidden from real users */}
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  style={{ display: "none" }}
                  tabIndex={-1}
                  autoComplete="off"
                />
                <div className="space-y-1">
                  <Label className="text-slate-400 text-xs">
                    Email *
                  </Label>
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-slate-400 text-xs">
                      Company (optional)
                    </Label>
                    <Input
                      placeholder="Acme Inc."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-400 text-xs">
                      Role (optional)
                    </Label>
                    <Input
                      placeholder="Engineering Manager"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleEmailSubmit}
                  disabled={!email || submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  {submitting ? "Sending..." : "Send my report →"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <button
          onClick={() => router.push("/")}
          className="text-slate-500 text-sm hover:text-slate-300 transition-colors"
        >
          ← Edit my tools
        </button>
      </div>
    </main>
  );
}