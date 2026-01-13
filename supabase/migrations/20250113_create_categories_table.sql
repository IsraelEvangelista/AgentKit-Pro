-- Migration: Create categories table and update skills table
-- Date: 2025-01-13
-- Description: Adds category management with predefined SkillsMP categories

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  skills_count INTEGER DEFAULT 0,
  is_predefined BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add category_id foreign key to skills table
ALTER TABLE public.skills
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_skills_category_id ON public.skills(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can see all categories, but only modify their own
CREATE POLICY "Anyone can view categories"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own categories"
ON public.categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
ON public.categories FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
ON public.categories FOR DELETE
USING (auth.uid() = user_id);

-- Insert predefined categories from SkillsMP
INSERT INTO public.categories (name, slug, description, icon, color, skills_count, is_predefined) VALUES
  ('Tools', 'tools', 'General tools and utilities for development and productivity', 'Wrench', '#6366f1', 18395, TRUE),
  ('Development', 'development', 'Development tools, frameworks, and programming utilities', 'Code', '#3b82f6', 16232, TRUE),
  ('Data & AI', 'data-ai', 'Data processing, machine learning, and AI-related tools', 'Brain', '#8b5cf6', 10958, TRUE),
  ('Business', 'business', 'Business tools, productivity, and workflow automation', 'Briefcase', '#10b981', 9388, TRUE),
  ('DevOps', 'devops', 'DevOps tools, CI/CD, deployment, and infrastructure', 'Server', '#f59e0b', 9079, TRUE),
  ('Testing & Security', 'testing-security', 'Testing frameworks and security tools', 'Shield', '#ef4444', 6727, TRUE),
  ('Documentation', 'documentation', 'Documentation generators and technical writing tools', 'FileText', '#06b6d4', 4708, TRUE),
  ('Content & Media', 'content-media', 'Content creation, media processing, and creative tools', 'Image', '#ec4899', 4693, TRUE),
  ('Research', 'research', 'Research tools, academic utilities, and reference managers', 'Search', '#14b8a6', 2283, TRUE),
  ('Databases', 'databases', 'Database tools, ORMs, and data management utilities', 'Database', '#0891b2', 1348, TRUE),
  ('Lifestyle', 'lifestyle', 'Personal productivity, health, and lifestyle utilities', 'Heart', '#f43f5e', 1177, TRUE),
  ('Blockchain', 'blockchain', 'Blockchain, crypto, and Web3 development tools', 'Bitcoin', '#a855f7', 502, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION update_categories_updated_at();

-- Add comment to table
COMMENT ON TABLE public.categories IS 'Categories for organizing skills, including predefined SkillsMP categories and user-defined custom categories';

-- Add comment to skills.category_id
COMMENT ON COLUMN public.skills.category_id IS 'Foreign key reference to categories table. NULL for unclassified skills';
