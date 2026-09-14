import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { createAvatar } from '@dicebear/core';
import { micah, bottts, adventurer, avataaars, lorelei, pixelArt } from '@dicebear/collection';

interface TimerScreenProps {
  endTime: number; // timestamp ms
  guestName: string;
  isHost: boolean;
  avatarTraits: any;
  guestId: string;
  onFinish: () => void;
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

export default function TimerScreen({ endTime, guestName, isHost, avatarTraits, guestId, onFinish }: TimerScreenProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [alertLevel, setAlertLevel] = useState<'normal' | 'warning' | 'danger'>('normal');
  
  // Audio context for procedural sounds (royalty free beep)
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Init Audio Context on user interaction (assuming they clicked something to get here)
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        playGameOverSound();
        onFinish();
      } else if (remaining === 60 && alertLevel !== 'warning') {
        setAlertLevel('warning');
        playBeep(440, 'short');
      } else if (remaining === 30) {
        playBeep(440, 'short');
      } else if (remaining <= 10 && remaining > 0) {
        setAlertLevel('danger');
        playBeep(880, 'short');
      }

    }, 500); // 500ms for smoother sync

    return () => clearInterval(interval);
  }, [endTime]);

  const playBeep = (freq: number, type: 'short' | 'long') => {
    if (!audioCtxRef.current) return;
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtxRef.current.currentTime + (type === 'short' ? 0.3 : 1));
    osc.stop(audioCtxRef.current.currentTime + 1);
  };

  const playGameOverSound = () => {
    if (!audioCtxRef.current) return;
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, audioCtxRef.current.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtxRef.current.currentTime + 1);
    
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtxRef.current.currentTime + 1.5);
    osc.stop(audioCtxRef.current.currentTime + 1.5);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const bgColors = {
    normal: 'bg-[#2D211F]',
    warning: 'bg-[#4E342E]',
    danger: 'bg-red-900',
  };

  const seed = avatarTraits?.seed || guestId;
  const styleName = avatarTraits?.style || 'micah';
  const avatarSvg = createAvatar(getAvatarStyle(styleName) as any, { seed, backgroundColor: ["transparent"] }).toString();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`absolute inset-0 z-30 flex flex-col items-center justify-center transition-colors duration-1000 rounded-full overflow-hidden ${bgColors[alertLevel]}`}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
        <img src={`data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg)}`} alt={guestName} className="w-3/4 h-3/4 object-contain" />
      </div>

      <div className="z-10 flex flex-col items-center">
        <div className="text-white/80 font-poppins text-sm md:text-lg mb-2 text-center px-4">
          Es el turno de <span className="font-bold text-white block truncate max-w-[200px] md:max-w-[300px]">{guestName}</span>
        </div>

        <motion.div 
          animate={alertLevel === 'danger' ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
          className={`text-6xl md:text-8xl font-bold font-mono tracking-tighter ${
            alertLevel === 'danger' ? 'text-cafetin-orange' : 'text-white'
          }`}
        >
          {formatTime(timeLeft)}
        </motion.div>

        {isHost && (
          <div className="mt-6">
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white bg-black/20" onClick={onFinish}>
              Finalizar
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
