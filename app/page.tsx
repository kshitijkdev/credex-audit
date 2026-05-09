"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormState, ToolName, UseCase } from "@/lib/types";
import { TOOL_PLANS, TOOL_LABELS, OFFICIAL_PRICING } from "@/lib/pricingData";

const TOOLS = Object.keys(TOOL_PLANS) as ToolName[];

const DEFAULT_FORM: FormState = {
  tools: Object.fromEntries(
    TOOLS.map((t) => [
      t,
      {
        enabled: false,
        plan: Object.keys(TOOL_PLANS[t])[0],
        seats: 1,
        monthlySpend: 0,
      },
    ])
  ) as Record<ToolName, any>,
  teamSize: 1,
  useCase: "mixed",
};

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("credex-audit-form");
    if (saved) setForm(JSON.parse(saved));
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem("credex-audit-form", JSON.stringify(form));
  }, [form]);

  const updateTool = (tool: ToolName, field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      tools: {
        ...prev.tools,
        [tool]: { ...prev.tools[tool], [field]: value },
      },
    }));
  };

  const handleSubmit = () => {
    const enabledTools = TOOLS.filter((t) => form.tools[t].enabled);
    if (enabledTools.length === 0) {
      alert("Please select at least one AI tool.");
      return;
    }
    router.push("/audit");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <div className="border-b border-slate-800 px-6 py-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          AI Spend Audit
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Find out where your team is overspending on AI tools — free, instant,
          no login required.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {/* Team info */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-base">
              Team Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Team Size</Label>
              <Input
                type="number"
                min={1}
                value={form.teamSize}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    teamSize: parseInt(e.target.value) || 1,
                  }))
                }
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Primary Use Case</Label>
              <Select
                value={form.useCase}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, useCase: v as UseCase }))
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["coding", "writing", "data", "research", "mixed"].map(
                    (u) => (
                      <SelectItem key={u} value={u}>
                        {u.charAt(0).toUpperCase() + u.slice(1)}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tools */}
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            Your AI Tools
          </h2>
          {TOOLS.map((tool) => {
            const entry = form.tools[tool];
            return (
              <Card
                key={tool}
                className={`border transition-colors ${
                  entry.enabled
                    ? "bg-slate-900 border-slate-600"
                    : "bg-slate-900/40 border-slate-800"
                }`}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id={tool}
                      checked={entry.enabled}
                      onChange={(e) =>
                        updateTool(tool, "enabled", e.target.checked)
                      }
                      className="w-4 h-4 accent-emerald-500"
                    />
                    <label
                      htmlFor={tool}
                      className="font-medium text-white cursor-pointer"
                    >
                      {TOOL_LABELS[tool]}
                    </label>
                  </div>

                  {entry.enabled && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">Plan</Label>
                        <Select
                          value={entry.plan}
                          onValueChange={(v) => updateTool(tool, "plan", v)}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TOOL_PLANS[tool].map((plan) => (
                              <SelectItem key={plan} value={plan}>
                                {plan}
                                {OFFICIAL_PRICING[tool]?.[plan]
                                  ? ` — $${OFFICIAL_PRICING[tool][plan]}/mo`
                                  : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">Seats</Label>
                        <Input
                          type="number"
                          min={1}
                          value={entry.seats}
                          onChange={(e) =>
                            updateTool(
                              tool,
                              "seats",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="bg-slate-800 border-slate-700 text-white text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-slate-400 text-xs">
                          Monthly Spend ($)
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          value={entry.monthlySpend}
                          onChange={(e) =>
                            updateTool(
                              tool,
                              "monthlySpend",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="bg-slate-800 border-slate-700 text-white text-sm"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-6 text-base"
        >
          Run My Audit →
        </Button>
      </div>
    </main>
  );
}