// Web Audio API Sound Synthesizer for Football Manager Sim

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = false;

  private init() {
    // Disabled audio synthesizer
  }

  public playCashRegister() {}
  public playExpenseThud() {}
  public playClick() {}
  public playVictory() {}
}

export const sounds = new SoundEngine();
