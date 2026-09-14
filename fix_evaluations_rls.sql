-- Habilitar RLS y dar permisos base
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.evaluations TO anon, authenticated;

-- Limpiar políticas anteriores que puedan estar causando 403
DROP POLICY IF EXISTS "Solo hosts pueden crear evaluaciones" ON public.evaluations;
DROP POLICY IF EXISTS "Solo hosts pueden ver evaluaciones" ON public.evaluations;
DROP POLICY IF EXISTS "Hosts create evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Hosts select evaluations" ON public.evaluations;

-- Crear políticas nuevas y más permisivas para que el host pueda operar sin bloqueos
CREATE POLICY "Permitir insertar evaluaciones" 
ON public.evaluations FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir leer evaluaciones" 
ON public.evaluations FOR SELECT 
USING (true);
