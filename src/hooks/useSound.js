import { useRef, useCallback } from 'react';

// Web Audio API sound generator — no external files, works offline
function getAudioCtx() {
  if (typeof window === 'undefined') return null;
  if (!window.__audioCtx) {
    window.__audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return window.__audioCtx;
}

function resumeAudioCtx() {
  const ctx = getAudioCtx();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
}

// Resume audio context on first user interaction so sounds aren't silently dropped
if (typeof window !== 'undefined') {
  const events = ['click', 'touchstart', 'keydown'];
  const handler = () => {
    resumeAudioCtx();
    events.forEach(e => window.removeEventListener(e, handler));
  };
  events.forEach(e => window.addEventListener(e, handler, { once: true, passive: true }));
}

function now() {
  const ctx = getAudioCtx();
  return ctx ? ctx.currentTime : 0;
}

export function playClick() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const t = now();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(440, t);
  osc.frequency.exponentialRampToValueAtTime(220, t + 0.04);
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.05);
}

export function playHover() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const t = now();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(880, t);
  gain.gain.setValueAtTime(0.03, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.025);
}

export function playShutter() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();
  const t = now();
  // Retro 8-bit shutter sound
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(1200, t);
  osc.frequency.exponentialRampToValueAtTime(100, t + 0.08);
  gain.gain.setValueAtTime(0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.1);
}

export function playBeep() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const t = now();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(660, t);
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.12);
}

export function playSuccess() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const t = now();
  // Retro coin/power-up sound - ascending arpeggio
  [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, t + i * 0.08);
    gain.gain.setValueAtTime(0, t + i * 0.08);
    gain.gain.linearRampToValueAtTime(0.12, t + i * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t + i * 0.08);
    osc.stop(t + i * 0.08 + 0.25);
  });
}

export function playTransition() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const t = now();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(220, t);
  osc.frequency.exponentialRampToValueAtTime(440, t + 0.1);
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.15);
}

export function playError() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const t = now();
  // Retro error buzz - descending tone
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.exponentialRampToValueAtTime(50, t + 0.3);
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.35);
}

// Hook wrapper for components that want sound
export function useSound() {
  const enabledRef = useRef(true);

  const withSound = useCallback((fn) => {
    return (...args) => {
      if (enabledRef.current) fn();
      // Always call the original handler regardless of sound
    };
  }, []);

  return {
    click: playClick,
    hover: playHover,
    shutter: playShutter,
    beep: playBeep,
    success: playSuccess,
    transition: playTransition,
    error: playError,
    enabledRef,
  };
}
