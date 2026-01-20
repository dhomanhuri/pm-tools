import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
