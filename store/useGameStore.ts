import { useSyncExternalStore } from 'react';
import { Club } from '../types';

interface GameStoreSlice {
  club: Club | null;
}

let currentSlice: GameStoreSlice = {
  club: null,
};

const listeners = new Set<() => void>();

export function syncGameStoreClub(club: Club | null | undefined) {
  const nextClub = club ?? null;
  if (
    currentSlice.club === nextClub ||
    (currentSlice.club &&
      nextClub &&
      currentSlice.club.id === nextClub.id &&
      currentSlice.club.baseOvr === nextClub.baseOvr &&
      currentSlice.club.tier === nextClub.tier &&
      currentSlice.club.name === nextClub.name &&
      currentSlice.club.logo === nextClub.logo &&
      currentSlice.club.stadium === nextClub.stadium &&
      currentSlice.club.fanBase === nextClub.fanBase &&
      currentSlice.club.morale === nextClub.morale &&
      currentSlice.club.rep === nextClub.rep &&
      currentSlice.club.academyLevel === nextClub.academyLevel &&
      currentSlice.club.medicalLevel === nextClub.medicalLevel &&
      currentSlice.club.squadSize === nextClub.squadSize &&
      currentSlice.club.color === nextClub.color &&
      currentSlice.club.stadiumName === nextClub.stadiumName)
  ) {
    return;
  }
  currentSlice = { club: nextClub };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): GameStoreSlice {
  return currentSlice;
}

export function useGameStore<T>(selector: (state: GameStoreSlice) => T): T {
  const slice = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return selector(slice);
}
