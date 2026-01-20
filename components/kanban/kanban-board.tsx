"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Calendar, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { useProject } from "@/context/project-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "Todo" | "In Progress" | "Review" | "Done";
  priority: "Low" | "Medium" | "High" | "Urgent";
  due_date: string;
  project: {
    id: string;
    name: string;
  };
  assignees?: {
    id: string;
    nama_lengkap: string;
    email: string;
  }[];
  // Legacy support
  assignee?: {
    id: string;
    nama_lengkap: string;
    email: string;
  };
}

const COLUMNS = [
  { id: "Todo", title: "To Do" },
  { id: "In Progress", title: "In Progress" },
  { id: "Review", title: "Review" },
  { id: "Done", title: "Done" },
];

export function KanbanBoard() {
  const { selectedProject } = useProject();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBrowser, setIsBrowser] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    setIsBrowser(true);
    loadTasks();
  }, [selectedProject]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      let query = supabase
        .from("tasks")
        .select(`
          *,
          project:projects(id, name),
          assignee:users!tasks_assigned_to_fkey(id, nama_lengkap, email),
          assignments:assignments(user:users(id, nama_lengkap, email))
        `)
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: false });

      if (selectedProject) {
        query = query.eq("project_id", selectedProject.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform data to include assignees from assignments table
      const tasksWithAssignees = (data || []).map((task: any) => ({
        ...task,
        assignees: task.assignments?.map((a: any) => a.user) || (task.assignee ? [task.assignee] : [])
      }));

      setTasks(tasksWithAssignees);
    } catch (error: any) {
      toast.error("Failed to load tasks: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as Task["status"];
    const draggedTask = tasks.find((t) => t.id === draggableId);

    if (!draggedTask) return;

    // Optimistic update
    const updatedTasks = tasks.map((t) => {
      if (t.id === draggableId) {
        return { ...t, status: newStatus };
      }
      return t;
    });

    setTasks(updatedTasks);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", draggableId);

      if (error) throw error;
      toast.success(`Task moved to ${newStatus}`);
    } catch (error: any) {
      toast.error("Failed to update task status: " + error.message);
      loadTasks(); // Revert on error
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-500 hover:bg-red-600";
      case "High":
        return "bg-orange-500 hover:bg-orange-600";
      case "Medium":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "Low":
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
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

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (!isBrowser) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Kanban Board</h2>
        <Button onClick={() => { setSelectedTask(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 h-full overflow-x-auto pb-4">
          {COLUMNS.map((column) => (
            <div key={column.id} className="flex-1 min-w-[300px] flex flex-col rounded-lg bg-muted/50 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{column.title}</h3>
                <Badge variant="secondary" className="rounded-full">
                  {tasks.filter((t) => t.status === column.id).length}
                </Badge>
              </div>

              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex-1 flex flex-col gap-3 min-h-[100px]"
                  >
                    {tasks
                      .filter((task) => task.status === column.id)
                      .map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                              onClick={() => handleEditTask(task)}
                            >
                              <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                  <span className="font-medium line-clamp-2 text-sm">
                                    {task.title}
                                  </span>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="text-red-600"
                                        onClick={() => handleDeleteTask(task.id)}
                                      >
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <Badge 
                                    className={`${getPriorityColor(task.priority)} text-white border-0 text-[10px] px-2 py-0 h-5`}
                                  >
                                    {task.priority}
                                  </Badge>
                                  {task.project && (
                                    <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 max-w-[120px] truncate">
                                      {task.project.name}
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex items-center justify-between text-muted-foreground pt-2 border-t mt-2">
                                  {task.due_date && (
                                    <div className="flex items-center text-xs">
                                      <Calendar className="mr-1 h-3 w-3" />
                                      {format(new Date(task.due_date), "MMM d")}
                                    </div>
                                  )}
                                  
                                  <div className="flex -space-x-2 ml-auto">
                                    {task.assignees && task.assignees.length > 0 ? (
                                      task.assignees.slice(0, 3).map((assignee) => (
                                        <Avatar key={assignee.id} className="h-6 w-6 border-2 border-white dark:border-slate-900">
                                          <AvatarImage src={`https://avatar.vercel.sh/${assignee.email}`} />
                                          <AvatarFallback className="text-[8px]">
                                            {getInitials(assignee.nama_lengkap)}
                                          </AvatarFallback>
                                        </Avatar>
                                      ))
                                    ) : (
                                      <div className="ml-auto">
                                        <UserIcon className="h-4 w-4 opacity-50" />
                                      </div>
                                    )}
                                    {task.assignees && task.assignees.length > 3 && (
                                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[8px] border-2 border-white dark:border-slate-900">
                                        +{task.assignees.length - 3}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={selectedTask}
        onSuccess={() => {
          setDialogOpen(false);
          loadTasks();
        }}
      />
    </div>
  );
}
