import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // This endpoint should be protected, e.g., by a secret key for cron jobs
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");
    
    // Simple protection (in production, use a more secure method)
    if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const now = new Date();
    
    // 1. Find tasks that need reminding
    // Logic: 
    // - reminder_hours_before is set
    // - (start_date - reminder_hours) <= now OR (due_date - reminder_hours) <= now
    // - last_reminded_at is NULL or older than 24h (to avoid spamming)
    
    // Since complex date math in Supabase query builder is limited, we'll fetch candidate tasks and filter in JS
    // Fetch tasks where reminder is set and dates are in the future (or recent past)
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select(`
        *,
        assignee:users!tasks_assigned_to_fkey(email, nama_lengkap)
      `)
      .not("reminder_hours_before", "is", null)
      .neq("status", "Done");

    if (error) throw error;

    const tasksToRemind = tasks.filter((task) => {
      // Skip if already reminded recently (e.g. within last 23 hours)
      if (task.last_reminded_at) {
        const lastReminded = new Date(task.last_reminded_at);
        const hoursSinceLastReminder = (now.getTime() - lastReminded.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastReminder < 23) return false;
      }

      const reminderHours = task.reminder_hours_before || 0;
      let shouldRemind = false;

      // Check Start Date
      if (task.start_date) {
        const startDate = new Date(task.start_date);
        const remindTimeStart = new Date(startDate.getTime() - (reminderHours * 60 * 60 * 1000));
        // Remind if we are past the reminder time but not too late (e.g. within 1 hour window)
        // For simplicity, we just check if we passed the reminder time
        if (now >= remindTimeStart && now < startDate) {
            shouldRemind = true;
        }
      }

      // Check Due Date
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        const remindTimeDue = new Date(dueDate.getTime() - (reminderHours * 60 * 60 * 1000));
        if (now >= remindTimeDue && now < dueDate) {
            shouldRemind = true;
        }
      }

      return shouldRemind;
    });

    // 2. Send Notifications
    const results = await Promise.all(tasksToRemind.map(async (task) => {
      try {
        const message = `Reminder: Task "${task.title}" is coming up! Due/Start in ${task.reminder_hours_before} hours.`;
        
        // A. Send Webhook if exists
        if (task.webhook_url) {
          await fetch(task.webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: message,
              task_id: task.id,
              title: task.title,
              priority: task.priority,
              assignee: task.assignee?.nama_lengkap
            })
          });
        }

        // B. Send Email (Mock implementation or use Resend/SendGrid)
        // console.log(`Sending email to ${task.assignee?.email}: ${message}`);

        // 3. Update last_reminded_at
        await supabase
          .from("tasks")
          .update({ last_reminded_at: new Date().toISOString() })
          .eq("id", task.id);

        return { id: task.id, status: "reminded" };
      } catch (err: any) {
        return { id: task.id, status: "failed", error: err.message };
      }
    }));

    return NextResponse.json({ 
      processed: tasksToRemind.length, 
      results 
    });

  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
