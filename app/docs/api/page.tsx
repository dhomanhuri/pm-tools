import { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation | PM Tools",
  description: "Developer documentation for PM Tools API",
};

export default function ApiDocsPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
        <p className="text-muted-foreground">
          Welcome to the PM Tools API. All endpoints are prefixed with <code className="bg-muted px-1 py-0.5 rounded">/api</code>.
          Authentication relies on session cookies (must be logged in).
        </p>
      </div>

      <div className="space-y-8">
        {/* Projects API */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">Projects</h2>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm font-bold">GET</span>
              /api/projects
            </h3>
            <p className="text-sm text-slate-600">Retrieve a list of all projects.</p>
            <div className="bg-slate-950 text-slate-50 p-4 rounded-lg text-sm overflow-x-auto">
              <pre>{`[
  {
    "id": "uuid",
    "name": "Project Name",
    "status": "Active",
    "created_at": "2024-01-20T..."
  }
]`}</pre>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-sm font-bold">POST</span>
              /api/projects
            </h3>
            <p className="text-sm text-slate-600">Create a new project.</p>
            <div className="bg-slate-950 text-slate-50 p-4 rounded-lg text-sm overflow-x-auto">
              <pre>{`// Request Body
{
  "name": "New Project",
  "description": "Optional description",
  "status": "Planning",
  "start_date": "2024-02-01",
  "end_date": "2024-03-01"
}`}</pre>
            </div>
          </div>
        </section>

        {/* Tasks API */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">Tasks</h2>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm font-bold">GET</span>
              /api/tasks
            </h3>
            <p className="text-sm text-slate-600">Retrieve a list of tasks. Supports filtering.</p>
            <p className="text-xs font-mono text-muted-foreground">Query Params: ?project_id=uuid&status=Todo</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-sm font-bold">POST</span>
              /api/tasks
            </h3>
            <p className="text-sm text-slate-600">Create a new task.</p>
            <div className="bg-slate-950 text-slate-50 p-4 rounded-lg text-sm overflow-x-auto">
              <pre>{`// Request Body
{
  "title": "Fix login bug",
  "project_id": "uuid",
  "priority": "High",
  "assigned_to": "uuid"
}`}</pre>
            </div>
          </div>
        </section>

        {/* Users API */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">Users</h2>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm font-bold">GET</span>
              /api/users
            </h3>
            <p className="text-sm text-slate-600">Retrieve a list of active users.</p>
          </div>
        </section>

        {/* AI Chat API */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">AI Assistant</h2>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-sm font-bold">POST</span>
              /api/ai/chat
            </h3>
            <p className="text-sm text-slate-600">Interact with the AI Project Assistant. It uses the user's project data as context.</p>
            <div className="bg-slate-950 text-slate-50 p-4 rounded-lg text-sm overflow-x-auto">
              <pre>{`// Request Body
{
  "message": "What tasks are assigned to me?"
}

// Response
{
  "message": "You have 3 tasks assigned: ..."
}`}</pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
