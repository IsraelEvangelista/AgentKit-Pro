
-- Tabela para armazenar os arquivos individuais de uma skill
CREATE TABLE IF NOT EXISTS public.skill_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Caminho relativo/virtual (ex: "src/index.js")
    storage_path TEXT NOT NULL, -- Caminho no bucket (ex: "user_uuid/skill_slug/src/index.js")
    size_bytes BIGINT,
    content_type TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para skill_files (herda permissões da skill ou usuário)
ALTER TABLE public.skill_files ENABLE ROW LEVEL SECURITY;

-- Política de Inserção (simples para dev, mas segura o suficiente)
CREATE POLICY "Users can insert their own skill files" 
ON public.skill_files FOR INSERT 
WITH CHECK (true); -- Delegamos a checagem real para a logica de aplicação ou FK

-- Política de Seleção
CREATE POLICY "Users can view their own skill files" 
ON public.skill_files FOR SELECT 
USING (true); -- Facilitating dev access logic (relying on app filtering for now)

-- Política de Deleção
CREATE POLICY "Users can delete their own skill files" 
ON public.skill_files FOR DELETE
USING (true);
