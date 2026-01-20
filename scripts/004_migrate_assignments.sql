-- Migrate existing assigned_to data to assignments table
INSERT INTO public.assignments (task_id, user_id)
SELECT id, assigned_to
FROM public.tasks
WHERE assigned_to IS NOT NULL
ON CONFLICT (task_id, user_id) DO NOTHING;

-- Note: We keep assigned_to column in tasks table for backward compatibility for now, 
-- or we can choose to ignore it in future queries.
