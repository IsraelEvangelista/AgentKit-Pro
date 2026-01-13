BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  source_url TEXT,
  storage_path TEXT,
  tags TEXT[],
  level TEXT,
  status TEXT DEFAULT 'active',
  stars INT DEFAULT 0,
  forks INT DEFAULT 0,
  remote_updated_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'skills' AND column_name = 'source_url') THEN
    ALTER TABLE public.skills ADD COLUMN source_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'skills' AND column_name = 'storage_path') THEN
    ALTER TABLE public.skills ADD COLUMN storage_path TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'skills' AND column_name = 'stars') THEN
    ALTER TABLE public.skills ADD COLUMN stars INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'skills' AND column_name = 'forks') THEN
    ALTER TABLE public.skills ADD COLUMN forks INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'skills' AND column_name = 'remote_updated_at') THEN
    ALTER TABLE public.skills ADD COLUMN remote_updated_at TIMESTAMPTZ;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.skill_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  node_type TEXT NOT NULL DEFAULT 'file',
  path TEXT,
  dir_path TEXT,
  basename TEXT,
  ext TEXT,
  depth INT,
  zip_internal_path TEXT,
  content_storage_path TEXT,
  size_bytes BIGINT,
  content_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'skill_files' AND column_name = 'node_type') THEN
    ALTER TABLE public.skill_files ADD COLUMN node_type TEXT NOT NULL DEFAULT 'file';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'skill_files' AND column_name = 'path') THEN
    ALTER TABLE public.skill_files ADD COLUMN path TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'skill_files' AND column_name = 'dir_path') THEN
    ALTER TABLE public.skill_files ADD COLUMN dir_path TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'skill_files' AND column_name = 'basename') THEN
    ALTER TABLE public.skill_files ADD COLUMN basename TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'skill_files' AND column_name = 'ext') THEN
    ALTER TABLE public.skill_files ADD COLUMN ext TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'skill_files' AND column_name = 'depth') THEN
    ALTER TABLE public.skill_files ADD COLUMN depth INT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'skill_files' AND column_name = 'zip_internal_path') THEN
    ALTER TABLE public.skill_files ADD COLUMN zip_internal_path TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'skill_files' AND column_name = 'content_storage_path') THEN
    ALTER TABLE public.skill_files ADD COLUMN content_storage_path TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_skill_files_skill_id_dir_path ON public.skill_files(skill_id, dir_path);
CREATE UNIQUE INDEX IF NOT EXISTS uq_skill_files_skill_id_path ON public.skill_files(skill_id, path);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active skills" ON public.skills;
DROP POLICY IF EXISTS "Users can create their own skills" ON public.skills;
DROP POLICY IF EXISTS "Users can update their own skills" ON public.skills;
DROP POLICY IF EXISTS "Users can delete their own skills" ON public.skills;

CREATE POLICY "Public can view active skills"
ON public.skills FOR SELECT
USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own skills"
ON public.skills FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills"
ON public.skills FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills"
ON public.skills FOR DELETE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own skill files" ON public.skill_files;
DROP POLICY IF EXISTS "Users can view their own skill files" ON public.skill_files;
DROP POLICY IF EXISTS "Users can delete their own skill files" ON public.skill_files;

CREATE POLICY "Users can insert their own skill files"
ON public.skill_files FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.skills s
    WHERE s.id = skill_files.skill_id
      AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own skill files"
ON public.skill_files FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.skills s
    WHERE s.id = skill_files.skill_id
      AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own skill files"
ON public.skill_files FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.skills s
    WHERE s.id = skill_files.skill_id
      AND s.user_id = auth.uid()
  )
);

INSERT INTO storage.buckets (id, name, public)
VALUES ('skills', 'skills', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Skills objects read own" ON storage.objects;
DROP POLICY IF EXISTS "Skills objects insert own" ON storage.objects;
DROP POLICY IF EXISTS "Skills objects delete own" ON storage.objects;

CREATE POLICY "Skills objects read own"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'skills'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Skills objects insert own"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'skills'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Skills objects delete own"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'skills'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

COMMIT;
