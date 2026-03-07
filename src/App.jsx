import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import BlockEditor from './components/BlockEditor';
import ControlPanel from './components/ControlPanel';

function App() {
    const [dbState, setDbState] = useState(null);
    const [sessionData, setSessionData] = useState({ bloques: [] });
    const [loading, setLoading] = useState(true);

    // Inicializar y suscribirse a Supabase
    useEffect(() => {
        const fetchInitial = async () => {
            // Tomamos la primera/única fila de estado
            const { data, error } = await supabase.from('wod_status').select('*').limit(1).single();
            if (data) {
                setDbState(data);
                if (data.data && data.data.bloques) {
                    setSessionData(data.data);
                }
            }
            setLoading(false);
        };

        fetchInitial();

        const channel = supabase
            .channel('public:wod_status')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'wod_status' }, (payload) => {
                setDbState(payload.new);
                if (payload.new.data && payload.new.data.bloques) {
                    setSessionData(payload.new.data);
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const saveBlocksToDb = async (newBlocks) => {
        const newData = { bloques: newBlocks };
        setSessionData(newData);
        if (dbState?.id) {
            await supabase.from('wod_status').update({ data: newData }).eq('id', dbState.id);
        }
    };

    const handleAddBlock = (block) => {
        saveBlocksToDb([...sessionData.bloques, block]);
    };

    const handleDeleteBlock = (index) => {
        const newB = [...sessionData.bloques];
        newB.splice(index, 1);
        saveBlocksToDb(newB);
    };

    if (loading) return <div className="p-8 text-center">Cargando conexión a Box...</div>;

    return (
        <div className="min-h-screen p-4 max-w-lg mx-auto pb-24">
            <header className="mb-6 border-b border-slate-700 pb-4">
                <h1 className="text-2xl font-bold text-yellow-500">Panel de Control WOD</h1>
                <p className="text-xs text-slate-400 mt-1">Conexión Realtime: {dbState ? '🟢 Establecida' : '🔴 Desconectado'}</p>
            </header>

            {/* Control Activo (Play/Pause/Skip) */}
            {dbState && (
                <ControlPanel
                    dbState={dbState}
                    sessionData={sessionData}
                />
            )}

            {/* Armado de la Clase */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 border-l-4 border-slate-600 pl-2">Bloques de la Clase ({sessionData.bloques.length})</h2>

                <div className="space-y-3 mb-6">
                    {sessionData.bloques.map((b, i) => (
                        <div key={i} className={`p-3 rounded bg-slate-800 border ${dbState?.current_block_index === i ? 'border-yellow-400' : 'border-slate-700'} flex justify-between items-center`}>
                            <div>
                                <div className="font-bold">{b.nombre}</div>
                                <div className="text-sm text-slate-400">
                                    {b.rondas}x {Math.floor(b.trabajo_seg / 60)}:{(b.trabajo_seg % 60).toString().padStart(2, '0')} (Desc: {Math.floor(b.descanso_seg / 60)}:{(b.descanso_seg % 60).toString().padStart(2, '0')})
                                </div>
                            </div>
                            <button onClick={() => handleDeleteBlock(i)} className="text-red-400 bg-slate-900 px-3 py-1 rounded text-sm hover:bg-slate-700">X</button>
                        </div>
                    ))}
                    {sessionData.bloques.length === 0 && (
                        <p className="text-slate-500 italic text-center py-4">No hay bloques armados aún.</p>
                    )}
                </div>

                <BlockEditor onAdd={handleAddBlock} />
            </div>
        </div>
    )
}

export default App;
