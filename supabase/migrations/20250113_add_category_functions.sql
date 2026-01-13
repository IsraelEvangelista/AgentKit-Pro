-- Migration: Add category management functions
-- Date: 2025-01-13

-- Function to increment category skills count
CREATE OR REPLACE FUNCTION increment_category_skills_count(category_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.categories
  SET skills_count = skills_count + 1
  WHERE id = category_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement category skills count
CREATE OR REPLACE FUNCTION decrement_category_skills_count(category_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.categories
  SET skills_count = GREATEST(0, skills_count - 1)
  WHERE id = category_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_category_skills_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_category_skills_count(UUID) TO authenticated;
