import { useState } from 'react';
import { Play, Square, SkipForward } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ControlPanel({ dbState, sessionData }) {
    const isRunning = dbState.is_running;
    const currentIndex = dbState.current_block_index || 0;
    const currentBlock = sessionData.bloques[currentIndex];

    const handlePlayPause = async () => {
        if (!currentBlock) return;

        const now = new Date();
        const payload = {
            is_running: !isRunning,
            start_timestamp: now.toISOString(),
        };

        if (!isRunning) {
            // PLAY: Calcular y setear el target absolut time en el futuro cercano para no perder sincronia
            // Si el bloque ya está empezado, la matematica real es mas compleja. Para la version ultralight:
            // Todo play setea desde el inicio el bloque completo.
            const target = new Date(now.getTime() + (currentBlock.duracion_seg * 1000));
            payload.target_timestamp = target.toISOString();
        } else {
            // PAUSE / STOP: Borrar target para que el reloj desaparezca o pause
            payload.target_timestamp = null;
        }

        await supabase.from('wod_status').update(payload).eq('id', dbState.id);
    };

    const handleSkip = async () => {
        let nextIndex = currentIndex + 1;
        if (nextIndex >= sessionData.bloques.length) {
            nextIndex = 0; // reset
        }
        await supabase.from('wod_status').update({
            current_block_index: nextIndex,
            is_running: false, // Pausar al saltar para que el profe explique
            target_timestamp: null
        }).eq('id', dbState.id);
    };

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 sticky top-2 z-10 shadow-lg">
            <h2 className="text-center font-semibold mb-1">TV Activa (Bloque {currentIndex + 1})</h2>
            <div className="text-center text-xl text-yellow-300 mb-4 font-bold tracking-wider">
                {currentBlock ? currentBlock.nombre : 'SESION VACIA'}
            </div>

            <div className="flex justify-center gap-4">
                <button
                    onClick={handlePlayPause}
                    disabled={!currentBlock}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-lg font-bold text-lg transition-colors ${isRunning ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white disabled:opacity-50'}`}
                >
                    {isRunning ? <Square size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                    {isRunning ? 'STOP' : 'PLAY'}
                </button>

                <button
                    onClick={handleSkip}
                    disabled={sessionData.bloques.length === 0}
                    className="flex items-center justify-center bg-slate-700 hover:bg-slate-600 py-4 px-6 rounded-lg text-white disabled:opacity-50"
                >
                    <SkipForward size={24} />
                </button>
            </div>
        </div>
    );
}
