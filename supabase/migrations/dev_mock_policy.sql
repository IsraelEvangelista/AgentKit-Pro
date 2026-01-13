BEGIN;

DROP POLICY IF EXISTS "Users can create their own skills" ON public.skills;
DROP POLICY IF EXISTS "Users can update their own skills" ON public.skills;
DROP POLICY IF EXISTS "Users can delete their own skills" ON public.skills;
DROP POLICY IF EXISTS "Public can view active skills" ON public.skills;
DROP POLICY IF EXISTS "Dev Allow All" ON public.skills;

CREATE POLICY "Dev Allow All"
ON public.skills FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can insert their own skill files" ON public.skill_files;
DROP POLICY IF EXISTS "Users can view their own skill files" ON public.skill_files;
DROP POLICY IF EXISTS "Users can delete their own skill files" ON public.skill_files;
DROP POLICY IF EXISTS "Dev Allow All Skill Files" ON public.skill_files;

CREATE POLICY "Dev Allow All Skill Files"
ON public.skill_files FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Skills objects read own" ON storage.objects;
DROP POLICY IF EXISTS "Skills objects insert own" ON storage.objects;
DROP POLICY IF EXISTS "Skills objects delete own" ON storage.objects;
DROP POLICY IF EXISTS "Public Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'skills');

CREATE POLICY "Public Uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'skills');

COMMIT;
