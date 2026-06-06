import { useEffect, useRef, useState } from 'react';
import { compositeReceipt, generateDesignData } from '../lib/canvasCompositor.js';

export default function ReceiptCanvas({ frames, templateKey, templateSettings, generalSettings, printerSettings, homeScreenSettings, mirrorImages, onCanvasReady }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cacheRef = useRef({ normal: null, mirrored: null });
  const dataRef = useRef(null);
  const paramsRef = useRef(null);

  // Build a stable key from non-mirror params
  const paramsKey = JSON.stringify({ frames, templateKey, templateSettings, generalSettings, printerSettings, homeScreenSettings });

  useEffect(() => {
    let cancelled = false;

    // If underlying params changed, clear cache and regenerate design data
    if (paramsRef.current !== paramsKey) {
      paramsRef.current = paramsKey;
      cacheRef.current = { normal: null, mirrored: null };
      const blocks = templateSettings.blocks || templateSettings;
      dataRef.current = generateDesignData(blocks);

      setLoading(true);
      setError(null);

      // Composite BOTH versions with the SAME design data
      Promise.all([
        compositeReceipt(frames, templateKey, templateSettings, generalSettings, printerSettings, homeScreenSettings, false, dataRef.current),
        compositeReceipt(frames, templateKey, templateSettings, generalSettings, printerSettings, homeScreenSettings, true, dataRef.current),
      ]).then(([normalCanvas, mirroredCanvas]) => {
        if (cancelled) return;
        cacheRef.current = { normal: normalCanvas, mirrored: mirroredCanvas };
        const canvas = mirrorImages ? mirroredCanvas : normalCanvas;
        const container = containerRef.current;
        if (container) {
          container.innerHTML = '';
          canvas.style.width = '100%';
          canvas.style.height = 'auto';
          canvas.style.display = 'block';
          container.appendChild(canvas);
        }
        onCanvasReady?.(canvas);
        setLoading(false);
      }).catch(err => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

      return () => { cancelled = true; };
    }

    // Params same — just show the cached canvas for current mirror state
    const cacheKey = mirrorImages ? 'mirrored' : 'normal';
    const canvas = cacheRef.current[cacheKey];
    if (canvas) {
      const container = containerRef.current;
      if (container) {
        container.innerHTML = '';
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.display = 'block';
        container.appendChild(canvas);
      }
      onCanvasReady?.(canvas);
      setLoading(false);
    }
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
