-- Drop the permissive development policy
DROP POLICY IF EXISTS "Allow all actions for authenticated users" ON public.skills;

-- SKILLS TABLE POLICIES --

-- 1. Everyone can view active skills (Catalog Mode)
CREATE POLICY "Public can view active skills"
ON public.skills FOR SELECT
USING (status = 'active');

-- 2. Users can insert their own skills
-- Enforces that the user_id column must match the authenticated user
CREATE POLICY "Users can create their own skills"
ON public.skills FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own skills
CREATE POLICY "Users can update their own skills"
ON public.skills FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Users can delete their own skills
CREATE POLICY "Users can delete their own skills"
ON public.skills FOR DELETE
USING (auth.uid() = user_id);
