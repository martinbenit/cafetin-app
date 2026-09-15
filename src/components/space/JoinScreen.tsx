import { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Coffee } from 'lucide-react';
import { createAvatar } from '@dicebear/core';
import { micah, bottts, adventurer, avataaars, lorelei, pixelArt } from '@dicebear/collection';

interface JoinScreenProps {
  spaceId: string;
  onJoin: () => void;
}

const PRESET_OPTIONS = [
  ...Array.from({length: 10}, (_, i) => ({ seed: `micah_${i}`, style: micah, styleName: 'micah' })),
  ...Array.from({length: 10}, (_, i) => ({ seed: `bottts_${i}`, style: bottts, styleName: 'bottts' })),
  ...Array.from({length: 10}, (_, i) => ({ seed: `adventurer_${i}`, style: adventurer, styleName: 'adventurer' })),
  ...Array.from({length: 10}, (_, i) => ({ seed: `avataaar_${i}`, style: avataaars, styleName: 'avataaars' })),
  ...Array.from({length: 10}, (_, i) => ({ seed: `lorelei_${i}`, style: lorelei, styleName: 'lorelei' })),
  ...Array.from({length: 10}, (_, i) => ({ seed: `pixelArt_${i}`, style: pixelArt, styleName: 'pixelArt' })),
];

// Shuffle array and pick random initial
const shuffledOptions = [...PRESET_OPTIONS].sort(() => Math.random() - 0.5);

export default function JoinScreen({ spaceId, onJoin }: JoinScreenProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Pick a random avatar from the 60 options when mounting
  const [selectedAvatar, setSelectedAvatar] = useState(shuffledOptions[0]);
  const [showOptions, setShowOptions] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);

    const { data, error } = await supabase
      .from('guests')
      .insert([{ 
        space_id: spaceId, 
        name: name.trim(),
        avatar_traits: { seed: selectedAvatar.seed, style: selectedAvatar.styleName }
      }])
      .select()
      .single();

    if (data && !error) {
      localStorage.setItem(`cafetin_guest_${spaceId}`, data.id);
      localStorage.setItem(`cafetin_guest_name_${spaceId}`, data.name);
      localStorage.setItem(`cafetin_guest_seed_${spaceId}`, JSON.stringify({ seed: selectedAvatar.seed, style: selectedAvatar.styleName }));
      
      // Workaround: explicitly broadcast the join event in case postgres_changes isn't enabled for the table
      await supabase.channel(`broadcast_${spaceId}`).send({
        type: 'broadcast',
        event: 'guest_joined',
        payload: { guest: data }
      });

      onJoin();
    } else {
      console.error(error);
      alert("Error al unirse: " + error?.message);
    }
    
    setIsLoading(false);
  };

  const avatarUrl = useMemo(() => {
    return `data:image/svg+xml;utf8,${encodeURIComponent(createAvatar(selectedAvatar.style as any, { seed: selectedAvatar.seed, backgroundColor: ["F8F5EF"] }).toString())}`;
  }, [selectedAvatar]);

  return (
    <div className="min-h-screen bg-cafetin-cream flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <Coffee size={28} className="text-cafetin-dark" />
            <h1 className="text-3xl font-bold text-cafetin-dark font-poppins">Cafetin</h1>
          </div>
        </div>

        <Card className="text-center">
          <h2 className="text-xl font-bold text-cafetin-dark mb-2">¡Bienvenido a la Mesa de Café!</h2>
          <p className="text-sm text-cafetin-light mb-6">Ingresa tu nombre y elige tu avatar.</p>

          <form onSubmit={handleJoin} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-white border-4 border-cafetin-teal shadow-sm relative transition-transform hover:scale-105 cursor-pointer flex-shrink-0" onClick={() => setShowOptions(!showOptions)}>
                <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
              </div>
              
              {!showOptions ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowOptions(true)} className="mt-2 text-cafetin-light hover:text-cafetin-dark">
                  Explorar Avatares
                </Button>
              ) : (
                <div className="w-full mt-4">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-xs font-semibold text-cafetin-dark uppercase tracking-wider">Elige tu estilo</span>
                    <button type="button" onClick={() => setShowOptions(false)} className="text-xs text-cafetin-teal hover:underline">Ocultar</button>
                  </div>
                  <div className="grid grid-cols-5 gap-3 w-full bg-cafetin-cream/80 p-3 rounded-2xl border border-cafetin-light/20 max-h-56 overflow-y-auto shadow-inner custom-scrollbar">
                    {PRESET_OPTIONS.map((preset) => {
                      const presetUrl = `data:image/svg+xml;utf8,${encodeURIComponent(createAvatar(preset.style as any, { seed: preset.seed, backgroundColor: ["F8F5EF"] }).toString())}`;
                      return (
                        <div 
                          key={preset.seed}
                          onClick={() => setSelectedAvatar(preset)}
                          className={`aspect-square cursor-pointer rounded-full overflow-hidden border-2 transition-all ${selectedAvatar.seed === preset.seed ? 'border-cafetin-teal scale-110 shadow-[0_4px_12px_rgba(30,168,150,0.3)] z-10' : 'border-white/50 hover:border-cafetin-teal/50 opacity-80 hover:opacity-100 hover:scale-105'}`}
                        >
                          <img src={presetUrl} alt={`Avatar ${preset.seed}`} className="w-full h-full object-cover bg-white" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Input
              placeholder="Tu nombre y apellido"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={30}
            />

            <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
              Unirme
            </Button>
          </form>
          
          <div className="mt-4 pt-4 border-t border-cafetin-light/10 text-xs text-cafetin-light flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cafetin-teal inline-block"></span>
            Solo toma un minuto
          </div>
        </Card>
      </div>
    </div>
  );
}
