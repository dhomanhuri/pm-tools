import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { validateApiKey, unauthorizedResponse } from "@/lib/api-auth";

export async function GET(req: Request) {
  try {
    if (!validateApiKey(req)) {
      return unauthorizedResponse();
    }

    const supabase = await createClient();
    
    // Fetch projects and users in parallel
    const [projectsRes, usersRes] = await Promise.all([
      supabase.from("projects").select("id, name, status").order("created_at", { ascending: false }),
      supabase.from("users").select("id, nama_lengkap, email").eq("status_aktif", true).order("nama_lengkap")
    ]);

    if (projectsRes.error) throw projectsRes.error;
    if (usersRes.error) throw usersRes.error;

    return NextResponse.json({
      projects: projectsRes.data || [],
      users: usersRes.data || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
