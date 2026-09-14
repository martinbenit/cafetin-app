import { create } from 'zustand';

interface Guest {
  id: string;
  name: string;
  avatar_traits: any;
  status: 'waiting' | 'speaking' | 'finished';
}

interface AppState {
  spaceId: string | null;
  hostId: string | null;
  guests: Guest[];
  setSpaceId: (id: string) => void;
  setHostId: (id: string) => void;
  setGuests: (guests: Guest[]) => void;
  addGuest: (guest: Guest) => void;
  updateGuestStatus: (id: string, status: Guest['status']) => void;
}

export const useStore = create<AppState>((set) => ({
  spaceId: null,
  hostId: null,
  guests: [],
  setSpaceId: (id) => set({ spaceId: id }),
  setHostId: (id) => set({ hostId: id }),
  setGuests: (guests) => set({ guests }),
  addGuest: (guest) => set((state) => ({ guests: [...state.guests, guest] })),
  updateGuestStatus: (id, status) => set((state) => ({
    guests: state.guests.map((g) => g.id === id ? { ...g, status } : g)
  })),
}));
