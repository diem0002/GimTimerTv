import { Play, Square, SkipForward, Pause, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ControlPanel({ dbState, sessionData }) {
    const isRunning = dbState.is_running;
    const estadoActual = dbState.estado_actual || 'STOPPED'; // STOPPED, RUNNING, PAUSED
    const currentIndex = dbState.current_block_index || 0;
    const currentBlock = sessionData.bloques[currentIndex];

    // Acción: PLAY / REANUDAR
    const handlePlay = async () => {
        if (!currentBlock) return;
        const now = new Date();
        const payload = {
            is_running: true,
            estado_actual: 'RUNNING'
        };

        if (estadoActual === 'PAUSED' && dbState.tiempo_pausado_restante) {
            // Reanudamos desde la pausa
            payload.start_timestamp = new Date(now.getTime() - (getTotalBlockTime() - dbState.tiempo_pausado_restante)).toISOString();
        } else {
            // Empezar de cero
            payload.start_timestamp = now.toISOString();
            payload.tiempo_pausado_restante = null;
        }

        await supabase.from('wod_status').update(payload).eq('id', dbState.id);
    };

    // Acción: PAUSA
    const handlePause = async () => {
        if (!currentBlock || estadoActual !== 'RUNNING') return;

        // Calcular cuánto tiempo faltaba para guardarlo
        const start = new Date(dbState.start_timestamp).getTime();
        const now = new Date().getTime();
        const elapsed = now - start;
        const total = getTotalBlockTime();
        const restante = total - elapsed;

        await supabase.from('wod_status').update({
            is_running: false,
            estado_actual: 'PAUSED',
            tiempo_pausado_restante: restante > 0 ? restante : 0
        }).eq('id', dbState.id);
    };

    // Acción: STOP (Cancelar y volver al inicio del bloque)
    const handleStop = async () => {
        await supabase.from('wod_status').update({
            is_running: false,
            estado_actual: 'STOPPED',
            start_timestamp: null,
            target_timestamp: null,
            tiempo_pausado_restante: null
        }).eq('id', dbState.id);
    };

    // Acción: RESTART (Volver al inicio del bloque y empezar a correr)
    const handleRestart = async () => {
        if (!currentBlock) return;
        const now = new Date();
        await supabase.from('wod_status').update({
            is_running: true,
            estado_actual: 'RUNNING',
            start_timestamp: now.toISOString(),
            target_timestamp: null,
            tiempo_pausado_restante: null
        }).eq('id', dbState.id);
    };

    // Acción: SKIP (Siguiente bloque)
    const handleSkip = async () => {
        let nextIndex = currentIndex + 1;
        if (nextIndex >= sessionData.bloques.length) {
            nextIndex = 0; // reset
        }
        await supabase.from('wod_status').update({
            current_block_index: nextIndex,
            is_running: false,
            estado_actual: 'STOPPED',
            start_timestamp: null,
            target_timestamp: null,
            tiempo_pausado_restante: null
        }).eq('id', dbState.id);
    };

    // Util: Calculamos la duración total teórica del bloque (Trabajo + Descanso) x Rondas
    // Restamos el último descanso porque no se descansa al final del bloque.
    const getTotalBlockTime = () => {
        if (!currentBlock) return 0;
        const totalConDescanso = ((currentBlock.trabajo_seg || 0) + (currentBlock.descanso_seg || 0)) * (currentBlock.rondas || 1);
        const duracionReal = totalConDescanso - (currentBlock.descanso_seg || 0); // Omitimos el último descanso
        return duracionReal * 1000;
    };

    return (
        <div className="bg-slate-800 border-2 border-slate-700 rounded-xl p-5 sticky top-2 z-10 shadow-2xl">
            <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-2">
                <h2 className="font-bold text-slate-300">BLOQUE {currentIndex + 1}</h2>
                <span className={`text-xs px-2 py-1 rounded font-bold ${estadoActual === 'RUNNING' ? 'bg-green-500/20 text-green-400' : estadoActual === 'PAUSED' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-400'}`}>
                    {estadoActual}
                </span>
            </div>

            <div className="text-center text-xl text-yellow-400 mb-6 font-bold tracking-wider uppercase">
                {currentBlock ? currentBlock.nombre : 'SESION VACIA'}
            </div>

            <div className="grid grid-cols-4 gap-2 mb-2">
                {estadoActual !== 'RUNNING' ? (
                    <button onClick={handlePlay} disabled={!currentBlock} className="col-span-4 bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2">
                        <Play fill="currentColor" size={24} /> PLAY
                    </button>
                ) : (
                    <button onClick={handlePause} className="col-span-4 bg-yellow-500 hover:bg-yellow-600 text-black py-4 rounded-lg font-bold flex items-center justify-center gap-2">
                        <Pause fill="currentColor" size={24} /> PAUSA
                    </button>
                )}
            </div>

            <div className="grid grid-cols-3 gap-2">
                <button onClick={handleStop} disabled={!currentBlock || estadoActual === 'STOPPED'} className="bg-red-500/20 hover:bg-red-500/40 text-red-500 py-3 rounded-lg flex flex-col items-center justify-center gap-1 opacity-90 disabled:opacity-30">
                    <Square fill="currentColor" size={20} />
                    <span className="text-[10px] uppercase font-bold">Parar</span>
                </button>

                <button onClick={handleRestart} disabled={!currentBlock} className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-500 py-3 rounded-lg flex flex-col items-center justify-center gap-1 opacity-90 disabled:opacity-30">
                    <RotateCcw size={20} />
                    <span className="text-[10px] uppercase font-bold">Reinicio</span>
                </button>

                <button onClick={handleSkip} disabled={sessionData.bloques.length === 0} className="bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg flex flex-col items-center justify-center gap-1 opacity-90 disabled:opacity-30">
                    <SkipForward size={20} />
                    <span className="text-[10px] uppercase font-bold">Skip >></span>
                </button>
            </div>
        </div>
    );
}
