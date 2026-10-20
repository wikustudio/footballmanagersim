import { sounds } from './soundEffects';

export const playSound = (type?: string) => {
  if (type === 'cash' || type === 'success') {
    sounds.playCashRegister();
  } else if (type === 'error' || type === 'warning') {
    sounds.playExpenseThud();
  } else if (type === 'victory') {
    sounds.playVictory();
  } else {
    sounds.playClick();
  }
};
