import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      companyName,
      role,
      teamSize,
      toolsData,
      monthlySavings,
      annualSavings,
      useCase,
    } = body;

    // Honeypot check — if filled, it's a bot
    if (body.website) {
      return NextResponse.json({ success: true });
    }

    // Store in Supabase
    const { error } = await supabase.from("leads").insert([
      {
        email,
        company_name: companyName,
        role,
        team_size: teamSize,
        tools_data: toolsData,
        monthly_savings: monthlySavings,
        annual_savings: annualSavings,
        use_case: useCase,
      },
    ]);

    if (error) throw error;

    // Send confirmation email
    await resend.emails.send({
      from: "Credex Audit <onboarding@resend.dev>",
      to: email,
      subject: "Your AI Spend Audit Report",
      html: `
        <h2>Your AI Spend Audit is ready</h2>
        <p>Hi there,</p>
        <p>Based on your audit, you could save <strong>$${monthlySavings}/month</strong> ($${annualSavings}/year) on AI tools.</p>
        ${
          monthlySavings >= 500
            ? `<p>Because your potential savings are significant, a Credex advisor will reach out shortly to discuss how discounted AI credits could help you save even more.</p>`
            : `<p>We'll notify you when new optimization opportunities apply to your stack.</p>`
        }
        <p>— The Credex Team</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead capture error:", error);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }
}