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

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { FormState, ToolName, UseCase } from "@/lib/types";
import {
  TOOL_PLANS,
  TOOL_LABELS,
  OFFICIAL_PRICING,
} from "@/lib/pricingData";

const TOOLS = Object.keys(TOOL_PLANS) as ToolName[];

const DEFAULT_FORM: FormState = {
  tools: Object.fromEntries(
    TOOLS.map((tool) => [
      tool,
      {
        enabled: false,
        plan: TOOL_PLANS[tool][0],
        seats: 1,
        monthlySpend: 0,
      },
    ])
  ) as Record<ToolName, any>,

  teamSize: 1,
  useCase: "mixed",
};

export default function HomePage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  // Load saved form
  useEffect(() => {
    const saved = localStorage.getItem("credex-audit-form");

    if (saved) {
      setForm(JSON.parse(saved));
    }
  }, []);

  // Persist form
  useEffect(() => {
    localStorage.setItem("credex-audit-form", JSON.stringify(form));
  }, [form]);

  const updateTool = (
    tool: ToolName,
    field: string,
    value: string | number | boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      tools: {
        ...prev.tools,
        [tool]: {
          ...prev.tools[tool],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = () => {
    const enabledTools = TOOLS.filter(
      (tool) => form.tools[tool].enabled
    );

    if (enabledTools.length === 0) {
      alert("Please select at least one AI tool.");
      return;
    }

    router.push("/audit");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HERO */}
      <section className="border-b border-slate-800 px-6 py-14 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
          AI Spend Audit
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-slate-300 leading-relaxed">
          Discover where your team is overspending on AI tools.
          Instantly audit subscriptions, identify overlaps, and
          uncover savings opportunities.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* TEAM DETAILS */}
        <Card className="bg-slate-900 border border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              Team Details
            </CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team Size */}
            <div className="space-y-2">
              <Label
                htmlFor="team-size"
                className="text-slate-200"
              >
                Team Size
              </Label>

              <Input
                id="team-size"
                type="number"
                min={1}
                aria-label="Team Size"
                value={form.teamSize}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    teamSize:
                      parseInt(e.target.value) || 1,
                  }))
                }
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* Use Case */}
            <div className="space-y-2">
              <Label className="text-slate-200">
                Primary Use Case
              </Label>

              <Select
                value={form.useCase}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    useCase: value as UseCase,
                  }))
                }
              >
                <SelectTrigger
                  aria-label="Primary Use Case"
                  className="bg-slate-800 border-slate-700 text-white"
                >
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {[
                    "coding",
                    "writing",
                    "data",
                    "research",
                    "mixed",
                  ].map((useCase) => (
                    <SelectItem
                      key={useCase}
                      value={useCase}
                    >
                      {useCase.charAt(0).toUpperCase() +
                        useCase.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* TOOL SECTION */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Your AI Tools
            </h2>

            <p className="text-slate-300 mt-1">
              Select the AI products your team currently pays for.
            </p>
          </div>

          {TOOLS.map((tool) => {
            const entry = form.tools[tool];

            return (
              <Card
                key={tool}
                className={`transition-all border ${
                  entry.enabled
                    ? "bg-slate-900 border-emerald-500/50"
                    : "bg-slate-900 border-slate-800"
                }`}
              >
                <CardContent className="pt-6">
                  {/* TOOL HEADER */}
                  <div className="flex items-center gap-3 mb-5">
                    <input
                      id={tool}
                      type="checkbox"
                      aria-label={`Enable ${TOOL_LABELS[tool]}`}
                      checked={entry.enabled}
                      onChange={(e) =>
                        updateTool(
                          tool,
                          "enabled",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 accent-emerald-500"
                    />

                    <label
                      htmlFor={tool}
                      className="text-white font-medium cursor-pointer"
                    >
                      {TOOL_LABELS[tool]}
                    </label>
                  </div>

                  {/* TOOL CONFIG */}
                  {entry.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* PLAN */}
                      <div className="space-y-2">
                        <Label className="text-slate-200">
                          Plan
                        </Label>

                        <Select
                          value={entry.plan}
                          onValueChange={(value) =>
                            updateTool(
                              tool,
                              "plan",
                              value
                            )
                          }
                        >
                          <SelectTrigger
                            aria-label={`${TOOL_LABELS[tool]} Plan`}
                            className="bg-slate-800 border-slate-700 text-white"
                          >
                            <SelectValue />
                          </SelectTrigger>

                          <SelectContent>
                            {TOOL_PLANS[tool].map(
                              (plan) => (
                                <SelectItem
                                  key={plan}
                                  value={plan}
                                >
                                  {plan}
                                  {OFFICIAL_PRICING[
                                    tool
                                  ]?.[plan]
                                    ? ` — $${OFFICIAL_PRICING[tool][plan]}/mo`
                                    : ""}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* SEATS */}
                      <div className="space-y-2">
                        <Label className="text-slate-200">
                          Seats
                        </Label>

                        <Input
                          type="number"
                          min={1}
                          aria-label={`${TOOL_LABELS[tool]} Seats`}
                          value={entry.seats}
                          onChange={(e) =>
                            updateTool(
                              tool,
                              "seats",
                              parseInt(
                                e.target.value
                              ) || 1
                            )
                          }
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>

                      {/* MONTHLY SPEND */}
                      <div className="space-y-2">
                        <Label className="text-slate-200">
                          Monthly Spend ($)
                        </Label>

                        <Input
                          type="number"
                          min={0}
                          aria-label={`${TOOL_LABELS[tool]} Monthly Spend`}
                          value={entry.monthlySpend}
                          onChange={(e) =>
                            updateTool(
                              tool,
                              "monthlySpend",
                              parseFloat(
                                e.target.value
                              ) || 0
                            )
                          }
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* CTA */}
        <Button
          onClick={handleSubmit}
          aria-label="Run AI Spend Audit"
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-6 text-base"
        >
          Run My Audit →
        </Button>
      </section>
    </main>
  );
}