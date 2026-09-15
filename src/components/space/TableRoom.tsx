import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/store';
import { Button } from '@/components/ui/Button';
import { Users, ClipboardList, Coffee, Zap, ChessKnight, Star, Glasses, Sun, Droplet, Leaf, CheckCircle, Crown } from 'lucide-react';
import { createAvatar } from '@dicebear/core';
import { micah, bottts, adventurer, avataaars, lorelei, pixelArt } from '@dicebear/collection';
import RaffleModal from './RaffleModal';
import TimerScreen from './TimerScreen';
import EvaluationModal from './EvaluationModal';
import CloseSpaceModal from './CloseSpaceModal';

interface TableRoomProps {
  spaceId: string;
  isHost: boolean;
}

const getAvatarStyle = (styleName: string) => {
  switch (styleName) {
    case 'bottts': return bottts;
    case 'adventurer': return adventurer;
    case 'avataaars': return avataaars;
    case 'lorelei': return lorelei;
    case 'pixelArt': return pixelArt;
    default: return micah;
  }
};

const getTableThemeStyles = (theme: string) => {
  switch(theme) {
    case 'cyberpunk': return 'bg-black border-cyan-900 shadow-[inset_0_0_50px_rgba(0,255,255,0.2)] text-cyan-400';
    case 'madera_clasica': return 'bg-[#8D6E63] border-[#5D4037] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] text-[#3E2723]';
    case 'minimalista': return 'bg-[#fafafa] border-white shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] text-gray-400';
    case 'picnic_creativo': return 'bg-[#e57373] border-[#c62828] shadow-inner text-white';
    case 'picnic_natural': return 'bg-[#81c784] border-[#388e3c] shadow-inner text-green-900';
    case 'marmol_blanco': return 'bg-[#f5f5f5] border-[#e0e0e0] shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] text-gray-400';
    case 'metal_oscuro': return 'bg-[#424242] border-[#212121] shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] text-gray-900';
    case 'cafetin':
    default: return 'bg-[#EFEBE9] border-[#D7CCC8] shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] text-orange-900/50';
  }
};

const getTableThemeIcon = (theme: string) => {
  switch(theme) {
    case 'cyberpunk': return <Zap size={100} strokeWidth={1} />;
    case 'minimalista': return <ChessKnight size={100} strokeWidth={1} />;
    case 'picnic_creativo': return <Star size={100} strokeWidth={1} />;
    case 'madera_clasica': return <Glasses size={100} strokeWidth={1} />;
    case 'marmol_blanco': return <Sun size={100} strokeWidth={1} />;
    case 'metal_oscuro': return <Droplet size={100} strokeWidth={1} />;
    case 'picnic_natural': return <Leaf size={100} strokeWidth={1} />;
    case 'cafetin':
    default: return <Coffee size={100} strokeWidth={1} />;
  }
};

const getBackgroundThemeProps = (theme: string): { className: string; style?: React.CSSProperties } => {
  switch(theme) {
    case 'cyberpunk': return {
      className: 'bg-[#0a0a1a]',
      style: {
        backgroundImage: 'url(/img/bg_cyberpunk.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }
    };
    case 'minimalista': return {
      className: 'bg-[#fafafa]',
      style: {
        backgroundImage: 'url(/img/bg_minimalista.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }
    };
    case 'picnic_creativo': return {
      className: 'bg-[#f1f8f1]',
      style: {
        backgroundImage: 'url(/img/bg_picnic_creativo.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }
    };
    case 'picnic_natural': return {
      className: 'bg-[#e8f5e9]',
      style: {
        backgroundImage: 'url(/img/bg_picnic_natural.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }
    };
    case 'madera_clasica': return {
      className: 'bg-[#f4efe8]',
      style: {
        backgroundImage: 'url(/img/bg_madera_clasica.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }
    };
    case 'marmol_blanco': return {
      className: 'bg-[#fcfcfc]',
      style: {
        backgroundImage: 'url(/img/bg_marmol_blanco.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }
    };
    case 'metal_oscuro': return {
      className: 'bg-[#1a1a1a]',
      style: {
        backgroundImage: 'url(/img/bg_metal_oscuro.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }
    };
    case 'cafetin':
    default: return {
      className: 'bg-[#fdfaf6]',
      style: {
        backgroundImage: 'url(/img/bg_cafetin.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }
    };
  }
};

export default function TableRoom({ spaceId, isHost }: TableRoomProps) {
  const searchParams = useSearchParams();
  const tableTheme = searchParams.get('theme') || 'cafetin';

  const { guests, setGuests, addGuest, updateGuestStatus, updateGuestTraits } = useStore();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [spaceData, setSpaceData] = useState<any>(null);
  
  const [raffleWinner, setRaffleWinner] = useState<any>(null);
  const [isRaffleOpen, setIsRaffleOpen] = useState(false);
  const [timerEndsAt, setTimerEndsAt] = useState<number | null>(null);
  const [isEvalOpen, setIsEvalOpen] = useState(false);

  const [isEditingTimer, setIsEditingTimer] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [editTimerHours, setEditTimerHours] = useState('0');
  const [editTimerMinutes, setEditTimerMinutes] = useState('0');
  const [editTimerSeconds, setEditTimerSeconds] = useState('0');

  const [tableRadius, setTableRadius] = useState(250);

  const currentGuestId = typeof window !== 'undefined' ? localStorage.getItem(`cafetin_guest_${spaceId}`) : null;
  const currentGuest = guests.find(g => g.id === currentGuestId);
  const isCoHost = !!currentGuest?.avatar_traits?.isCoHost;
  const hasAdminRights = isHost || isCoHost;

  useEffect(() => {
    const handleResize = () => setTableRadius(window.innerWidth < 768 ? 150 : 250);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: sData } = await supabase.from('spaces').select('*').eq('id', spaceId).single();
      if (sData) {
        setSpaceData(sData);
        if (sData.timer_duration) {
          const h = Math.floor(sData.timer_duration / 3600);
          const m = Math.floor((sData.timer_duration % 3600) / 60);
          const s = sData.timer_duration % 60;
          setEditTimerHours(h.toString());
          setEditTimerMinutes(m.toString());
          setEditTimerSeconds(s.toString());
        }
      }

      const { data: gData } = await supabase.from('guests').select('*').eq('space_id', spaceId);
      if (gData) setGuests(gData);
    };
    fetchInitialData();

    const guestSubscription = supabase
      .channel(`space_${spaceId}_db`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guests', filter: `space_id=eq.${spaceId}` }, (payload) => {
        addGuest(payload.new as any);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'guests', filter: `space_id=eq.${spaceId}` }, (payload) => {
        updateGuestStatus(payload.new.id, payload.new.status);
      })
      .subscribe();

    const presenceChannel = supabase.channel(`presence_${spaceId}`, {
      config: { presence: { key: isHost ? 'host' : localStorage.getItem(`cafetin_guest_${spaceId}`) || 'unknown' } },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        setOnlineUsers(Object.keys(state));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ online_at: new Date().toISOString() });
        }
      });

    const broadcastChannel = supabase.channel(`broadcast_${spaceId}`)
      .on('broadcast', { event: 'guest_joined' }, ({ payload }) => {
        // Prevent duplicate adds by checking if guest already exists (Zustand addGuest can append, but let's check first)
        const exists = useStore.getState().guests.some(g => g.id === payload.guest.id);
        if (!exists) {
          addGuest(payload.guest);
        }
      })
      .on('broadcast', { event: 'cohost_promoted' }, ({ payload }) => {
        updateGuestTraits(payload.guestId, payload.traits);
      })
      .on('broadcast', { event: 'request_criteria' }, () => {
        if (isHost) {
          const saved = localStorage.getItem(`cafetin_criteria_${spaceId}`);
          if (saved) {
            supabase.channel(`broadcast_${spaceId}`).send({
              type: 'broadcast',
              event: 'sync_criteria',
              payload: { criteriaList: JSON.parse(saved) }
            });
          }
        }
      })
      .on('broadcast', { event: 'sync_criteria' }, ({ payload }) => {
        if (!isHost) {
          localStorage.setItem(`cafetin_criteria_${spaceId}`, JSON.stringify(payload.criteriaList));
          window.dispatchEvent(new CustomEvent('cafetin_sync_criteria', { detail: payload.criteriaList }));
        }
      })
      .on('broadcast', { event: 'raffle_start' }, ({ payload }) => {
        setRaffleWinner(payload.winner);
        setIsRaffleOpen(true);
      })
      .on('broadcast', { event: 'raffle_cancel' }, () => {
        setIsRaffleOpen(false);
        setRaffleWinner(null);
      })
      .on('broadcast', { event: 'timer_start' }, ({ payload }) => {
        setIsRaffleOpen(false);
        setTimerEndsAt(payload.endsAt);
        if (payload.speakingGuestId) {
          updateGuestStatus(payload.speakingGuestId, 'speaking');
        }
      })
      .on('broadcast', { event: 'timer_finish' }, ({ payload }) => {
        setTimerEndsAt(null);
        setRaffleWinner(null);
        if (payload?.finishedGuestId) {
          updateGuestStatus(payload.finishedGuestId, 'finished');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(guestSubscription);
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(broadcastChannel);
    };
  }, [spaceId, isHost]);

  const handleSorteo = async () => {
    const hostGuestId = localStorage.getItem(`cafetin_guest_${spaceId}`);
    const availableGuests = guests.filter(g => g.status === 'waiting' && g.id !== hostGuestId);
    
    if (availableGuests.length === 0) {
      alert("¡No hay invitados disponibles para sortear!");
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * availableGuests.length);
    const winner = availableGuests[randomIndex];
    
    // Auto-echo local
    setRaffleWinner(winner);
    setIsRaffleOpen(true);
    
    await supabase.channel(`broadcast_${spaceId}`).send({
      type: 'broadcast',
      event: 'raffle_start',
      payload: { winner }
    });
  };

  const handleCancelRaffle = async () => {
    setIsRaffleOpen(false);
    setRaffleWinner(null);
    
    await supabase.channel(`broadcast_${spaceId}`).send({
      type: 'broadcast',
      event: 'raffle_cancel',
      payload: {}
    });
  };

  const handleStartTimer = async () => {
    if (!raffleWinner) return;
    
    await supabase.from('guests').update({ status: 'speaking' }).eq('id', raffleWinner.id);

    const duration = spaceData?.timer_duration ? spaceData.timer_duration * 1000 : 60000;
    const endsAt = Date.now() + duration; 
    
    // Auto-echo local
    updateGuestStatus(raffleWinner.id, 'speaking');
    setIsRaffleOpen(false);
    setTimerEndsAt(endsAt);
    
    await supabase.channel(`broadcast_${spaceId}`).send({
      type: 'broadcast',
      event: 'timer_start',
      payload: { endsAt, speakingGuestId: raffleWinner.id }
    });
  };

  const handleTimerFinish = async () => {
    if (raffleWinner && hasAdminRights) {
      await supabase.from('guests').update({ status: 'finished' }).eq('id', raffleWinner.id);
      
      // Auto-echo local
      updateGuestStatus(raffleWinner.id, 'finished');
      setTimerEndsAt(null);
      setRaffleWinner(null);

      await supabase.channel(`broadcast_${spaceId}`).send({
        type: 'broadcast',
        event: 'timer_finish',
        payload: { finishedGuestId: raffleWinner.id }
      });
    } else if (!hasAdminRights) {
        setTimerEndsAt(null);
        setRaffleWinner(null);
    }
  };

  const handleMakeCoHost = async (guestId: string, currentTraits: any) => {
    if (!isHost) return; // Sólo el Host principal puede dar co-host
    
    const newTraits = { ...currentTraits, isCoHost: true };
    await supabase.from('guests').update({ avatar_traits: newTraits }).eq('id', guestId);
    
    // Auto-echo local
    updateGuestTraits(guestId, newTraits);
    
    // Broadcast to update others without reloading
    await supabase.channel(`broadcast_${spaceId}`).send({
      type: 'broadcast',
      event: 'cohost_promoted',
      payload: { guestId, traits: newTraits }
    });
  };

  const handleSaveTimer = async () => {
    const totalSecs = (parseInt(editTimerHours) || 0) * 3600 + (parseInt(editTimerMinutes) || 0) * 60 + (parseInt(editTimerSeconds) || 0);
    await supabase.from('spaces').update({ timer_duration: totalSecs }).eq('id', spaceId);
    setSpaceData({ ...spaceData, timer_duration: totalSecs });
    setIsEditingTimer(false);
  };
  
  const bgTheme = getBackgroundThemeProps(tableTheme);

  return (
    <div className={`min-h-screen flex overflow-hidden transition-colors duration-1000 ${bgTheme.className}`} style={bgTheme.style}>
      {/* Main Table Area */}
      <div className="flex-1 flex flex-col p-6 relative overflow-y-auto">
        <header className="flex justify-between items-center mb-8 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-cafetin-orange font-poppins">{spaceData?.name || 'Mesa'}</h1>
            {spaceData && (
              <span className="bg-white px-3 py-1 rounded-full text-sm font-semibold text-cafetin-dark shadow-sm">
                {spaceData.status === 'active' ? 'Mesa Activa' : 'Mesa en Espera'}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-full border border-gray-200/50 shadow-sm">
            {hasAdminRights && (
              <>
                <Button variant="ghost" size="sm" onClick={() => setIsEditingTimer(true)} className="rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-all gap-2 px-4 font-medium hidden sm:flex">
                    <Coffee size={16} /> Editar Tiempo
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingTimer(true)} className="rounded-full hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-all px-3 sm:hidden" title="Editar Tiempo">
                    <Coffee size={16} />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("¡Enlace copiado! Envíalo a tus invitados.");
                    }} 
                    className="rounded-full hover:bg-cafetin-teal/10 text-cafetin-teal hover:text-cafetin-teal transition-all gap-2 px-4 font-medium hidden sm:flex"
                  >
                    <Users size={16} /> Copiar Link
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("¡Enlace copiado! Envíalo a tus invitados.");
                    }} 
                    className="rounded-full hover:bg-cafetin-teal/10 text-cafetin-teal hover:text-cafetin-teal transition-all px-3 sm:hidden"
                    title="Copiar Link"
                  >
                    <Users size={16} />
                  </Button>

                  <Button variant="ghost" size="sm" onClick={() => setIsEvalOpen(true)} className="rounded-full hover:bg-cafetin-orange/10 text-cafetin-orange hover:text-cafetin-orange transition-all gap-2 px-4 font-medium hidden sm:flex">
                    <ClipboardList size={16} /> Evaluación
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsEvalOpen(true)} className="rounded-full hover:bg-cafetin-orange/10 text-cafetin-orange hover:text-cafetin-orange transition-all px-3 sm:hidden" title="Evaluación">
                    <ClipboardList size={16} />
                  </Button>

                  {isHost && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => setIsCloseModalOpen(true)} className="rounded-full hover:bg-red-500/10 text-red-600 hover:text-red-700 transition-all gap-2 px-4 font-medium hidden sm:flex">
                        <CheckCircle size={16} /> Terminar Mesa
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setIsCloseModalOpen(true)} className="rounded-full hover:bg-red-500/10 text-red-600 hover:text-red-700 transition-all px-3 sm:hidden" title="Terminar Mesa">
                        <CheckCircle size={16} />
                      </Button>
                    </>
                  )}
                  
                  <div className="w-px h-6 bg-gray-200 mx-1"></div>
                </>
              )}
              
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/dashboard'} className="rounded-full hover:bg-red-50 text-red-600 hover:text-red-700 transition-all gap-2 px-4 font-medium hidden sm:flex">
                Salir
              </Button>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/dashboard'} className="rounded-full hover:bg-red-50 text-red-600 hover:text-red-700 transition-all px-3 sm:hidden" title="Salir">
                <span className="font-bold text-lg leading-none">&times;</span>
              </Button>
            </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[700px] py-24">
          {/* Round Table UI */}
          <div className={`w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full border-[16px] relative flex items-center justify-center transition-colors duration-1000 shrink-0 ${getTableThemeStyles(tableTheme)}`}>
            {!timerEndsAt && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                {getTableThemeIcon(tableTheme)}
              </div>
            )}
            
            {/* Render Guests around the table */}
            {!timerEndsAt && guests.map((guest, index) => {
              const angle = (index / guests.length) * 2 * Math.PI - Math.PI / 2;
              const radius = tableRadius + 32; // Seat them slightly outside the table
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const isOnline = onlineUsers.includes(guest.id);
              
              const seed = guest.avatar_traits?.seed || guest.id;
              const styleName = guest.avatar_traits?.style || 'micah';
              const avatarSvg = createAvatar(getAvatarStyle(styleName) as any, { seed, backgroundColor: ["F8F5EF"] }).toString();

              const isWinner = raffleWinner?.id === guest.id;
              const isSpeaking = guest.status === 'speaking';
              const isHighlighted = isWinner || isSpeaking;

              return (
                <motion.div
                  key={guest.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1, x, y }}
                  transition={{ type: 'spring', damping: 20 }}
                  className={`absolute left-1/2 top-1/2 w-20 h-24 -ml-10 -mt-12 rounded-[24px] shadow-xl flex items-center justify-center transition-all duration-300 ${isHighlighted ? 'bg-gradient-to-b from-[#FAD961] to-[#E91E63] shadow-[0_0_25px_rgba(239,124,0,0.8)] z-20 scale-110' : isOnline ? 'bg-gradient-to-b from-[#FDEB71] to-[#F8D800] z-10' : 'bg-gray-300 opacity-50'}`}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/50 bg-white">
                    <img src={`data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg)}`} alt={guest.name} className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Seat Number */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-black/80 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                    {index + 1}
                  </div>

                  {/* Name Tag */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white text-cafetin-dark text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                    {guest.name}
                  </div>

                  {/* Indicador de estado */}
                  {guest.status === 'finished' && (
                    <div className="absolute inset-0 bg-black/40 rounded-[24px] flex items-center justify-center">
                      <span className="text-white text-xl">✅</span>
                    </div>
                  )}
                  {isSpeaking && (
                    <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full w-4 h-4 animate-pulse border-2 border-white" />
                  )}
                </motion.div>
              );
            })}

            {timerEndsAt && raffleWinner && (
              <TimerScreen 
                endTime={timerEndsAt} 
                guestName={raffleWinner.name} 
                isHost={isHost} 
                avatarTraits={raffleWinner.avatar_traits}
                guestId={raffleWinner.id}
                onFinish={handleTimerFinish} 
              />
            )}
          </div>
        </div>

        {isHost && !timerEndsAt && (
          <div className="mt-24 md:mt-32 flex justify-center shrink-0 z-10">
            <Button variant="primary" size="lg" className="shadow-2xl px-12 py-6 text-xl rounded-full" onClick={handleSorteo}>
              ¡Sortear Turno!
            </Button>
          </div>
        )}
      </div>

      {/* Sidebar - Invitados en tiempo real */}
      <div className="w-80 bg-white border-l border-cafetin-light/20 p-6 flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-cafetin-dark font-poppins flex items-center gap-2">
            <Users size={18} />
            Invitados
          </h2>
          <span className="bg-cafetin-cream text-cafetin-dark px-2 py-1 rounded text-xs font-bold">
            {guests.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {guests.map(guest => {
            const isOnline = onlineUsers.includes(guest.id);
            const seed = guest.avatar_traits?.seed || guest.id;
            const styleName = guest.avatar_traits?.style || 'micah';
            const avatarSvg = createAvatar(getAvatarStyle(styleName) as any, { seed, backgroundColor: ["F8F5EF"] }).toString();

            return (
              <div key={guest.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-cafetin-cream transition-colors group">
                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative flex-shrink-0">
                  <img src={`data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg)}`} alt={guest.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-cafetin-dark truncate flex items-center gap-1">
                    {guest.name}
                    {guest.avatar_traits?.isCoHost && <Crown size={12} className="text-cafetin-orange" />}
                  </p>
                  <p className="text-xs text-cafetin-light capitalize">{guest.status === 'waiting' ? 'En espera' : guest.status === 'speaking' ? 'Hablando' : 'Ya participó'}</p>
                </div>
                
                {isHost && !guest.avatar_traits?.isCoHost && (
                  <button 
                    onClick={() => handleMakeCoHost(guest.id, guest.avatar_traits)} 
                    title="Hacer Co-Host" 
                    className="hidden group-hover:block p-1 text-cafetin-orange bg-white rounded-full shadow-sm hover:scale-110 transition-transform"
                  >
                    <Crown size={14} />
                  </button>
                )}
                
                <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`} title={isOnline ? 'Conectado' : 'Desconectado'} />
              </div>
            );
          })}
          {guests.length === 0 && (
            <p className="text-sm text-cafetin-light text-center mt-10">Esperando invitados...</p>
          )}
        </div>
      </div>

      {raffleWinner && (
        <RaffleModal
          isOpen={isRaffleOpen}
          winner={raffleWinner}
          onCancel={handleCancelRaffle}
          isHost={hasAdminRights}
          onNext={handleStartTimer}
        />
      )}

      {hasAdminRights && isEditingTimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-sm">
            <h2 className="text-xl font-bold text-cafetin-dark mb-4 text-center">Configurar Tiempo</h2>
            <div className="flex gap-2 mb-6 items-center justify-center">
              <div className="flex flex-col items-center">
                <input type="number" min="0" max="23" value={editTimerHours} onChange={e => setEditTimerHours(e.target.value)} className="w-16 h-16 text-center text-2xl font-bold rounded-lg border-2 border-gray-200 focus:border-cafetin-teal focus:outline-none" />
                <span className="text-xs text-gray-500 font-bold mt-1 uppercase">Horas</span>
              </div>
              <span className="text-2xl font-bold text-gray-400 mb-5">:</span>
              <div className="flex flex-col items-center">
                <input type="number" min="0" max="59" value={editTimerMinutes} onChange={e => setEditTimerMinutes(e.target.value)} className="w-16 h-16 text-center text-2xl font-bold rounded-lg border-2 border-gray-200 focus:border-cafetin-teal focus:outline-none" />
                <span className="text-xs text-gray-500 font-bold mt-1 uppercase">Min</span>
              </div>
              <span className="text-2xl font-bold text-gray-400 mb-5">:</span>
              <div className="flex flex-col items-center">
                <input type="number" min="0" max="59" value={editTimerSeconds} onChange={e => setEditTimerSeconds(e.target.value)} className="w-16 h-16 text-center text-2xl font-bold rounded-lg border-2 border-gray-200 focus:border-cafetin-teal focus:outline-none" />
                <span className="text-xs text-gray-500 font-bold mt-1 uppercase">Seg</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditingTimer(false)}>Cancelar</Button>
              <Button variant="primary" onClick={handleSaveTimer}>Guardar</Button>
            </div>
          </div>
        </div>
      )}

      {hasAdminRights && (
        <>
          <EvaluationModal
            isOpen={isEvalOpen}
            onClose={() => setIsEvalOpen(false)}
            spaceId={spaceId}
            isHost={isHost}
          />
          <CloseSpaceModal
            isOpen={isCloseModalOpen}
            onClose={() => setIsCloseModalOpen(false)}
            spaceId={spaceId}
            spaceName={spaceData?.name || ''}
            guests={guests}
          />
        </>
      )}
    </div>
  );
}
