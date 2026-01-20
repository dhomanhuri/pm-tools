import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("project_id");
    const status = searchParams.get("status");

    let query = supabase
      .from("tasks")
      .select(`
        *,
        project:projects(id, name),
        assignee:users!tasks_assigned_to_fkey(id, nama_lengkap, email)
      `)
      .order("created_at", { ascending: false });

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      title, 
      description, 
      status, 
      priority, 
      project_id, 
      assigned_to,
      start_date,
      due_date,
      estimated_hours,
      reminder_hours_before,
      webhook_url
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          title,
          description,
          status: status || "Todo",
          priority: priority || "Medium",
          project_id: project_id || null,
          assigned_to: assigned_to || null,
          start_date,
          due_date,
          estimated_hours,
          created_by: user.id,
          reminder_hours_before: reminder_hours_before || null,
          webhook_url: webhook_url || "https://workflows.dhomanhuri.id/webhook/53c7e875-8870-45ed-bfcc-6ccdbc8f9faa"
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
