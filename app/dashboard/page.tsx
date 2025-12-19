import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, UserCheck, Calendar, GanttChart, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
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

  // Get statistics
  const { count: tasksCount } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true });

  const { count: assignmentsCount } = await supabase
    .from("assignments")
    .select("*", { count: "exact", head: true });

  const { count: projectsCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });

  const { data: myTasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("assigned_to", user.id)
    .in("status", ["Todo", "In Progress", "Review"])
    .order("due_date", { ascending: true })
    .limit(5);

  const { data: upcomingTasks } = await supabase
    .from("tasks")
    .select("*")
    .gte("due_date", new Date().toISOString().split("T")[0])
    .order("due_date", { ascending: true })
    .limit(5);

  return (
    <div className="p-6 md:p-8 min-h-screen">
      <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">📊</span>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm md:text-base">
              Welcome back, {userProfile.nama_lengkap}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksCount || 0}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              All tasks
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <UserCheck className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignmentsCount || 0}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Active assignments
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <GanttChart className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectsCount || 0}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Total projects
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myTasks?.length || 0}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              In progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/dashboard/tasks">
          <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-orange-500">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-orange-500" />
                Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage your tasks
              </p>
              <ArrowRight className="h-4 w-4 mt-2 text-orange-500" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/assignments">
          <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-orange-500">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-orange-500" />
                Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                View assignments
              </p>
              <ArrowRight className="h-4 w-4 mt-2 text-orange-500" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/gantt">
          <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-orange-500">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GanttChart className="h-5 w-5 text-orange-500" />
                Gantt Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Timeline view
              </p>
              <ArrowRight className="h-4 w-4 mt-2 text-orange-500" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/calendar">
          <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-orange-500">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Calendar view
              </p>
              <ArrowRight className="h-4 w-4 mt-2 text-orange-500" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* My Tasks */}
      {myTasks && myTasks.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>Tasks assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {myTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {task.status} • {task.priority}
                    </p>
                  </div>
                  {task.due_date && (
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Link href="/dashboard/tasks">
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-4 hover:underline">
                View all tasks →
              </p>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Tasks */}
      {upcomingTasks && upcomingTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks with upcoming due dates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {task.status} • {task.priority}
                    </p>
                  </div>
                  {task.due_date && (
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

