"use client";

import { useProject } from "@/context/project-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Folder, Layers, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ProjectDialog } from "@/components/projects/project-dialog";

export function ProjectSwitcher({ className }: { className?: string }) {
  const { selectedProject, setSelectedProject, projects, loading, refreshProjects } = useProject();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleValueChange = (value: string) => {
    if (value === "all") {
      setSelectedProject(null);
    } else {
      const project = projects.find((p) => p.id === value);
      if (project) {
        setSelectedProject(project);
      }
    }
  };

  if (loading) {
    return (
      <div className={cn("h-10 w-full animate-pulse rounded-md bg-muted", className)} />
    );
  }

  return (
    <div className={cn("px-4 mb-2", className)}>
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
          <Folder className="h-3 w-3" />
          ACTIVE PROJECT
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-5 w-5 hover:bg-orange-100 dark:hover:bg-orange-900/20"
          onClick={() => setDialogOpen(true)}
          title="Create New Project"
        >
          <Plus className="h-3 w-3 text-orange-600 dark:text-orange-400" />
        </Button>
      </div>
      <Select
        value={selectedProject?.id || "all"}
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="w-full bg-background/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 focus:ring-orange-500/20">
          <div className="flex items-center gap-2 truncate">
            <Layers className="h-4 w-4 text-orange-500" />
            <span className="truncate">
              {selectedProject ? selectedProject.name : "All Projects"}
            </span>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="font-medium">
            <span className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              All Projects
            </span>
          </SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ProjectDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onSuccess={() => {
          setDialogOpen(false);
          refreshProjects();
        }} 
      />
    </div>
  );
}
