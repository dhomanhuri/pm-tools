"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay } from "date-fns";
import { useProject } from "@/context/project-context";

export function GanttChartView() {
  const { selectedProject } = useProject();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadTasks();
  }, [selectedProject]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from("tasks")
        .select(`
          *,
          project:projects(id, name),
          assignee:users!tasks_assigned_to_fkey(id, nama_lengkap)
        `)
        .order("start_date", { ascending: true });

      if (selectedProject) {
        query = query.eq("project_id", selectedProject.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      toast.error("Failed to load tasks: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getTaskPosition = (task: any) => {
    if (!task.start_date) return { left: 0, width: 0 };
    
    const start = new Date(task.start_date);
    const end = task.due_date ? new Date(task.due_date) : new Date(task.start_date);
    
    const daysFromWeekStart = Math.floor(
      (start.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    const taskDuration = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    const left = Math.max(0, daysFromWeekStart) * (100 / 7);
    const width = Math.min(taskDuration * (100 / 7), 100 - left);

    return { left: Math.max(0, left), width: Math.max(1, width) };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-500";
      case "High":
        return "bg-orange-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "bg-green-500";
      case "In Progress":
        return "bg-blue-500";
      case "Review":
        return "bg-purple-500";
      case "Todo":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (!task.start_date) return false;
      const taskStart = new Date(task.start_date);
      const taskEnd = task.due_date ? new Date(task.due_date) : taskStart;
      return taskStart <= weekEnd && taskEnd >= weekStart;
    });
  }, [tasks, weekStart, weekEnd]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Gantt Chart
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Visual timeline of your tasks
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {format(weekStart, "MMM dd")} - {format(weekEnd, "MMM dd, yyyy")}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400">
              Loading tasks...
            </div>
          ) : (
            <div className="space-y-4">
              {/* Timeline Header */}
              <div className="grid grid-cols-[200px_repeat(7,1fr)] gap-2 border-b pb-2">
                <div className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                  Task
                </div>
                {weekDays.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={`text-center text-xs font-medium ${
                      isSameDay(day, new Date())
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <div>{format(day, "EEE")}</div>
                    <div className="text-lg">{format(day, "d")}</div>
                  </div>
                ))}
              </div>

              {/* Tasks */}
              {visibleTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                  No tasks in this time range
                </div>
              ) : (
                <div className="space-y-2">
                  {visibleTasks.map((task) => {
                    const { left, width } = getTaskPosition(task);
                    return (
                      <div
                        key={task.id}
                        className="grid grid-cols-[200px_repeat(7,1fr)] gap-2 items-center min-h-[40px]"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div
                            className={`h-3 w-3 rounded-full ${getPriorityColor(
                              task.priority
                            )}`}
                          />
                          <span className="text-sm font-medium truncate">
                            {task.title}
                          </span>
                        </div>
                        <div className="col-span-7 relative h-8">
                          <div
                            className={`absolute h-6 rounded-md ${getStatusColor(
                              task.status
                            )} text-white text-xs flex items-center px-2 shadow-sm`}
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                              minWidth: "20px",
                            }}
                            title={`${task.title} - ${task.status}`}
                          >
                            {width > 5 && (
                              <span className="truncate">{task.title}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-gray-500" />
              <span className="text-sm">Todo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-blue-500" />
              <span className="text-sm">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-purple-500" />
              <span className="text-sm">Review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-green-500" />
              <span className="text-sm">Done</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

