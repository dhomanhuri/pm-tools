"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";

export function CalendarView() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    loadProjects();
    loadTasks();
  }, [selectedProject, currentDate]);

  const loadProjects = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("name");
    if (data) setProjects(data);
  };

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

      if (selectedProject !== "all") {
        query = query.eq("project_id", selectedProject);
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

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.start_date && !task.due_date) return false;
      const taskStart = task.start_date ? new Date(task.start_date) : null;
      const taskEnd = task.due_date ? new Date(task.due_date) : taskStart;
      if (!taskStart && !taskEnd) return false;
      
      const dateStr = format(date, "yyyy-MM-dd");
      if (taskStart && format(taskStart, "yyyy-MM-dd") === dateStr) return true;
      if (taskEnd && format(taskEnd, "yyyy-MM-dd") === dateStr) return true;
      if (taskStart && taskEnd) {
        const dateTime = date.getTime();
        return dateTime >= taskStart.getTime() && dateTime <= taskEnd.getTime();
      }
      return false;
    });
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

  // Create calendar grid
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = getDay(monthStart);
    const daysBeforeMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday = 0
    const days: (Date | null)[] = [];

    // Add empty cells for days before month start
    for (let i = 0; i < daysBeforeMonth; i++) {
      days.push(null);
    }

    // Add all days of the month
    monthDays.forEach((day) => {
      days.push(day);
    });

    return days;
  }, [monthStart, monthDays]);

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Calendar
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            View tasks on calendar
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(currentDate, "MMMM yyyy")}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
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
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
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
              {/* Week day headers */}
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-semibold text-slate-600 dark:text-slate-400"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="aspect-square border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                    );
                  }

                  const dayTasks = getTasksForDate(day);
                  const isToday = isSameDay(day, new Date());
                  const isCurrentMonth = isSameMonth(day, currentDate);

                  return (
                    <div
                      key={day.toISOString()}
                      className={`aspect-square border rounded-lg p-2 ${
                        isToday
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                          : "border-slate-200 dark:border-slate-700"
                      } ${
                        !isCurrentMonth
                          ? "opacity-50"
                          : "bg-white dark:bg-slate-800"
                      }`}
                    >
                      <div
                        className={`text-sm font-medium mb-1 ${
                          isToday
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {format(day, "d")}
                      </div>
                      <div className="space-y-1 overflow-y-auto max-h-[calc(100%-24px)]">
                        {dayTasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            className={`text-xs p-1 rounded truncate cursor-pointer ${getPriorityColor(
                              task.priority
                            )} text-white`}
                            onClick={() => setSelectedTask(task)}
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 3 && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            +{dayTasks.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedTask.title}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTask(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedTask.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedTask.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Badge
                  className={`${getPriorityColor(selectedTask.priority)} text-white`}
                >
                  {selectedTask.priority}
                </Badge>
                <Badge variant="outline">{selectedTask.status}</Badge>
                {selectedTask.project && (
                  <Badge variant="outline">{selectedTask.project.name}</Badge>
                )}
                {selectedTask.assignee && (
                  <Badge variant="outline">
                    {selectedTask.assignee.nama_lengkap}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                {selectedTask.start_date && (
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">
                      Start:
                    </span>{" "}
                    {format(new Date(selectedTask.start_date), "MMM dd, yyyy")}
                  </div>
                )}
                {selectedTask.due_date && (
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">
                      Due:
                    </span>{" "}
                    {format(new Date(selectedTask.due_date), "MMM dd, yyyy")}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

