import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    // Hybrid Auth
    let isAuthenticated = false;
    if (validateApiKey(req)) {
      isAuthenticated = true;
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) isAuthenticated = true;
    }

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const supabase = await createClient();
    
    // Hybrid Auth
    let userId: string | undefined;
    
    if (validateApiKey(req)) {
      // If API Key, userId must be in body (checked later)
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) userId = user.id;
    }

    if (!validateApiKey(req) && !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await req.json();
    // If userId was found from session, use it if not provided in body
    // If provided in body, it overrides (useful for admin actions via API Key)
    // But for API Key, created_by IS required in body as per previous logic
    
    let { name, description, status, start_date, end_date, created_by } = body;

    // Resolve created_by
    if (!created_by && userId) {
      created_by = userId;
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!created_by) {
      return NextResponse.json({ error: "created_by (User UUID) is required for API Key requests or when session is missing" }, { status: 400 });
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
