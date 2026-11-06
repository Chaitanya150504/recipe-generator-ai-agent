/**
 * Formats a decimal number into a culinary fraction representation
 * (e.g., 0.5 -> 1/2, 1.25 -> 1 1/4, 2.5 -> 2 1/2)
 */
export function formatFraction(amount: number): string {
  if (amount <= 0) return '0';

  const whole = Math.floor(amount);
  const remainder = amount - whole;

  // Tolerance
  const eps = 0.06;

  let fraction = '';
  if (Math.abs(remainder - 0.125) < eps) fraction = '1/8';
  else if (Math.abs(remainder - 0.166) < eps) fraction = '1/6';
  else if (Math.abs(remainder - 0.2) < eps) fraction = '1/5';
  else if (Math.abs(remainder - 0.25) < eps) fraction = '1/4';
  else if (Math.abs(remainder - 0.333) < eps) fraction = '1/3';
  else if (Math.abs(remainder - 0.375) < eps) fraction = '3/8';
  else if (Math.abs(remainder - 0.5) < eps) fraction = '1/2';
  else if (Math.abs(remainder - 0.625) < eps) fraction = '5/8';
  else if (Math.abs(remainder - 0.666) < eps) fraction = '2/3';
  else if (Math.abs(remainder - 0.75) < eps) fraction = '3/4';
  else if (Math.abs(remainder - 0.833) < eps) fraction = '5/6';
  else if (Math.abs(remainder - 0.875) < eps) fraction = '7/8';

  if (fraction) {
    return whole > 0 ? `${whole} ${fraction}` : fraction;
  }

  // If no common fraction matched, format with up to 1 decimal place or integer
  if (remainder === 0) return whole.toString();
  return (Math.round(amount * 10) / 10).toString();
}

/**
 * Recalculates ingredient quantity based on target servings vs default servings
 */
export function scaleQuantity(originalQty: number, defaultServings: number, currentServings: number): number {
  if (!defaultServings || defaultServings <= 0) return originalQty;
  const multiplier = currentServings / defaultServings;
  return originalQty * multiplier;
}

/**
 * Plays a pleasant culinary kitchen timer chime using the Web Audio API
 */
export function playTimerChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + idx * 0.12 + 0.5);
    });
  } catch (e) {
    console.error('Audio chime failed:', e);
  }
}
