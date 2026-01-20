"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskDialog } from "./task-dialog";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/context/project-context";
import { Plus, Edit, Trash2, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";

export function TasksList() {
  const { selectedProject } = useProject();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadTasks();
  }, [filterStatus, filterPriority, selectedProject]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from("tasks")
        .select(`
          *,
          project:projects(id, name),
          assignee:users!tasks_assigned_to_fkey(id, nama_lengkap, email),
          creator:users!tasks_created_by_fkey(id, nama_lengkap)
        `)
        .order("created_at", { ascending: false });

      if (selectedProject) {
        query = query.eq("project_id", selectedProject.id);
      }

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      if (filterPriority !== "all") {
        query = query.eq("priority", filterPriority);
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from("tasks").delete().eq("id", id);

      if (error) throw error;
      toast.success("Task deleted successfully");
      loadTasks();
    } catch (error: any) {
      toast.error("Failed to delete task: " + error.message);
    }
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

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Tasks
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your project tasks
          </p>
        </div>
        <Button onClick={() => {
          setSelectedTask(null);
          setDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Todo">Todo</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Review">Review</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-600 dark:text-slate-400">
          Loading tasks...
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-slate-600 dark:text-slate-400">
            No tasks found. Create your first task!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{task.title}</CardTitle>
                    {task.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        {task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge
                        className={`${getStatusColor(task.status)} text-white`}
                      >
                        {task.status}
                      </Badge>
                      <Badge
                        className={`${getPriorityColor(task.priority)} text-white`}
                      >
                        {task.priority}
                      </Badge>
                      {task.project && (
                        <Badge variant="outline">
                          {task.project.name}
                        </Badge>
                      )}
                      {task.assignee && (
                        <Badge variant="outline">
                          {task.assignee.nama_lengkap}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTask(task);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {task.start_date && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">
                        Start:
                      </span>{" "}
                      {format(new Date(task.start_date), "MMM dd, yyyy")}
                    </div>
                  )}
                  {task.due_date && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">
                        Due:
                      </span>{" "}
                      {format(new Date(task.due_date), "MMM dd, yyyy")}
                    </div>
                  )}
                  {task.estimated_hours > 0 && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">
                        Est. Hours:
                      </span>{" "}
                      {task.estimated_hours}
                    </div>
                  )}
                  {task.creator && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">
                        Created by:
                      </span>{" "}
                      {task.creator.nama_lengkap}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={selectedTask}
        onSuccess={loadTasks}
      />
    </div>
  );
}

