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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Assignment {
  id?: string;
  task_id: string;
  user_id: string;
  assigned_date: string;
  estimated_hours?: number;
  actual_hours?: number;
  status: "Assigned" | "In Progress" | "Completed" | "On Hold";
  notes?: string;
}

interface AssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment?: Assignment | null;
  onSuccess: () => void;
}

export function AssignmentDialog({
  open,
  onOpenChange,
  assignment,
  onSuccess,
}: AssignmentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState<Assignment>({
    task_id: "",
    user_id: "",
    assigned_date: new Date().toISOString().split("T")[0],
    estimated_hours: 0,
    actual_hours: 0,
    status: "Assigned",
    notes: "",
  });

  useEffect(() => {
    if (assignment) {
      setFormData({
        ...assignment,
        assigned_date: assignment.assigned_date || new Date().toISOString().split("T")[0],
      });
    } else {
      setFormData({
        task_id: "",
        user_id: "",
        assigned_date: new Date().toISOString().split("T")[0],
        estimated_hours: 0,
        actual_hours: 0,
        status: "Assigned",
        notes: "",
      });
    }
  }, [assignment, open]);

  useEffect(() => {
    if (open) {
      loadTasks();
      loadUsers();
    }
  }, [open]);

  const loadTasks = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .order("title");
    if (data) setTasks(data);
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

      const assignmentData = {
        ...formData,
        estimated_hours: formData.estimated_hours || 0,
        actual_hours: formData.actual_hours || 0,
      };

      if (assignment?.id) {
        const { error } = await supabase
          .from("assignments")
          .update(assignmentData)
          .eq("id", assignment.id);

        if (error) throw error;
        toast.success("Assignment updated successfully");
      } else {
        const { error } = await supabase
          .from("assignments")
          .insert([assignmentData]);

        if (error) throw error;
        toast.success("Assignment created successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {assignment ? "Edit Assignment" : "Create New Assignment"}
          </DialogTitle>
          <DialogDescription>
            {assignment
              ? "Update assignment details"
              : "Assign a task to a team member"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task_id">Task *</Label>
              <Select
                value={formData.task_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, task_id: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select task" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="user_id">Assign To *</Label>
              <Select
                value={formData.user_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, user_id: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.nama_lengkap}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="assigned_date">Assigned Date</Label>
                <Input
                  id="assigned_date"
                  type="date"
                  value={formData.assigned_date}
                  onChange={(e) =>
                    setFormData({ ...formData, assigned_date: e.target.value })
                  }
                />
              </div>

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
                    <SelectItem value="Assigned">Assigned</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div className="grid gap-2">
                <Label htmlFor="actual_hours">Actual Hours</Label>
                <Input
                  id="actual_hours"
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.actual_hours || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      actual_hours: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
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
              {loading ? "Saving..." : assignment ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

