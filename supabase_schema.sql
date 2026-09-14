-- Habilitar extensión pgcrypto para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de espacios (mesas)
CREATE TABLE IF NOT EXISTS public.spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('waiting', 'active', 'finished')) DEFAULT 'waiting',
    timer_duration INT NOT NULL DEFAULT 60, -- en segundos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de invitados
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar_traits JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL CHECK (status IN ('waiting', 'speaking', 'finished')) DEFAULT 'waiting',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Plantillas de criterios de evaluación
CREATE TABLE IF NOT EXISTS public.criteria_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    criteria_list JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Evaluaciones
CREATE TABLE IF NOT EXISTS public.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
    scores JSONB NOT NULL DEFAULT '{}'::jsonb, -- key: criteria, value: score (1-5)
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security)

ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criteria_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Políticas para spaces
-- Un host puede ver, insertar, actualizar y eliminar sus propios espacios
CREATE POLICY "Hosts pueden manejar sus propios espacios" ON public.spaces
    FOR ALL USING (auth.uid() = host_id);

-- Los invitados pueden leer el espacio al que se unen (sin auth, anónimo)
CREATE POLICY "Cualquiera puede ver espacios activos" ON public.spaces
    FOR SELECT USING (true); -- Permitimos leer a todos para que el invitado pueda ver la mesa

-- Políticas para guests
-- Los invitados pueden insertarse a sí mismos (sin auth)
CREATE POLICY "Cualquiera puede unirse como invitado" ON public.guests
    FOR INSERT WITH CHECK (true);

-- Cualquiera puede ver los invitados de un espacio
CREATE POLICY "Cualquiera puede ver invitados" ON public.guests
    FOR SELECT USING (true);

-- El host puede actualizar el status de los invitados (ej. cuando es su turno)
-- También el propio invitado podría actualizar su estado, pero para evitar abusos lo dejamos abierto o condicionado al host
CREATE POLICY "Hosts pueden actualizar invitados" ON public.guests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.spaces s WHERE s.id = space_id AND s.host_id = auth.uid()
        )
    );

-- Políticas para criteria_templates
CREATE POLICY "Hosts pueden manejar sus plantillas" ON public.criteria_templates
    FOR ALL USING (auth.uid() = host_id);

-- Políticas para evaluations
CREATE POLICY "Hosts pueden manejar sus evaluaciones" ON public.evaluations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.spaces s WHERE s.id = space_id AND s.host_id = auth.uid()
        )
    );
