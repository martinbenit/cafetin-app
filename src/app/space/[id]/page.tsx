'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/store';
import JoinScreen from '@/components/space/JoinScreen';
import TableRoom from '@/components/space/TableRoom';

export default function SpacePage() {
  const { id } = useParams() as { id: string };
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [spaceFound, setSpaceFound] = useState(true);
  
  // Local state to track if guest has joined in this session
  const [hasJoined, setHasJoined] = useState(false);
  const { setSpaceId, setHostId } = useStore();

  useEffect(() => {
    checkAccess();
  }, [id]);

  const checkAccess = async () => {
    // 1. Get space info
    const { data: space, error: spaceError } = await supabase
      .from('spaces')
      .select('*')
      .eq('id', id)
      .single();

    if (spaceError || !space) {
      setSpaceFound(false);
      setIsLoading(false);
      return;
    }

    setSpaceId(id);

    // 2. Check if current user is the host
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id === space.host_id) {
      setIsHost(true);
      setHostId(user.id);
      setHasJoined(true); // Host doesn't need to join
    } else {
      // It's a guest. Check if they already joined in this browser session
      const storedGuestId = localStorage.getItem(`cafetin_guest_${id}`);
      if (storedGuestId) {
        setHasJoined(true);
      }
    }
    
    setIsLoading(false);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-cafetin-cream flex items-center justify-center">Cargando la mesa...</div>;
  }

  if (!spaceFound) {
    return <div className="min-h-screen bg-cafetin-cream flex items-center justify-center text-xl text-cafetin-dark font-poppins">Mesa no encontrada</div>;
  }

  if (!hasJoined) {
    return <JoinScreen spaceId={id} onJoin={() => setHasJoined(true)} />;
  }

  return <TableRoom spaceId={id} isHost={isHost} />;
}
