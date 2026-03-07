import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function BlockEditor({ onAdd }) {
    const [nombre, setNombre] = useState('AMRAP / EMOM');

    // Trabajo
    const [trabajoMin, setTrabajoMin] = useState(1);
    const [trabajoSeg, setTrabajoSeg] = useState(0);

    // Descanso
    const [descansoMin, setDescansoMin] = useState(0);
    const [descansoSeg, setDescansoSeg] = useState(0);

    // Rondas
    const [rondas, setRondas] = useState(1);

    // Info
    const [ejercicios, setEjercicios] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        onAdd({
            nombre: nombre,
            rondas: parseInt(rondas) || 1,
            trabajo_seg: (parseInt(trabajoMin) || 0) * 60 + (parseInt(trabajoSeg) || 0),
            descanso_seg: (parseInt(descansoMin) || 0) * 60 + (parseInt(descansoSeg) || 0),
            ejercicios: ejercicios || 'Empezar a trabajar' // Mostrar en la TV
        });

        // Reset defaults
        setNombre('');
        setEjercicios('');
        setTrabajoMin(1);
        setTrabajoSeg(0);
        setDescansoMin(0);
        setDescansoSeg(0);
        setRondas(1);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 rounded p-4">
            <h3 className="text-lg font-semibold mb-3">Agregar Nuevo Bloque</h3>

            <div className="space-y-3">
                <div>
                    <label className="block text-xs uppercase text-slate-400 mb-1">Nombre (Ej: WOD, ENTRADA EN CALOR)</label>
                    <input
                        type="text"
                        required
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:outline-none focus:border-yellow-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                        <label className="block text-xs font-bold text-slate-300 mb-2 border-b border-slate-700 pb-1">TRABAJO</label>
                        <div className="flex gap-2">
                            <div>
                                <label className="block text-[10px] text-slate-500">Min</label>
                                <input type="number" min="0" value={trabajoMin} onChange={(e) => setTrabajoMin(e.target.value)} required className="w-full bg-slate-950 border border-slate-600 rounded p-1 text-white text-center" />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500">Seg</label>
                                <input type="number" min="0" max="59" value={trabajoSeg} onChange={(e) => setTrabajoSeg(e.target.value)} required className="w-full bg-slate-950 border border-slate-600 rounded p-1 text-white text-center" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                        <label className="block text-xs font-bold text-slate-300 mb-2 border-b border-slate-700 pb-1">DESCANSO (Pauses)</label>
                        <div className="flex gap-2">
                            <div>
                                <label className="block text-[10px] text-slate-500">Min</label>
                                <input type="number" min="0" value={descansoMin} onChange={(e) => setDescansoMin(e.target.value)} required className="w-full bg-slate-950 border border-slate-600 rounded p-1 text-white text-center" />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500">Seg</label>
                                <input type="number" min="0" max="59" value={descansoSeg} onChange={(e) => setDescansoSeg(e.target.value)} required className="w-full bg-slate-950 border border-slate-600 rounded p-1 text-white text-center" />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs uppercase text-slate-400 mb-1">Rondas (Vueltas)</label>
                    <input
                        type="number"
                        required
                        min="1"
                        value={rondas}
                        onChange={(e) => setRondas(e.target.value)}
                        className="w-1/3 bg-slate-900 border border-slate-600 rounded p-2 text-white text-center focus:outline-none focus:border-yellow-500"
                    />
                </div>

                <div>
                    <label className="block text-xs uppercase text-slate-400 mb-1">Ejercicios TV (Uno por línea)</label>
                    <textarea
                        rows="4"
                        value={ejercicios}
                        onChange={(e) => setEjercicios(e.target.value)}
                        placeholder="21 Thrusters&#10;15 Pullups&#10;9 Burpees"
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:outline-none focus:border-yellow-500 resize-none font-mono text-sm leading-tight"
                    />
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2 mt-2">
                    <Plus size={18} /> AGREGAR A CLASE
                </button>
            </div>
        </form>
    );
}
