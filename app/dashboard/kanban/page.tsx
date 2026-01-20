import { KanbanBoard } from "@/components/kanban/kanban-board";

export const metadata = {
  title: "Kanban Board | PM Tools",
  description: "Manage your tasks with a Kanban board",
};

export default function KanbanPage() {
  return (
    <div className="h-[calc(100vh-4rem)] p-6">
      <KanbanBoard />
    </div>
  );
}
