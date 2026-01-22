import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { validateApiKey, unauthorizedResponse } from "@/lib/api-auth";

export async function GET(req: Request) {
  try {
    if (!validateApiKey(req)) {
      return unauthorizedResponse();
    }

    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!validateApiKey(req)) {
      return unauthorizedResponse();
    }

    const supabase = await createClient();
    
    const body = await req.json();
    const { name, description, status, start_date, end_date, created_by } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!created_by) {
      return NextResponse.json({ error: "created_by (User UUID) is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          name,
          description,
          status: status || "Planning",
          start_date,
          end_date,
          created_by
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
