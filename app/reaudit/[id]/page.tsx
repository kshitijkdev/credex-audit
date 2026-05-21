import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { runAudit } from "@/lib/auditEngine";
import { OFFICIAL_PRICING } from "@/lib/pricingData";
import { ToolAuditResult } from "@/lib/auditEngine";

const FLAG_COLORS: Record<string, string> = {
  overpaying: "text-red-400",
  redundant: "text-orange-400",
  credits: "text-blue-400",
  optimal: "text-green-400",
};

const FLAG_BG: Record<string, string> = {
  overpaying: "bg-red-900/20 border-red-800",
  redundant: "bg-orange-900/20 border-orange-800",
  credits: "bg-blue-900/20 border-blue-800",
  optimal: "bg-green-900/20 border-green-800",
};

export default async function ReauditPage({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: audit, error } = await supabase
    .from("audits")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !audit) notFound();

  const oldResult = audit.output_result;
  const formState = { tools: audit.tools_data, useCase: audit.use_case, teamSize: audit.team_size };
  const newResult = runAudit(formState, OFFICIAL_PRICING);
  const savingsDelta = newResult.totalMonthlySavings - (oldResult?.totalMonthlySavings ?? 0);

  const changedTools = newResult.results.filter((newTool) => {
    const oldTool = oldResult?.results?.find((o: ToolAuditResult) => o.tool === newTool.tool);
    if (!oldTool) return false;
    return oldTool.flag !== newTool.flag || oldTool.recommendedAction !== newTool.recommendedAction;
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <a href="/" className="text-slate-500 text-sm hover:text-slate-300 mb-4 inline-block">← Run new audit</a>
          <h1 className="text-3xl font-bold text-white mb-2">Updated Audit Results</h1>
          <p className="text-slate-400">Pricing has changed since your original audit.</p>
        </div>
        <div className={`rounded-xl border p-6 mb-8 ${savingsDelta > 0 ? "bg-green-900/20 border-green-800" : savingsDelta < 0 ? "bg-red-900/20 border-red-800" : "bg-slate-800/50 border-slate-700"}`}>
          <p className="text-slate-400 text-sm mb-1">Savings opportunity</p>
          <div className="flex items-baseline gap-3">
            <span className="text-slate-500 line-through text-xl">${oldResult?.totalMonthlySavings?.toFixed(0) ?? "?"}/mo</span>
            <span className="text-3xl font-bold text-white">${newResult.totalMonthlySavings.toFixed(0)}/mo</span>
            {savingsDelta !== 0 && <span className={`text-sm font-medium ${savingsDelta > 0 ? "text-green-400" : "text-red-400"}`}>{savingsDelta > 0 ? "+" : ""}${savingsDelta.toFixed(0)}/mo</span>}
          </div>
        </div>
        {changedTools.length > 0 && (
          <div className="bg-amber-900/20 border border-amber-800 rounded-xl p-4 mb-6">
            <p className="text-amber-300 font-medium text-sm">{changedTools.length} recommendation{changedTools.length > 1 ? "s" : ""} changed: {changedTools.map((t) => t.toolLabel).join(", ")}</p>
          </div>
        )}
        <div className="space-y-4">
          {newResult.results.map((newTool) => {
            const oldTool = oldResult?.results?.find((o: ToolAuditResult) => o.tool === newTool.tool);
            const changed = oldTool && (oldTool.flag !== newTool.flag || oldTool.recommendedAction !== newTool.recommendedAction);
            return (
              <div key={newTool.tool} className={`rounded-xl border p-5 ${changed ? "border-amber-700/60 bg-slate-800/80" : "border-slate-800 bg-slate-900/50"}`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white text-lg">{newTool.toolLabel}{changed && <span className="ml-2 text-xs font-normal text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded-full">Changed</span>}</h3>
                  <span className={`text-sm font-medium capitalize ${FLAG_COLORS[newTool.flag]}`}>{newTool.flag}</span>
                </div>
                {changed && oldTool ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`rounded-lg border p-3 opacity-60 ${FLAG_BG[oldTool.flag]}`}>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Previous</p>
                      <p className="text-sm text-slate-300">{oldTool.recommendedAction}</p>
                      {oldTool.estimatedSavings > 0 && <p className="text-xs text-slate-500 mt-1">Savings: ${oldTool.estimatedSavings}/mo</p>}
                    </div>
                    <div className={`rounded-lg border p-3 ${FLAG_BG[newTool.flag]}`}>
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Updated</p>
                      <p className="text-sm text-slate-100">{newTool.recommendedAction}</p>
                      {newTool.estimatedSavings > 0 && <p className="text-xs text-slate-400 mt-1">Savings: ${newTool.estimatedSavings}/mo</p>}
                    </div>
                  </div>
                ) : (
                  <div className={`rounded-lg border p-3 ${FLAG_BG[newTool.flag]}`}>
                    <p className="text-sm text-slate-300">{newTool.recommendedAction}</p>
                    {newTool.estimatedSavings > 0 && <p className="text-xs text-slate-400 mt-1">Estimated savings: ${newTool.estimatedSavings}/mo</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <a href="/" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors">Run a fresh audit with current pricing</a>
        </div>
      </div>
    </main>
  );
}