import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { createAvatar } from '@dicebear/core';
import { micah, bottts, adventurer, avataaars, lorelei, pixelArt } from '@dicebear/collection';

interface RaffleModalProps {
  isOpen: boolean;
  winner: any;
  onCancel: () => void;
  isHost: boolean;
  onNext: () => void;
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

export default function RaffleModal({ isOpen, winner, onCancel, isHost, onNext }: RaffleModalProps) {
  const [showWinner, setShowWinner] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowWinner(false);
      // Simulate spinning time before revealing the winner
      const timer = setTimeout(() => {
        setShowWinner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const winnerSeed = winner?.avatar_traits?.seed || winner?.id || 'default';
  const winnerStyle = winner?.avatar_traits?.style || 'micah';
  const winnerSvg = createAvatar(getAvatarStyle(winnerStyle) as any, { seed: winnerSeed, backgroundColor: ["F8F5EF"] }).toString();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* Confetti Background effect when winner is shown */}
          {showWinner && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(239,124,0,0.1) 0%, rgba(255,255,255,0) 70%)'
              }}
            />
          )}

          <h2 className="text-2xl font-bold text-cafetin-dark mb-8 font-poppins">
            {showWinner ? '¡Tenemos un ganador!' : 'Sorteando turno...'}
          </h2>

          <div className="relative w-40 h-40 mb-8">
            {!showWinner ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                className="w-full h-full rounded-full border-[8px] border-cafetin-light/20 border-t-cafetin-teal border-r-cafetin-orange"
              />
            ) : (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-full h-full rounded-full bg-white border-4 border-cafetin-orange shadow-xl overflow-hidden relative"
              >
                <img src={`data:image/svg+xml;utf8,${encodeURIComponent(winnerSvg)}`} alt="Winner Avatar" className="w-full h-full object-cover" />
              </motion.div>
            )}
          </div>

          <div className="h-16 mb-4">
            {showWinner && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <p className="text-3xl font-bold text-cafetin-dark">{winner?.name}</p>
                <p className="text-cafetin-light text-sm mt-1">¡Es tu momento de brillar!</p>
              </motion.div>
            )}
          </div>

          <div className="w-full mt-4 flex gap-3">
            {showWinner && isHost ? (
              <>
                <Button variant="outline" fullWidth onClick={onCancel}>Cancelar</Button>
                <Button variant="primary" fullWidth onClick={onNext}>Iniciar Tiempo</Button>
              </>
            ) : showWinner && !isHost ? (
              <div className="w-full text-center text-cafetin-light text-sm animate-pulse">
                Esperando al anfitrión...
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
