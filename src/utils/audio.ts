/**
 * Web Audio API synthesizer for VibeFocus chimes.
 * Plays high-quality synth chimes to stay lightweight and offline-friendly.
 */

export function playChimeSuccess() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    
    // Play a dual-tone ascending synth chime
    const triggerTone = (freq: number, start: number, duration: number, type: OscillatorType = 'sine') => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      
      // Pitch glide up slightly for a satisfying energetic chime
      osc.frequency.exponentialRampToValueAtTime(freq * 1.2, start + duration);
      
      gainNode.gain.setValueAtTime(0.15, start);
      gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(start);
      osc.stop(start + duration);
    };

    const now = ctx.currentTime;
    // Ascending melody
    triggerTone(440, now, 0.4, 'triangle'); // A4-like
    triggerTone(554.37, now + 0.15, 0.4, 'sine'); // C#5-like
    triggerTone(659.25, now + 0.3, 0.6, 'sine'); // E5-like
    triggerTone(880, now + 0.45, 0.8, 'sine'); // A5-like
  } catch (e) {
    console.error('Audio chime failed to play', e);
  }
}

export function playLevelUpSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // Sparkling chord sequence for leveling up!
    const triggerArpeggio = (freq: number, delayBy: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delayBy);
      
      gainNode.gain.setValueAtTime(0.12, now + delayBy);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + delayBy + 0.8);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now + delayBy);
      osc.stop(now + delayBy + 0.8);
    };

    triggerArpeggio(261.63, 0);       // C4
    triggerArpeggio(329.63, 0.1);     // E4
    triggerArpeggio(392.00, 0.2);     // G4
    triggerArpeggio(523.25, 0.3);     // C5
    triggerArpeggio(659.25, 0.4);     // E5
    triggerArpeggio(783.99, 0.5);     // G5
    triggerArpeggio(1046.50, 0.6);    // C6
  } catch (e) {
    console.error('Level up audio failed to play', e);
  }
}

export function playClickSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
    
    gainNode.gain.setValueAtTime(0.08, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.08);
  } catch (e) {
    // Quiet failure if blocked
  }
}
