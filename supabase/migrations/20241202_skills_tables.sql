
-- Tabela para armazenar os arquivos individuais de uma skill
CREATE TABLE IF NOT EXISTS public.skill_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Caminho relativo/virtual (ex: "src/index.js")
    storage_path TEXT NOT NULL, -- Caminho no bucket (ex: "user_uuid/skill_slug/src/index.js")
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

-- RLS para skill_files (herda permissões da skill ou usuário)
ALTER TABLE public.skill_files ENABLE ROW LEVEL SECURITY;

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
