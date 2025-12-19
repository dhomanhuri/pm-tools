"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AssignmentDialog } from "./assignment-dialog";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit, Trash2, UserCheck } from "lucide-react";
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

export function AssignmentsList() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
    loadAssignments();
  }, [filterStatus, filterUser]);

  const loadUsers = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("status_aktif", true)
      .order("nama_lengkap");
    if (data) setUsers(data);
  };

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from("assignments")
        .select(`
          *,
          task:tasks(id, title, status, priority, due_date),
          user:users!assignments_user_id_fkey(id, nama_lengkap, email)
        `)
        .order("assigned_date", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      if (filterUser !== "all") {
        query = query.eq("user_id", filterUser);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAssignments(data || []);
    } catch (error: any) {
      toast.error("Failed to load assignments: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from("assignments").delete().eq("id", id);

      if (error) throw error;
      toast.success("Assignment deleted successfully");
      loadAssignments();
    } catch (error: any) {
      toast.error("Failed to delete assignment: " + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500";
      case "In Progress":
        return "bg-blue-500";
      case "On Hold":
        return "bg-yellow-500";
      case "Assigned":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.task?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.user?.nama_lengkap?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate workload summary
  const workloadSummary = users.map((user) => {
    const userAssignments = assignments.filter(
      (a) => a.user_id === user.id && a.status !== "Completed"
    );
    const totalHours = userAssignments.reduce(
      (sum, a) => sum + (parseFloat(a.estimated_hours) || 0),
      0
    );
    return {
      user,
      count: userAssignments.length,
      totalHours,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Assignments
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage task assignments and workload
          </p>
        </div>
        <Button onClick={() => {
          setSelectedAssignment(null);
          setDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Assignment
        </Button>
      </div>

      {/* Workload Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workloadSummary
          .filter((w) => w.count > 0)
          .slice(0, 3)
          .map((summary) => (
            <Card key={summary.user.id}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {summary.user.nama_lengkap}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.count}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Active assignments • {summary.totalHours.toFixed(1)}h estimated
                </p>
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search assignments..."
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
            <SelectItem value="Assigned">Assigned</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="On Hold">On Hold</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterUser} onValueChange={setFilterUser}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by user" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.nama_lengkap}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-600 dark:text-slate-400">
          Loading assignments...
        </div>
      ) : filteredAssignments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-slate-600 dark:text-slate-400">
            No assignments found. Create your first assignment!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">
                      {assignment.task?.title || "Unknown Task"}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 items-center mb-2">
                      <Badge
                        className={`${getStatusColor(assignment.status)} text-white`}
                      >
                        {assignment.status}
                      </Badge>
                      <Badge variant="outline">
                        <UserCheck className="h-3 w-3 mr-1" />
                        {assignment.user?.nama_lengkap}
                      </Badge>
                      {assignment.task && (
                        <>
                          <Badge variant="outline">{assignment.task.status}</Badge>
                          <Badge variant="outline">{assignment.task.priority}</Badge>
                        </>
                      )}
                    </div>
                    {assignment.notes && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {assignment.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(assignment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">
                      Assigned:
                    </span>{" "}
                    {format(new Date(assignment.assigned_date), "MMM dd, yyyy")}
                  </div>
                  {assignment.estimated_hours > 0 && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">
                        Est. Hours:
                      </span>{" "}
                      {assignment.estimated_hours}
                    </div>
                  )}
                  {assignment.actual_hours > 0 && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">
                        Actual Hours:
                      </span>{" "}
                      {assignment.actual_hours}
                    </div>
                  )}
                  {assignment.task?.due_date && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">
                        Task Due:
                      </span>{" "}
                      {format(new Date(assignment.task.due_date), "MMM dd, yyyy")}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AssignmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        assignment={selectedAssignment}
        onSuccess={loadAssignments}
      />
    </div>
  );
}

