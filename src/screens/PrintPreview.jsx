import { useRef, useState, useEffect } from 'react';
import { RotateCcw, Printer, Download } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';
import { playClick } from '../hooks/useSound.js';
import ReceiptCanvas from '../components/ReceiptCanvas.jsx';

const AUTO_PRINT_SECONDS = 10;

export default function PrintPreview({ templateKey, frames, onPrint, onRetake }) {
  const { settings } = useSettings();
  const canvasRef = useRef(null);
  const receiptAreaRef = useRef(null);
  const [maxW, setMaxW] = useState('100%');
  const [countdown, setCountdown] = useState(AUTO_PRINT_SECONDS);
  const [mirrorImages, setMirrorImages] = useState(false);
  const autoFiredRef = useRef(false);

  function handleCanvasReady(canvas) {
    canvasRef.current = canvas;
    requestAnimationFrame(() => {
      const area = receiptAreaRef.current;
      if (!area || !canvas) return;
      const availH = area.clientHeight - 40;
      const availW = area.clientWidth;
      const aspectRatio = canvas.width / canvas.height;
      const neededW = Math.floor(availH * aspectRatio);
      setMaxW(neededW < availW ? `${neededW}px` : '100%');
    });
  }

  function handlePrint() {
    if (!canvasRef.current || autoFiredRef.current) return;
    autoFiredRef.current = true;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onPrint(dataUrl);
  }

  function handleDownload() {
    if (!canvasRef.current) return;

    // Create a temporary canvas to add watermark
    const originalCanvas = canvasRef.current;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = originalCanvas.width;
    tempCanvas.height = originalCanvas.height;
    const ctx = tempCanvas.getContext('2d');

    // Draw original canvas
    ctx.drawImage(originalCanvas, 0, 0);

    // Add watermark at bottom center
    const watermarkY = tempCanvas.height - 40;
    const centerX = tempCanvas.width / 2;

    // Facebook icon (simple circle with 'f')
    const iconRadius = 14;
    const iconX = centerX - 50;

    ctx.fillStyle = '#1877F2';
    ctx.beginPath();
    ctx.arc(iconX, watermarkY, iconRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw 'f' in white
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('f', iconX, watermarkY + 1);

    // Snap&Roll text
    ctx.fillStyle = '#333333';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Snap&Roll', iconX + iconRadius + 12, watermarkY);

    // Download the watermarked version
    const dataUrl = tempCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `receipt-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }

  // Auto-print countdown
  useEffect(() => {
    if (countdown <= 0) {
      handlePrint();
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-md-surface-container-low">
      {/* MD3 Top App Bar */}
      <div className="flex items-center h-16 px-2 flex-shrink-0 bg-md-surface">
        <div className="w-12" />
        <div className="flex-1 text-center">
          <h2 className="text-[22px] leading-7 font-normal text-md-on-surface">Print Preview</h2>
        </div>
        <div className="w-16" />
      </div>

      {/* Receipt preview — no-scroll, zoom-to-fit */}
      <div ref={receiptAreaRef} className="flex-1 overflow-hidden min-h-0 flex flex-col items-center px-6 py-5 page-content-enter">
        <div
          className="overflow-hidden rounded-2xl shadow-xl transition-shadow duration-200 hover:shadow-2xl mx-auto w-full preview-receipt-enter"
          style={{
            maxWidth: maxW,
            background: settings.templates.blocks?.backgroundColor || '#ffffff',
          }}
        >
          <ReceiptCanvas
            frames={frames}
            templateKey={templateKey}
            templateSettings={settings.templates}
            generalSettings={settings.general}
            printerSettings={settings.printer}
            mirrorImages={mirrorImages}
            onCanvasReady={handleCanvasReady}
          />
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="flex gap-3 px-4 py-3 flex-shrink-0 bg-md-surface">
        <button
          onClick={() => { playClick(); onRetake(); }}
          className="flex items-center justify-center gap-2 flex-1 py-5 rounded-full font-medium text-base border border-md-outline text-md-primary hover:bg-md-primary/10 hover:scale-[1.03] hover:shadow-md active:scale-[0.97] transition-all duration-150"
        >
          <RotateCcw size={20} />
          Retake
        </button>
        <button
          onClick={() => { playClick(); setMirrorImages(!mirrorImages); }}
          className={`flex items-center justify-center gap-2 w-32 px-4 py-5 rounded-full font-medium text-base border transition-all duration-150 ${
            mirrorImages
              ? 'bg-md-primary text-md-on-primary border-md-primary hover:brightness-110 hover:scale-[1.03] hover:shadow-lg active:scale-[0.97] shadow'
              : 'border-md-outline text-md-outline hover:bg-md-surface-container-high hover:scale-[1.03] active:scale-[0.97]'
          }`}
          title="Mirror images"
        >
          {mirrorImages ? 'Mirrored' : 'Mirror'}
        </button>
        <button
          onClick={() => { playClick(); handlePrint(); }}
          className="flex items-center justify-center gap-2 flex-1 py-5 rounded-full font-medium text-base bg-md-primary text-md-on-primary hover:brightness-110 hover:scale-[1.03] hover:shadow-lg active:scale-[0.97] transition-all duration-150 shadow"
        >
          <Printer size={20} />
          Print ({countdown})
        </button>
      </div>
    </div>
  );
}
