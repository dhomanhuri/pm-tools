import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { message: "Message is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { message: "OpenAI API Key not configured" },
        { status: 500 }
      );
    }

    const supabase = await createClient();

    // 1. Get Current User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch Context Data (Projects, Tasks, Users)
    // We fetch a summary of active data to feed into the LLM
    const [projectsRes, tasksRes, usersRes] = await Promise.all([
      supabase.from("projects").select("id, name, status, description, start_date, end_date"),
      supabase.from("tasks").select(`
        id, title, status, priority, due_date, estimated_hours,
        project:projects(name),
        assignee:users!tasks_assigned_to_fkey(nama_lengkap)
      `).limit(50), 
      supabase.from("users").select("id, nama_lengkap, email, role")
    ]);

    if (tasksRes.error) {
      console.error("Error fetching tasks for AI context:", tasksRes.error);
    }

    const contextData = {
      projects: projectsRes.data || [],
      tasks: tasksRes.data || [],
      users: usersRes.data || []
    };

    console.log("AI Context Data - Tasks count:", contextData.tasks.length);

    // 3. Construct System Prompt
    const systemPrompt = `
      You are an intelligent Project Management Assistant for a PM Tool application.
      Your goal is to help the user by answering questions about their projects, tasks, and team.
      
      Here is the current data context from the database:
      ${JSON.stringify(contextData, null, 2)}
      
      Instructions:
      - Answer based ONLY on the provided data.
      - If the answer is not in the data, say you don't have that information.
      - Be concise, professional, and helpful.
      - You can summarize project status, list tasks for a specific user, or count urgent tasks.
      - Current Date: ${new Date().toLocaleDateString()}
    `;

    // 4. Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or gpt-3.5-turbo
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0].message.content;

    return NextResponse.json({ message: aiResponse });

  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error: " + error.message },
      { status: 500 }
    );
  }
}
