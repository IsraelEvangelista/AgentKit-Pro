-- FIX: Add user_id column if it doesn't exist (Handling case where table was created before the schema update)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'skills' AND column_name = 'user_id') THEN
        ALTER TABLE public.skills ADD COLUMN user_id UUID REFERENCES public.profiles(id);
    END IF;
END $$;

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

-- Verify profiles table exists (Redundancy check)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Re-run Function/Trigger for new users just in case
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Now Apply Policies (Safe to run)
DROP POLICY IF EXISTS "Allow all actions for authenticated users" ON public.skills;
DROP POLICY IF EXISTS "Public can view active skills" ON public.skills;
DROP POLICY IF EXISTS "Users can create their own skills" ON public.skills;
DROP POLICY IF EXISTS "Users can update their own skills" ON public.skills;
DROP POLICY IF EXISTS "Users can delete their own skills" ON public.skills;

-- 1. Everyone can view active skills (Catalog Mode)
CREATE POLICY "Public can view active skills"
ON public.skills FOR SELECT
USING (status = 'active');

-- 2. Users can insert their own skills
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
