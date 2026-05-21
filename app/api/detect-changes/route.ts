import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { OFFICIAL_PRICING } from "@/lib/pricingData";
import { runAudit } from "@/lib/auditEngine";
import { FormState } from "@/lib/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (body.secret !== process.env.DETECT_CHANGES_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: audits, error } = await supabase
    .from("audits")
    .select("*")
    .not("user_email", "is", null)
    .not("pricing_snapshot", "is", null)
    .eq("is_stale", false);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const staleIds: string[] = [];
  const byUser: Record<
    string,
    {
      email: string;
      audits: Array<{
        id: string;
        changes: string[];
        oldResult: any;
        newResult: any;
      }>;
    }
  > = {};

  for (const audit of audits ?? []) {
    const pricingChanges = detectPricingChanges(
      audit.pricing_snapshot,
      OFFICIAL_PRICING
    );
    if (pricingChanges.length === 0) continue;

    const formState: FormState = {
      tools: audit.tools_data,
      useCase: audit.use_case,
      teamSize: audit.team_size,
    };
    const newResult = runAudit(formState, OFFICIAL_PRICING);
    const oldResult = audit.output_result;

    if (!recommendationsDiffer(oldResult, newResult)) continue;

    staleIds.push(audit.id);

    const email = audit.user_email as string;
    if (!byUser[email]) byUser[email] = { email, audits: [] };
    byUser[email].audits.push({
      id: audit.id,
      changes: pricingChanges,
      oldResult,
      newResult,
    });
  }

  if (staleIds.length > 0) {
    await supabase
      .from("audits")
      .update({ is_stale: true, stale_detected_at: new Date().toISOString() })
      .in("id", staleIds);
  }

  let emailsSent = 0;
  for (const userData of Object.values(byUser)) {
    await sendStaleEmail(userData);
    emailsSent++;
  }

  return NextResponse.json({
    auditsScanned: audits?.length ?? 0,
    staleFound: staleIds.length,
    emailsSent,
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== process.env.DETECT_CHANGES_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return POST(
    new NextRequest(req.url, {
      method: "POST",
      body: JSON.stringify({ secret: process.env.DETECT_CHANGES_SECRET }),
      headers: { "Content-Type": "application/json" },
    })
  );
}

function detectPricingChanges(
  snapshot: Record<string, Record<string, number>>,
  current: Record<string, Record<string, number>>
): string[] {
  const changes: string[] = [];
  for (const tool of Object.keys(snapshot)) {
    const oldPlans = snapshot[tool];
    const newPlans = current[tool];
    if (!newPlans) {
      changes.push(`${tool}: tool removed from pricing`);
      continue;
    }
    for (const plan of Object.keys(oldPlans)) {
      const oldPrice = oldPlans[plan];
      const newPrice = newPlans[plan];
      if (newPrice === undefined) {
        changes.push(`${tool} ${plan} plan: removed`);
      } else if (oldPrice !== newPrice) {
        changes.push(`${tool} ${plan}: $${oldPrice} → $${newPrice}/seat/mo`);
      }
    }
  }
  return changes;
}

function recommendationsDiffer(oldResult: any, newResult: any): boolean {
  if (!oldResult) return true;
  const oldTools = oldResult.results ?? [];
  const newTools = newResult.results ?? [];
  for (const oldTool of oldTools) {
    const newTool = newTools.find((t: any) => t.tool === oldTool.tool);
    if (!newTool) return true;
    if (newTool.flag !== oldTool.flag) return true;
    if (newTool.recommendedAction !== oldTool.recommendedAction) return true;
  }
  return false;
}

async function sendStaleEmail(userData: {
  email: string;
  audits: Array<{
    id: string;
    changes: string[];
    oldResult: any;
    newResult: any;
  }>;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
  const allChanges = [...new Set(userData.audits.flatMap((a) => a.changes))];
  const isMultiple = userData.audits.length > 1;

  const auditLinks = userData.audits
    .map(
      (a) =>
        `<li style="margin-bottom:8px">
          <a href="${baseUrl}/reaudit/${a.id}" style="color:#6366f1;font-weight:600">
            View updated audit →
          </a>
          <span style="color:#94a3b8;font-size:13px;margin-left:8px">
            Was saving $${a.oldResult?.totalMonthlySavings?.toFixed(0) ?? "?"}/mo · 
            Now $${a.newResult?.totalMonthlySavings?.toFixed(0) ?? "?"}/mo
          </span>
        </li>`
    )
    .join("");

  const changesList = allChanges
    .map((c) => `<li style="color:#e2e8f0;margin-bottom:4px">${c}</li>`)
    .join("");

  await resend.emails.send({
    from: "Credex Audit <notifications@credex.rocks>",
    to: userData.email,
    subject: `Your AI stack audit is outdated — pricing changed`,
    html: `
      <div style="background:#0f172a;color:#e2e8f0;font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;border-radius:8px">
        <h2 style="color:#f8fafc;margin-top:0">Pricing changed since your audit</h2>
        <p style="color:#94a3b8">We detected ${allChanges.length} pricing change${allChanges.length > 1 ? "s" : ""} that affect${allChanges.length === 1 ? "s" : ""} your recommendation${isMultiple ? "s" : ""}:</p>
        <ul style="padding-left:20px;margin-bottom:24px">${changesList}</ul>
        <p style="color:#94a3b8">Your previous audit may now suggest different tools. Re-run to see what changed:</p>
        <ul style="list-style:none;padding:0">${auditLinks}</ul>
        <hr style="border:none;border-top:1px solid #1e293b;margin:24px 0"/>
        <p style="font-size:12px;color:#475569;margin:0">
          You received this because you ran an AI stack audit at 
          <a href="${baseUrl}" style="color:#6366f1">${baseUrl.replace("https://", "")}</a>.
        </p>
      </div>
    `,
  });
}