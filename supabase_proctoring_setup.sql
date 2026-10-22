-- ==============================================================================
-- DAPATHSHALA: REAL-TIME EXAM PROCTORING & CHEATING DETECTION TABLE & POLICIES
-- ==============================================================================

-- 1. Create proctoring logs table
CREATE TABLE IF NOT EXISTS public.exam_proctoring_logs (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL,
    exam_title TEXT NOT NULL,
    student_name TEXT NOT NULL,
    child_id TEXT NOT NULL,
    violation_type TEXT NOT NULL, -- 'tab_switch' | 'window_blur' | 'fullscreen_exit' | 'copy_attempt' | 'right_click'
    violation_details TEXT NOT NULL,
    flag_count INTEGER NOT NULL DEFAULT 1,
    is_auto_submitted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_proctoring_child_id ON public.exam_proctoring_logs (child_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_created_at ON public.exam_proctoring_logs (created_at DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE public.exam_proctoring_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access
DROP POLICY IF EXISTS "Allow select on proctoring logs" ON public.exam_proctoring_logs;
CREATE POLICY "Allow select on proctoring logs"
ON public.exam_proctoring_logs FOR SELECT
USING (true);

-- Allow insert access for logged exams
DROP POLICY IF EXISTS "Allow insert on proctoring logs" ON public.exam_proctoring_logs;
CREATE POLICY "Allow insert on proctoring logs"
ON public.exam_proctoring_logs FOR INSERT
WITH CHECK (true);

-- 4. Enable Supabase Realtime for instant notification streaming to Parent Dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_proctoring_logs;
