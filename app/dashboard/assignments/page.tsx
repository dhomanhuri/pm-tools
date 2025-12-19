import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AssignmentsList } from "@/components/assignments/assignments-list";

export default async function AssignmentsPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!userProfile) {
    redirect("/auth/login");
  }

  return (
    <div className="p-6 md:p-8 min-h-screen">
      <AssignmentsList />
    </div>
  );
}

