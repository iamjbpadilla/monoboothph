import { useEffect, useRef, useState } from 'react';
import { compositeReceipt } from '../lib/canvasCompositor.js';

export default function ReceiptCanvas({ frames, templateKey, templateSettings, generalSettings, printerSettings, onCanvasReady }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    compositeReceipt(frames, templateKey, templateSettings, generalSettings, printerSettings)
      .then(canvas => {
        if (cancelled) return;
        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = '';
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.display = 'block';
        container.appendChild(canvas);
        onCanvasReady?.(canvas);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [frames, templateKey, templateSettings, generalSettings, printerSettings]);

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
