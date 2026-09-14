'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LogOut, Plus, Trash2 } from 'lucide-react';
import { useStore } from '@/store/store';

interface Space {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

const TABLE_THEMES = [
  { id: 'cafetin', name: 'Cafetín', file: 'table_1.png' },
  { id: 'cyberpunk', name: 'Cyberpunk', file: 'table_2.png' },
  { id: 'minimalista', name: 'Minimalista', file: 'table_3.png' },
  { id: 'picnic_creativo', name: 'Picnic', file: 'table_4.png' },
  { id: 'madera_clasica', name: 'Madera Clásica', file: 'table_5.png' },
  { id: 'marmol_blanco', name: 'Mármol Blanco', file: 'table_6.png' },
  { id: 'metal_oscuro', name: 'Metal Oscuro', file: 'table_7.png' },
  { id: 'picnic_natural', name: 'Picnic', file: 'table_8.png' },
];

export default function DashboardPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [timerHours, setTimerHours] = useState('0');
  const [timerMinutes, setTimerMinutes] = useState('1');
  const [timerSeconds, setTimerSeconds] = useState('0');
  const [selectedTheme, setSelectedTheme] = useState('cafetin');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { setHostId } = useStore();

  useEffect(() => {
    checkUser();
    fetchSpaces();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    } else {
      setHostId(user.id);
    }
  };

  const fetchSpaces = async () => {
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setSpaces(data);
    }
    setIsLoading(false);
  };

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim()) return;

    setIsCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const totalSecs = (parseInt(timerHours) || 0) * 3600 + (parseInt(timerMinutes) || 0) * 60 + (parseInt(timerSeconds) || 0);

      const { data, error } = await supabase
        .from('spaces')
        .insert([{ 
          name: newSpaceName, 
          host_id: user.id,
          timer_duration: totalSecs > 0 ? totalSecs : 60
        }])
        .select()
        .single();
      
      if (error) {
        alert("Error creando la mesa: " + error.message);
        console.error("Supabase error:", error);
      } else if (data) {
        router.push(`/space/${data.id}?theme=${selectedTheme}`);
      }
    }
    setIsCreating(false);
  };

  const handleDeleteSpace = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que deseas eliminar esta mesa? Esto no se puede deshacer.')) {
      await supabase.from('spaces').delete().eq('id', id);
      setSpaces(spaces.filter(s => s.id !== id));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-cafetin-cream p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-cafetin-dark font-poppins">Mis Mesas de Café</h1>
          <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut size={18} />
            Cerrar Sesión
          </Button>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 border-2 border-dashed border-cafetin-light/50 bg-transparent flex flex-col justify-center items-center text-center p-8">
            <div className="bg-white p-4 rounded-full shadow-md mb-4 text-cafetin-orange">
              <Plus size={32} />
            </div>
            <h3 className="font-bold text-cafetin-dark mb-4">Nueva Mesa</h3>
            <form onSubmit={handleCreateSpace} className="w-full flex flex-col gap-3">
              <Input
                placeholder="Ej. Clase de Historia"
                value={newSpaceName}
                onChange={(e) => setNewSpaceName(e.target.value)}
                required
              />
              <div className="text-left mb-2">
                <label className="text-xs font-bold text-gray-500 ml-1">Tiempo de Exposición</label>
                <div className="flex gap-2 mt-1 justify-center">
                  <div className="flex flex-col items-center">
                    <Input type="number" min="0" max="23" value={timerHours} onChange={(e) => setTimerHours(e.target.value)} className="w-16 text-center px-1" />
                    <span className="text-[10px] text-gray-400">hs</span>
                  </div>
                  <span className="text-xl font-bold mt-2">:</span>
                  <div className="flex flex-col items-center">
                    <Input type="number" min="0" max="59" value={timerMinutes} onChange={(e) => setTimerMinutes(e.target.value)} className="w-16 text-center px-1" />
                    <span className="text-[10px] text-gray-400">min</span>
                  </div>
                  <span className="text-xl font-bold mt-2">:</span>
                  <div className="flex flex-col items-center">
                    <Input type="number" min="0" max="59" value={timerSeconds} onChange={(e) => setTimerSeconds(e.target.value)} className="w-16 text-center px-1" />
                    <span className="text-[10px] text-gray-400">seg</span>
                  </div>
                </div>
              </div>
              <div className="text-left mb-6">
                <label className="text-xs font-bold text-gray-500 ml-1">Estilo de la Mesa</label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-[220px] overflow-y-auto p-1 custom-scrollbar">
                  {TABLE_THEMES.map((theme) => {
                    return (
                      <div 
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme.id)}
                        className={`cursor-pointer rounded-2xl border-4 overflow-hidden flex flex-col items-center justify-center transition-transform hover:scale-[1.02] ${selectedTheme === theme.id ? 'border-cafetin-orange shadow-lg' : 'border-transparent hover:shadow-md'}`}
                      >
                        <img src={`/img/${theme.file}`} alt={theme.name} className="w-full h-auto object-cover" />
                      </div>
                    );
                  })}
                </div>
              </div>
              <Button type="submit" variant="primary" isLoading={isCreating} fullWidth>
                Crear y Entrar
              </Button>
            </form>
          </Card>

          <div className="md:col-span-2 flex flex-col gap-4">
            {isLoading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-20 bg-cafetin-light/20 rounded-xl"></div>
                  <div className="h-20 bg-cafetin-light/20 rounded-xl"></div>
                </div>
              </div>
            ) : spaces.length === 0 ? (
              <div className="text-center py-12 text-cafetin-light">
                No tienes ninguna mesa creada aún.
              </div>
            ) : (
              spaces.map((space) => (
                <div key={space.id} onClick={() => router.push(`/space/${space.id}`)} className="cursor-pointer">
                  <Card className="flex justify-between items-center hover:border-cafetin-orange transition-colors group">
                  <div>
                    <h3 className="font-bold text-lg text-cafetin-dark">{space.name}</h3>
                    <p className="text-sm text-cafetin-light">
                      Creada el {new Date(space.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      space.status === 'active' ? 'bg-green-100 text-green-700' :
                      space.status === 'finished' ? 'bg-gray-100 text-gray-700' :
                      'bg-cafetin-orange/20 text-cafetin-dark'
                    }`}>
                      {space.status === 'waiting' ? 'En Espera' : space.status === 'active' ? 'Activa' : 'Finalizada'}
                    </div>
                    <button 
                      onClick={(e) => handleDeleteSpace(e, space.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      title="Eliminar Mesa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </Card>
              </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
