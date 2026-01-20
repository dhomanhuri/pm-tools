"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Task {
  id?: string;
  project_id?: string | null;
  title: string;
  description?: string;
  status: "Todo" | "In Progress" | "Review" | "Done";
  priority: "Low" | "Medium" | "High" | "Urgent";
  start_date?: string;
  due_date?: string;
  estimated_hours?: number;
  assigned_to?: string | null;
  assignees?: string[];
  reminder_hours_before?: number | null;
  webhook_url?: string | null;
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSuccess: () => void;
}

export function TaskDialog({ open, onOpenChange, task, onSuccess }: TaskDialogProps) {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState<Task>({
    title: "",
    description: "",
    status: "Todo",
    priority: "Medium",
    start_date: "",
    due_date: "",
    estimated_hours: 0,
    project_id: null,
    assigned_to: null,
    assignees: [],
    reminder_hours_before: null,
    webhook_url: "",
  });

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        start_date: task.start_date || "",
        due_date: task.due_date || "",
        assignees: task.assignees || (task.assigned_to ? [task.assigned_to] : []),
        reminder_hours_before: task.reminder_hours_before || null,
        webhook_url: task.webhook_url || "https://workflows.dhomanhuri.id/webhook/53c7e875-8870-45ed-bfcc-6ccdbc8f9faa",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        status: "Todo",
        priority: "Medium",
        start_date: "",
        due_date: "",
        estimated_hours: 0,
        project_id: null,
        assigned_to: null,
        assignees: [],
        reminder_hours_before: null,
        webhook_url: "https://workflows.dhomanhuri.id/webhook/53c7e875-8870-45ed-bfcc-6ccdbc8f9faa",
      });
    }
  }, [task, open]);

  useEffect(() => {
    if (open) {
      loadProjects();
      loadUsers();
    }
  }, [open]);

  const loadProjects = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("name");
    if (data) setProjects(data);
  };

  const loadUsers = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("status_aktif", true)
      .order("nama_lengkap");
    if (data) setUsers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      const taskData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
        created_by: user.id,
        estimated_hours: formData.estimated_hours || 0,
        project_id: formData.project_id || null,
        // legacy support, taking first assignee
        assigned_to: formData.assignees && formData.assignees.length > 0 ? formData.assignees[0] : null,
        reminder_hours_before: formData.reminder_hours_before || null,
        webhook_url: formData.webhook_url || null,
      };

      let taskId = task?.id;

      if (taskId) {
        const { error } = await supabase
          .from("tasks")
          .update(taskData)
          .eq("id", taskId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("tasks")
          .insert([taskData])
          .select()
          .single();

        if (error) throw error;
        taskId = data.id;
      }

      // Handle assignments (many-to-many)
      if (taskId && formData.assignees) {
        // 1. Delete existing assignments
        await supabase
          .from("assignments")
          .delete()
          .eq("task_id", taskId);

        // 2. Insert new assignments
        if (formData.assignees.length > 0) {
          const assignmentsToInsert = formData.assignees.map(userId => ({
            task_id: taskId,
            user_id: userId,
            assigned_date: new Date().toISOString().split('T')[0],
            status: 'Assigned'
          }));

          const { error: assignError } = await supabase
            .from("assignments")
            .insert(assignmentsToInsert);
          
          if (assignError) console.error("Error updating assignments:", assignError);
        }
      }

      toast.success(task ? "Task updated successfully" : "Task created successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update task details" : "Add a new task to your project"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="project">Project</Label>
                <Select
                  value={formData.project_id || "unassigned"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, project_id: value === "unassigned" ? null : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">No Project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="assigned_to">Assign To</Label>
                <div className="border rounded-md p-3 max-h-[150px] overflow-y-auto space-y-2">
                  {users.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No users found.</p>
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`user-${user.id}`}
                          checked={formData.assignees?.includes(user.id)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            const currentAssignees = formData.assignees || [];
                            if (isChecked) {
                              setFormData({
                                ...formData,
                                assignees: [...currentAssignees, user.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                assignees: currentAssignees.filter((id) => id !== user.id),
                              });
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <label
                          htmlFor={`user-${user.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {user.nama_lengkap}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">Select one or more users</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todo">Todo</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Review">Review</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="estimated_hours">Estimated Hours</Label>
              <Input
                id="estimated_hours"
                type="number"
                step="0.5"
                min="0"
                value={formData.estimated_hours || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimated_hours: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="grid gap-2 border-t pt-4">
              <h3 className="font-medium text-sm">Notifications & Reminders</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="reminder">Remind me before (hours)</Label>
                  <Input
                    id="reminder"
                    type="number"
                    min="0"
                    placeholder="e.g. 1"
                    value={formData.reminder_hours_before || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reminder_hours_before: parseInt(e.target.value) || null,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="webhook">Webhook URL (Optional)</Label>
                  <Input
                    id="webhook"
                    placeholder="https://discord.com/api/webhooks/..."
                    value={formData.webhook_url || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, webhook_url: e.target.value })
                    }
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Reminders will be sent via email to the assignee and to the webhook URL if provided.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : task ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

