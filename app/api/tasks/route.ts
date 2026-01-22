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
    let { 
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
      webhook_url,
      assignees, // Expecting array of UUIDs
      created_by
    } = body;

    // Resolve created_by
    if (!created_by && userId) {
      created_by = userId;
    }

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!created_by) {
      return NextResponse.json({ error: "created_by (User UUID) is required for API Key requests or when session is missing" }, { status: 400 });
    }

    // Use the first assignee as the legacy assigned_to value if provided
    const primaryAssignee = (assignees && assignees.length > 0) ? assignees[0] : (assigned_to || null);

    const { data: taskData, error } = await supabase
      .from("tasks")
      .insert([
        {
          title,
          description,
          status: status || "Todo",
          priority: priority || "Medium",
          project_id: project_id || null,
          assigned_to: primaryAssignee,
          start_date,
          due_date,
          estimated_hours,
          created_by,
          reminder_hours_before: reminder_hours_before || null,
          webhook_url: webhook_url || "https://workflows.dhomanhuri.id/webhook/53c7e875-8870-45ed-bfcc-6ccdbc8f9faa"
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Handle assignments table
    const assigneesList = assignees || (assigned_to ? [assigned_to] : []);
    
    if (assigneesList.length > 0) {
      const assignmentsToInsert = assigneesList.map((userId: string) => ({
        task_id: taskData.id,
        user_id: userId,
        assigned_date: new Date().toISOString().split('T')[0],
        status: 'Assigned'
      }));

      const { error: assignError } = await supabase
        .from("assignments")
        .insert(assignmentsToInsert);

      if (assignError) {
        console.error("Failed to insert assignments:", assignError);
      }
    }

    return NextResponse.json(taskData, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
