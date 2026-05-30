import { useEffect, useState } from 'react';

/**
 * MD3 Snackbar
 * Spec: extra-small shape (4dp), inverse-surface bg, elevation-3 shadow,
 * slide-up + fade, min 288dp max 568dp, bottom-center.
 * Motion: enter 150ms decelerate, exit 75ms accelerate.
 */
export default function Snackbar({ message, visible }) {
  const [mounted, setMounted] = useState(false);
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimIn(true)));
    } else {
      setAnimIn(false);
      const t = setTimeout(() => setMounted(false), 75);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[200] flex justify-center pointer-events-none px-4">
      <div
        role="status"
        aria-live="polite"
        className={`will-change-transform ${
          animIn
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-2'
        }`}
        style={{
          transition: animIn
            ? 'opacity 150ms cubic-bezier(0.0, 0.0, 0.2, 1), transform 150ms cubic-bezier(0.0, 0.0, 0.2, 1)'
            : 'opacity 75ms cubic-bezier(0.4, 0.0, 1, 1), transform 75ms cubic-bezier(0.4, 0.0, 1, 1)',
        }}
      >
        <div
          className="
            bg-md-inverse-surface text-md-inverse-on-surface
            px-4 py-3.5
            rounded
            shadow-[0_4px_8px_3px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.3)]
            text-sm font-medium
            min-w-72 max-w-[568px]
            text-center whitespace-nowrap
          "
        >
          {message}
        </div>
      </div>
    </div>
  );
}
