-- Add reminders columns to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS reminder_hours_before INTEGER DEFAULT NULL, -- e.g. 1 means 1 hour before
ADD COLUMN IF NOT EXISTS webhook_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_reminded_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for reminder checks
CREATE INDEX IF NOT EXISTS idx_tasks_reminder_check ON public.tasks(start_date, due_date, reminder_hours_before) WHERE reminder_hours_before IS NOT NULL;
