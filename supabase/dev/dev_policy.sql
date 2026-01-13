-- RESTORE DEV POLICY (Public Access)
-- Access to everyone (authenticated or anonymous/public)
-- Needed because we are reverting to a mock login in frontend without real Supabase session

-- 1. Drop strict policies
DROP POLICY IF EXISTS "Users can create their own skills" ON public.skills;
DROP POLICY IF EXISTS "Users can update their own skills" ON public.skills;
DROP POLICY IF EXISTS "Users can delete their own skills" ON public.skills;
DROP POLICY IF EXISTS "Public can view active skills" ON public.skills;

-- 2. Enable Permissive Policy
CREATE POLICY "Dev Allow All"
ON public.skills FOR ALL
USING (true)
WITH CHECK (true);

-- 3. Also allow public/anon to upload to storage for now
DROP POLICY IF EXISTS "Authenticated Uploads" ON storage.objects;
CREATE POLICY "Public Uploads"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'skills' );

DROP POLICY IF EXISTS "Users can insert their own skill files" ON public.skill_files;
DROP POLICY IF EXISTS "Users can view their own skill files" ON public.skill_files;
DROP POLICY IF EXISTS "Users can delete their own skill files" ON public.skill_files;
DROP POLICY IF EXISTS "Dev Allow All Skill Files" ON public.skill_files;

CREATE POLICY "Dev Allow All Skill Files"
ON public.skill_files FOR ALL
USING (true)
WITH CHECK (true);
