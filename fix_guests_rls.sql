-- 1. Asegurar que RLS esté activado
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- 2. Asegurar permisos base para roles anónimos y autenticados
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.guests TO anon, authenticated;

-- 3. Limpiar políticas de guests
DROP POLICY IF EXISTS "Cualquiera puede unirse como invitado" ON public.guests;
DROP POLICY IF EXISTS "Cualquiera puede ver a los invitados" ON public.guests;
DROP POLICY IF EXISTS "Hosts pueden actualizar el estado de los invitados" ON public.guests;

-- 4. Crear políticas explícitas
-- Todos pueden ver a los invitados
CREATE POLICY "Cualquiera puede ver a los invitados" 
ON public.guests FOR SELECT 
USING (true);

-- Tanto usuarios logueados como anónimos pueden unirse (insertar)
CREATE POLICY "Cualquiera puede unirse como invitado" 
ON public.guests FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Solo el Host del espacio puede actualizar a sus invitados
CREATE POLICY "Hosts pueden actualizar invitados" 
ON public.guests FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.spaces
        WHERE spaces.id = guests.space_id
        AND spaces.host_id = auth.uid()
    )
);
