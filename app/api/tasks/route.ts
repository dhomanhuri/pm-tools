import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { validateApiKey, unauthorizedResponse } from "@/lib/api-auth";

export async function GET(req: Request) {
  try {
    if (!validateApiKey(req)) {
      return unauthorizedResponse();
    }

    const supabase = await createClient();
    
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
    if (!validateApiKey(req)) {
      return unauthorizedResponse();
    }

    const supabase = await createClient();
    
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
      webhook_url,
      assignees, // Expecting array of UUIDs
      created_by
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!created_by) {
      return NextResponse.json({ error: "created_by (User UUID) is required" }, { status: 400 });
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
