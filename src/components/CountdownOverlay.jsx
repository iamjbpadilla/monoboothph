import { useEffect, useState } from 'react';
import { playBeep } from '../hooks/useSound.js';

export default function CountdownOverlay({ seconds, onComplete, flashEffect = true }) {
  const [count, setCount] = useState(seconds);
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    setCount(seconds);
  }, [seconds]);

  useEffect(() => {
    if (count <= 0) {
      onComplete?.();
      if (flashEffect) {
        setFlashing(true);
        const t = setTimeout(() => setFlashing(false), 400);
        return () => clearTimeout(t);
      }
      return;
    }
    playBeep();
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onComplete, flashEffect]);

  return (
    <>
      {/* Countdown number */}
      {count > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <span
            key={count}
            className="countdown-pulse text-white font-black drop-shadow-2xl select-none"
            style={{ fontSize: '20vw', textShadow: '0 0 40px rgba(0,0,0,0.8)' }}
          >
            {count}
          </span>
        </div>
      )}
      {/* Flash */}
      {flashing && (
        <div className="absolute inset-0 bg-black/40 capture-flash z-30 pointer-events-none" />
      )}
    </>
  );
}
