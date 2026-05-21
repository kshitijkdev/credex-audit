import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toolsData, monthlySavings, annualSavings, useCase, teamSize } =
      body;

    const { data, error } = await supabase
      .from("audits")
      .insert([
        {
          tools_data: toolsData,
          monthly_savings: monthlySavings,
          annual_savings: annualSavings,
          use_case: useCase,
          team_size: teamSize,
        },
      ])
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error("Audit save error:", error);
    return NextResponse.json(
      { error: "Failed to save audit" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "No id" }, { status: 400 });

    const { data, error } = await supabase
      .from("audits")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Audit fetch error:", error);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}