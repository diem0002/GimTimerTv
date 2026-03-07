-- Inicializacion de Extension UUID (si usas UUIDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Creacion tabla estado
CREATE TABLE IF NOT EXISTS public.wod_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    current_block_index INTEGER DEFAULT 0,
    is_running BOOLEAN DEFAULT false,
    start_timestamp TIMESTAMP WITH TIME ZONE,
    target_timestamp TIMESTAMP WITH TIME ZONE, -- Benchmark critico para resiliencia TV
    data JSONB DEFAULT '{}'::JSONB, 
    -- 'data' contendrá toda la sesión generada por el admin
    -- ej: {"bloques": [{"title":"Fuerza", "duration":300}, {"title":"WOD", "duration":600}]}
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Supabase Realtime explicitamente en esta tabla para la TV (Android 4.4)
ALTER PUBLICATION supabase_realtime ADD TABLE public.wod_status;

-- Insertar una fila maestra (TV listening to this row ID ideally)
INSERT INTO public.wod_status (is_running, current_block_index) 
VALUES (false, 0);
