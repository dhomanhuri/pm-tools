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
      .from("users")
      .select("id, nama_lengkap, email, role, status_aktif")
      .eq("status_aktif", true)
      .order("nama_lengkap");

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
