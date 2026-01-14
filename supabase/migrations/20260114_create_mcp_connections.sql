-- Migration: Create MCP connections table for per-user tokens and active skills
-- Date: 2026-01-14

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.mcp_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'default',
  token_hash TEXT NOT NULL UNIQUE,
  token_prefix TEXT NOT NULL,
  allowed_skill_ids UUID[] NOT NULL DEFAULT '{}',
  revoked_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mcp_connections_user_id ON public.mcp_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_connections_revoked_at ON public.mcp_connections(revoked_at);

ALTER TABLE public.mcp_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own mcp connections" ON public.mcp_connections;
DROP POLICY IF EXISTS "Users can insert their own mcp connections" ON public.mcp_connections;
DROP POLICY IF EXISTS "Users can update their own mcp connections" ON public.mcp_connections;
DROP POLICY IF EXISTS "Users can delete their own mcp connections" ON public.mcp_connections;

CREATE POLICY "Users can view their own mcp connections"
ON public.mcp_connections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mcp connections"
ON public.mcp_connections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mcp connections"
ON public.mcp_connections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mcp connections"
ON public.mcp_connections FOR DELETE
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_mcp_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_mcp_connections_updated_at ON public.mcp_connections;
CREATE TRIGGER trigger_update_mcp_connections_updated_at
BEFORE UPDATE ON public.mcp_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_mcp_connections_updated_at();

