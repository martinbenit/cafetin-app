-- 1. Asegurar que RLS esté activado
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;

-- 2. Borrar CUALQUIER política anterior que pueda estar causando conflicto
DROP POLICY IF EXISTS "Hosts pueden manejar sus propios espacios" ON public.spaces;
DROP POLICY IF EXISTS "Cualquiera puede ver espacios activos" ON public.spaces;
DROP POLICY IF EXISTS "Hosts pueden insertar" ON public.spaces;
DROP POLICY IF EXISTS "Hosts pueden actualizar" ON public.spaces;
DROP POLICY IF EXISTS "Hosts pueden borrar" ON public.spaces;
DROP POLICY IF EXISTS "Hosts select" ON public.spaces;

-- 3. Crear políticas limpias y explícitas (estándar oficial de Supabase)
CREATE POLICY "Todos pueden ver las mesas" 
ON public.spaces FOR SELECT 
USING (true);

CREATE POLICY "Los usuarios autenticados pueden crear mesas" 
ON public.spaces FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Solo el host puede actualizar su mesa" 
ON public.spaces FOR UPDATE 
TO authenticated 
USING (auth.uid() = host_id);

CREATE POLICY "Solo el host puede borrar su mesa" 
ON public.spaces FOR DELETE 
TO authenticated 
USING (auth.uid() = host_id);
