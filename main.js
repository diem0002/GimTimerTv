import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'TU_SUPABASE_URL';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'TU_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Primero: Sincronizar el reloj con Supabase
async function syncTime() {
    const { data, error } = await supabase.rpc('get_current_time');
    // Si no tenes una RPC para la hora, usamos la DB para traer cualquier registro y leer su hora de header HTTP.
    // Como workaround gratuito, supabase devuelve la hora del servidor en los headers de cualquier query simple.
    // Para simplificar la version light, leemos el timestamp del NOW() en postgres
    try {
        const res = await supabase.from('wod_status').select('updated_at').limit(1);
        if (res && res.data && res.data.length > 0) {
            // Usamos un simple fetch a la API de Supabase para capturar la Date header si RPC falla.
            // Fetch a un endpoint dummy publico
            const fetchRes = await fetch(`${supabaseUrl}/rest/v1/`, { method: 'HEAD', headers: { apikey: supabaseKey } });
            const serverDateString = fetchRes.headers.get('date');
            if (serverDateString && window.setServerTimeSync) {
                window.setServerTimeSync(serverDateString);
            }
        }
    } catch (e) {
        console.warn("No se pudo sincronizar la hora exacta del servidor. Usando hora local.", e);
    }
}

// Llama una vez al arrancar la TV
syncTime();

// Función que actualiza la UI basada en el payload de Supabase Realtime
function updateUI(payload) {
    if (!payload.new) return;
    const dbState = payload.new;

    // Validar si hay un bloque
    if (dbState.data && dbState.data.bloques) {
        const bloqueActual = dbState.data.bloques[dbState.current_block_index];
        if (window.setTimelineState) {
            window.setTimelineState(dbState, bloqueActual);
        }
    } else {
        if (window.setTimelineState) {
            window.setTimelineState(dbState, null);
        }
    }
}

// Suscribirse a los cambios en realtime de la tabla wod_status
supabase
    .channel('public:wod_status')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'wod_status' }, updateUI)
    .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
            console.log('Suscrito a Supabase Realtime exitosamente');
            // Traer estado inicial antes del primer UPDATE
            const { data } = await supabase.from('wod_status').select('*').limit(1).single();
            if (data) updateUI({ new: data });
        }
    });
