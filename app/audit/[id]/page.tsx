import { Metadata } from "next";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import { runAudit } from "@/lib/auditEngine";
import { FormState } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { data } = await supabase
    .from("audits")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!data) return { title: "AI Spend Audit" };

  return {
    title: `AI Spend Audit — Save $${data.monthly_savings}/mo`,
    description: `This team could save $${data.monthly_savings}/month ($${data.annual_savings}/year) on AI tools.`,
    openGraph: {
      title: `AI Spend Audit — Save $${data.monthly_savings}/mo`,
      description: `This team could save $${data.monthly_savings}/month on AI tools. Run your free audit at Credex.`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `AI Spend Audit — Save $${data.monthly_savings}/mo`,
      description: `This team could save $${data.monthly_savings}/month on AI tools.`,
    },
  };
}

export default async function SharedAuditPage({
  params,
}: {
  params: { id: string };
}) {
  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">Audit not found.</p>
      </main>
    );
  }

  const form: FormState = {
    tools: data.tools_data,
    teamSize: data.team_size,
    useCase: data.use_case,
  };

  const audit = runAudit(form);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-8 text-center">
        <p className="text-slate-400 text-sm mb-2 uppercase tracking-widest">
          Shared AI Spend Audit
        </p>
        <h1 className="text-4xl font-bold tracking-tight">
          This team could save{" "}
          <span className="text-emerald-400">
            ${audit.totalMonthlySavings.toFixed(0)}/mo
          </span>
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          That&apos;s{" "}
          <span className="text-white font-semibold">
            ${audit.totalAnnualSavings.toFixed(0)}/year
          </span>{" "}
          back in their budget
        </p>
        <p className="text-slate-500 text-xs mt-4">
          No personal information shown. Run your own free audit below.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {/* Tool breakdown */}
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
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-white font-semibold">
              Run your own free AI spend audit
            </p>
            <p className="text-slate-400 text-sm">
              No login required. Takes 2 minutes.
            </p>
            
            <Link
              href="/"
              className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2 rounded-md transition-colors"
            >
              Audit my AI spend →
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}