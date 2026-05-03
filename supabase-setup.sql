-- 1. Criar a tabela com a estrutura completa
CREATE TABLE IF NOT EXISTS public.nps_lagoa_experience (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    nome text NOT NULL,
    telefone text NOT NULL,
    email text,
    hotel text,
    periodo_hospedagem text,
    data_checkin date,
    data_checkout date,
    satisfacao_hospedagem integer NOT NULL,
    atendimento_hotel integer NOT NULL,
    atendimento_parque integer NOT NULL,
    lazer_estrutura integer NOT NULL,
    apresentacao_produto integer NOT NULL,
    clareza_consultor integer NOT NULL,
    expectativa_entregue integer NOT NULL,
    nota_nps integer NOT NULL,
    classificacao_nps text NOT NULL,
    comentario_final text,
    origem text DEFAULT 'Lagoa Experience',
    user_agent text,
    dispositivo text
);

-- 1.1 Garantir que as novas colunas existam caso a tabela tenha sido criada anteriormente
ALTER TABLE public.nps_lagoa_experience 
ADD COLUMN IF NOT EXISTS data_checkin date,
ADD COLUMN IF NOT EXISTS data_checkout date;

-- 2. Ativar Row Level Security
ALTER TABLE public.nps_lagoa_experience ENABLE ROW LEVEL SECURITY;

-- 3. Limpar e Recriar Políticas RLS
DROP POLICY IF EXISTS "Allow public insert" ON public.nps_lagoa_experience;
DROP POLICY IF EXISTS "Allow selection for admin" ON public.nps_lagoa_experience;
DROP POLICY IF EXISTS "Permitir insert publico nps" ON public.nps_lagoa_experience;
DROP POLICY IF EXISTS "Permitir leitura admin nps" ON public.nps_lagoa_experience;
DROP POLICY IF EXISTS "Permitir delete admin nps" ON public.nps_lagoa_experience;

-- Permitir que qualquer cliente envie uma pesquisa
CREATE POLICY "Permitir insert publico nps"
ON public.nps_lagoa_experience
FOR INSERT
TO anon
WITH CHECK (true);

-- Permitir leitura para o portal administrativo usando anon key
CREATE POLICY "Permitir leitura admin nps"
ON public.nps_lagoa_experience
FOR SELECT
TO anon
USING (true);

-- Permitir exclusão no portal administrativo
CREATE POLICY "Permitir delete admin nps"
ON public.nps_lagoa_experience
FOR DELETE
TO anon
USING (true);

-- 4. Ativar Realtime de forma segura
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'nps_lagoa_experience'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.nps_lagoa_experience;
  END IF;
END $$;
