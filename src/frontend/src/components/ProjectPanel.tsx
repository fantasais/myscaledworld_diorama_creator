import { Button } from "@/components/ui/button";
import { useBuilderStore } from "@/store/builderStore";
import { FolderOpen, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ProjectPanel() {
  const {
    environment,
    selectedBase,
    savedProjects,
    activeProjectId,
    saveProject,
    loadProject,
    deleteProject,
  } = useBuilderStore();
  const [projectName, setProjectName] = useState("");

  const canSave = Boolean(environment && selectedBase);

  function handleSave() {
    const project = saveProject(projectName);
    setProjectName(project.name);
    toast.success("Project saved", {
      description: `${project.name} is stored locally and can be reopened from this browser.`,
    });
  }

  return (
    <div className="border-t border-border/50 p-4 flex flex-col gap-3">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-primary">
          Saved Projects
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Current v2.1 behaviour: scene placement stays in-session unless saved as a project.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="My Indian Garage v1"
          className="min-w-0 flex-1 h-9 rounded-md border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground"
          data-ocid="project.name_input"
        />
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={!canSave}
          className="gap-1.5 shrink-0"
          data-ocid="project.save_button"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </Button>
      </div>

      {savedProjects.length > 0 && (
        <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
          {savedProjects.map((project) => (
            <div
              key={project.id}
              className={`flex items-center gap-2 rounded-lg border px-2 py-2 ${
                activeProjectId === project.id
                  ? "border-primary/70 bg-primary/10"
                  : "border-border/40 bg-card/40"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  loadProject(project.id);
                  setProjectName(project.name);
                  toast.success("Project loaded");
                }}
                className="flex flex-1 min-w-0 items-center gap-2 text-left"
                data-ocid={`project.load.${project.id}`}
              >
                <FolderOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate text-xs font-semibold text-foreground">
                  {project.name}
                </span>
              </button>
              <button
                type="button"
                onClick={() => deleteProject(project.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label={`Delete ${project.name}`}
                data-ocid={`project.delete.${project.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
