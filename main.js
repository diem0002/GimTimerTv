import { createClient } from '@supabase/supabase-js';

// Usar variables de entorno de Vite para la configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'TU_SUPABASE_URL';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'TU_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const blockInfoEl = document.getElementById('block-info');
const nextExerciseEl = document.getElementById('next-exercise');

// Función que actualiza la UI basada en el payload de Supabase Realtime
function updateUI(payload) {
    if (!payload.new) return;
    const dbState = payload.new;

    // Validar si hay un bloque corriendo
    if (dbState.is_running && dbState.data && dbState.data.bloques) {
        const bloqueActual = dbState.data.bloques[dbState.current_block_index];
        if (bloqueActual) {
            blockInfoEl.innerText = bloqueActual.nombre || 'WOD ACTIVO';
            nextExerciseEl.innerText = bloqueActual.ejercicio_actual || '...';
        }

        // Calcular tiempo restante basado en el target_timestamp absoluto
        // Esto previene que la TV se atrase si su CPU "pierde" segundos de setInterval
        if (dbState.target_timestamp) {
            const targetMs = new Date(dbState.target_timestamp).getTime();
            window.setTimerTarget(targetMs);
        }
    } else {
        blockInfoEl.innerText = 'EN ESPERA...';
        nextExerciseEl.innerText = '---';
        window.setTimerTarget(null); // Detener timer
    }
}

// Suscribirse a los cambios en realtime de la tabla wod_status
// Requiere que RLS (Row Level Security) permita la lectura o usar token anon valido
supabase
    .channel('public:wod_status')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'wod_status' }, updateUI)
    .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
            console.log('Suscrito a Supabase Realtime exitosamente');
            // En vez de "ESPERANDO RED", cambiamos
            blockInfoEl.innerText = 'CONECTADO AL PANEL';
        }
    });
