import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function BlockEditor({ onAdd }) {
    const [nombre, setNombre] = useState('Fuerza / AMRAP');
    const [minutos, setMinutos] = useState(10);
    const [ejercicios, setEjercicios] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({
            nombre: nombre,
            duracion_seg: parseInt(minutos) * 60,
            ejercicio_actual: ejercicios || 'Empezar a trabajar' // Mostrar en la TV
        });
        setNombre('');
        setEjercicios('');
        setMinutos(10);
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

                <div className="flex gap-3">
                    <div className="flex-1">
                        <label className="block text-xs uppercase text-slate-400 mb-1">Minutos Trab. (Timecap)</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={minutos}
                            onChange={(e) => setMinutos(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-center focus:outline-none focus:border-yellow-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs uppercase text-slate-400 mb-1">Info TV (Ej: 21-15-9 Thrusters)</label>
                    <input
                        type="text"
                        value={ejercicios}
                        onChange={(e) => setEjercicios(e.target.value)}
                        placeholder="Texto pequeño en la TV..."
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:outline-none focus:border-yellow-500"
                    />
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2 mt-2">
                    <Plus size={18} /> AGREGAR A CLASE
                </button>
            </div>
        </form>
    );
}
