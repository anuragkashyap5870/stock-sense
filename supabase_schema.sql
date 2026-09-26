-- ============================================================================
-- StockSense: Supabase Cloud Database Schema & Activity Logging
-- Run this script in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- Project: https://nkahbozdwrtxcnwidunz.supabase.co
-- ============================================================================

-- 1. Create activity_logs table to track logins, signups, receipts, deliveries & inventory moves
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_identifier TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    ip_address TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Create index on created_at and user_identifier for fast querying
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs (user_identifier);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs (action);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow full access for backend service key and application client
DROP POLICY IF EXISTS "Allow service and authenticated access" ON public.activity_logs;
CREATE POLICY "Allow service and authenticated access" ON public.activity_logs
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 4. Insert an initial system confirmation log
INSERT INTO public.activity_logs (user_identifier, action, description, metadata)
VALUES (
    'admin@stocksense.com', 
    'SYSTEM_INIT', 
    'StockSense Supabase Cloud Live Audit Log initialized successfully!', 
    '{"version": "1.0", "platform": "StockSense WMS", "database": "Supabase Postgres"}'::jsonb
);
