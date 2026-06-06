import { useEffect, useRef, useState } from 'react';
import { compositeReceipt } from '../lib/canvasCompositor.js';

export default function ReceiptCanvas({ frames, templateKey, templateSettings, generalSettings, printerSettings, homeScreenSettings, mirrorImages, onCanvasReady }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cacheRef = useRef({ normal: null, mirrored: null });
  const paramsRef = useRef(null);

  // Build a stable key from non-mirror params
  const paramsKey = JSON.stringify({ frames, templateKey, templateSettings, generalSettings, printerSettings, homeScreenSettings });

  useEffect(() => {
    let cancelled = false;

    // If underlying params changed, clear the cache
    if (paramsRef.current !== paramsKey) {
      paramsRef.current = paramsKey;
      cacheRef.current = { normal: null, mirrored: null };
    }

    const cacheKey = mirrorImages ? 'mirrored' : 'normal';

    // If we already have a cached canvas for this mirror state, display it
    if (cacheRef.current[cacheKey]) {
      const container = containerRef.current;
      if (container) {
        container.innerHTML = '';
        const canvas = cacheRef.current[cacheKey];
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.display = 'block';
        container.appendChild(canvas);
      }
      setLoading(false);
      return;
    }

    // Otherwise, composite and cache
    setLoading(true);
    setError(null);

    compositeReceipt(frames, templateKey, templateSettings, generalSettings, printerSettings, homeScreenSettings, mirrorImages)
      .then(canvas => {
        if (cancelled) return;
        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = '';
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.display = 'block';
        container.appendChild(canvas);
        cacheRef.current[cacheKey] = canvas;
        onCanvasReady?.(canvas);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [paramsKey, mirrorImages]);

  return (
    <div className="w-full">
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
      {error && (
        <div className="text-red-400 text-sm text-center py-4">Error: {error}</div>
      )}
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
