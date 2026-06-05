import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera as CameraIcon, RefreshCw, Printer, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Camera } from '@capacitor/camera';
import { useSettings } from '../../context/SettingsContext.jsx';
import { calcCanvasWidth } from '../../lib/canvasCompositor.js';
import { generateThermalPreview } from '../../lib/escpos.js';
import { usePrinter } from '../../hooks/usePrinter.js';
import { playTear } from '../../hooks/useSound.js';
import ConfirmDialog from '../ConfirmDialog.jsx';

const TRANSPORTS = [
  { value: 'simulate', label: 'Simulate (Test Mode)' },
  { value: 'usb',      label: 'USB OTG ESC/POS' },
  { value: 'wifi',     label: 'WiFi / Network IP' },
];

const DPI_PRESETS = [150, 203, 300];

const DITHERING_OPTIONS = [
  { value: 'floyd', label: 'Floyd-Steinberg', desc: 'Best for photos' },
  { value: 'bayer', label: 'Bayer 4×4',       desc: 'Dot pattern' },
  { value: 'simple', label: 'Simple',          desc: 'Basic threshold' },
];

const QUALITY_DEFAULTS = { printGamma: 1.8, printBrightness: -8, printContrast: 64, printDithering: 'floyd' };

function multLabel(v) {
  if (v < 0) return `÷ ${Math.abs(v)} (${v}x)`;
  if (v === 1) return '× 1 (same)';
  return `× ${v}`;
}

function QualitySlider({ label, sublabel, value, min, max, step = 1, onChange, unit = '' }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <label className="text-xs font-medium text-md-on-surface-variant">{label}</label>
        <span className="text-xs text-md-primary font-mono">{typeof value === 'number' ? value.toFixed(step < 1 ? 1 : 0) : value}{unit}</span>
      </div>
      {sublabel && <p className="text-[10px] text-md-outline mb-1">{sublabel}</p>}
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value, 10))}
        className="w-full h-1.5 rounded-full accent-md-primary bg-md-surface-container-highest cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-md-outline mt-0.5">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

export default function PrinterSettings() {
  const { settings, updateSettings } = useSettings();
  const { printer } = settings;
  const { print, status: printStatus, statusMessage, error: printError, reset: resetPrint } = usePrinter();

  const [testPhoto, setTestPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [qualityExpanded, setQualityExpanded] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', onConfirm: null });
  const debounceRef = useRef(null);

  function showConfirm(title, description, onConfirm) {
    setConfirmDialog({ open: true, title, description, onConfirm });
  }

  const canvasPx = calcCanvasWidth(printer.dpi, printer.paperWidthMm);

  // Regenerate thermal preview when settings or photo changes (debounced 350 ms)
  const refreshPreview = useCallback(async (photo, ps) => {
    if (!photo) return;
    setPreviewLoading(true);
    try {
      const opts = {
        gamma: ps.printGamma ?? 1.2,
        brightness: ps.printBrightness ?? 0,
        contrast: ps.printContrast ?? 0,
        dithering: ps.printDithering ?? 'floyd',
      };
      const url = await generateThermalPreview(photo, opts);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Preview error', err);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!testPhoto) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => refreshPreview(testPhoto, printer), 350);
    return () => clearTimeout(debounceRef.current);
  }, [testPhoto, printer.printGamma, printer.printBrightness, printer.printContrast, printer.printDithering, refreshPreview]);

  async function handleCapturePhoto() {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: 'dataUrl',
        source: 'CAMERA',
      });
      setTestPhoto(photo.dataUrl);
      resetPrint();
    } catch (err) {
      if (!err.message?.includes('cancelled')) {
        console.error('Camera error', err);
      }
    }
  }

  function handleLoadSample() {
    // Simple gradient test image generated on-canvas
    const c = document.createElement('canvas');
    c.width = 300; c.height = 200;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 300, 200);
    grad.addColorStop(0, '#f5c6d0');
    grad.addColorStop(0.3, '#c4a882');
    grad.addColorStop(0.6, '#7a8b6a');
    grad.addColorStop(1, '#2c3e50');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 300, 200);
    // Draw face-like circles to simulate a portrait
    ctx.fillStyle = '#d4a882';
    ctx.beginPath(); ctx.ellipse(150, 90, 55, 70, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8b6914';
    ctx.beginPath(); ctx.ellipse(130, 75, 8, 10, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(170, 75, 8, 10, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.arc(150, 105, 12, 0, Math.PI); ctx.fill();
    setTestPhoto(c.toDataURL('image/jpeg', 0.9));
    resetPrint();
  }

  async function handleTestPrint() {
    if (!testPhoto) return;
    playTear();
    resetPrint();
    await print(testPhoto, printer);
  }

  function handleResetQuality() {
    showConfirm(
      'Reset Quality Settings',
      'Reset print quality settings to defaults?',
      () => Object.entries(QUALITY_DEFAULTS).forEach(([k, v]) => updateSettings(`printer.${k}`, v))
    );
  }

  return (
    <div className="space-y-5">
      {/* Transport */}
      <div>
        <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Issue Transport</label>
        <div className="grid grid-cols-1 gap-2">
          {TRANSPORTS.map(t => (
            <button key={t.value} onClick={() => updateSettings('printer.transport', t.value)}
              className={`px-3 py-2.5 rounded-xl border text-sm text-left transition-colors ${
                printer.transport === t.value
                  ? 'bg-md-secondary-container border-md-secondary text-md-on-secondary-container'
                  : 'bg-md-surface-container border-md-outline-variant text-md-on-surface-variant hover:bg-md-surface-container-high'
              }`}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {printer.transport === 'wifi' && (
        <div className="grid grid-cols-2 gap-3 p-3 bg-md-surface-container rounded-xl border border-md-outline-variant">
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-1">Printer IP</label>
            <input type="text" value={printer.wifiIp}
              onChange={e => updateSettings('printer.wifiIp', e.target.value)}
              className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary"
              placeholder="192.168.1.100" />
          </div>
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-1">Port</label>
            <input type="number" value={printer.wifiPort}
              onChange={e => updateSettings('printer.wifiPort', e.target.value)}
              className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary"
              placeholder="9100" />
          </div>
        </div>
      )}

      {/* Print Quality */}
      <div className="p-3 bg-md-surface-container rounded-xl border border-md-outline-variant space-y-4">
        <button
          onClick={() => setQualityExpanded(!qualityExpanded)}
          className="flex items-center justify-between w-full"
        >
          <label className="text-xs font-semibold text-md-on-surface uppercase tracking-wider">Issue Quality</label>
          {qualityExpanded ? <ChevronUp size={16} className="text-md-on-surface-variant" /> : <ChevronDown size={16} className="text-md-on-surface-variant" />}
        </button>

        {qualityExpanded && (
          <>
            <div className="flex items-center justify-between">
              <div></div>
              <button onClick={handleResetQuality}
                className="flex items-center gap-1 text-xs text-md-on-surface-variant hover:text-md-primary transition-colors">
                <RotateCcw size={11} />Reset
              </button>
            </div>

            {/* Dithering Algorithm */}
            <div>
              <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Dithering Algorithm</label>
              <div className="grid grid-cols-3 gap-1.5">
                {DITHERING_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => updateSettings('printer.printDithering', opt.value)}
                    className={`px-2 py-2 rounded-xl border text-center transition-colors ${
                      printer.printDithering === opt.value
                        ? 'bg-md-primary text-md-on-primary border-md-primary'
                        : 'bg-md-surface-container-high border-md-outline-variant text-md-on-surface-variant hover:bg-md-surface-container-highest'
                    }`}>
                    <span className="block text-xs font-medium leading-tight">{opt.label}</span>
                    <span className="block text-[9px] opacity-70 mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <QualitySlider label="Gamma (Skin Tone Boost)" sublabel="Higher = brighter midtones, prevents dark skin tones"
              value={printer.printGamma ?? 1.2} min={0.8} max={2.0} step={0.1}
              onChange={v => updateSettings('printer.printGamma', v)} />

            <QualitySlider label="Brightness"
              value={printer.printBrightness ?? 0} min={-100} max={100}
              onChange={v => updateSettings('printer.printBrightness', v)} />

            <QualitySlider label="Contrast"
              value={printer.printContrast ?? 0} min={-100} max={100}
              onChange={v => updateSettings('printer.printContrast', v)} />
          </>
        )}
      </div>

      {/* Print Margins (print-only, does not affect on-screen preview) - HIDDEN */}
      {/* <div className="p-3 bg-md-surface-container rounded-xl border border-md-outline-variant space-y-4">
        <label className="block text-xs font-semibold text-md-on-surface uppercase tracking-wider">Print Margins</label>
        <p className="text-[10px] text-md-outline leading-relaxed">These only affect the printed output. On-screen previews stay unchanged.</p>

        <div>
          <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Top Margin (px)</label>
          <div className="flex flex-wrap gap-1.5">
            {[0, 8, 12, 16, 22, 32, 48].map(v => (
              <button key={v} onClick={() => updateSettings('printer.printTopMargin', v)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  (printer.printTopMargin ?? 0) === v
                    ? 'bg-md-primary text-md-on-primary border-md-primary'
                    : 'bg-md-surface-container-high border-md-outline-variant text-md-on-surface-variant hover:bg-md-surface-container-highest'
                }`}>{v}px</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Bottom Multiplier</label>
          <div className="flex flex-wrap gap-1.5">
            {[-3, -2, -1, 1, 2, 3, 4, 5].map(v => (
              <button key={v} onClick={() => updateSettings('printer.printBottomMultiplier', v)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  (printer.printBottomMultiplier ?? 1) === v
                    ? 'bg-md-primary text-md-on-primary border-md-primary'
                    : 'bg-md-surface-container-high border-md-outline-variant text-md-on-surface-variant hover:bg-md-surface-container-highest'
                }`}>{v < 0 ? `-${Math.abs(v)}x` : `${v}x`}</button>
            ))}
          </div>
          <p className="text-[10px] text-md-outline mt-1.5">
            Bottom = top {multLabel(printer.printBottomMultiplier ?? 1)}
          </p>
        </div>
      </div> */}

      {/* Print Quality Tester */}
      <div className="p-3 bg-md-surface-container rounded-xl border border-md-outline-variant space-y-3">
        <label className="block text-xs font-semibold text-md-on-surface uppercase tracking-wider">Thermal Issue Tester</label>

        <div className="flex gap-2">
          <button onClick={handleCapturePhoto}
            className="flex-1 flex items-center justify-center gap-2 bg-md-primary text-md-on-primary rounded-xl py-2.5 text-sm font-medium hover:brightness-110 transition-all">
            <CameraIcon size={15} />Capture Photo
          </button>
          <button onClick={handleLoadSample}
            className="flex-1 flex items-center justify-center gap-2 bg-md-surface-container-high border border-md-outline-variant text-md-on-surface-variant rounded-xl py-2.5 text-sm hover:bg-md-surface-container-highest transition-all">
            <RefreshCw size={15} />Sample
          </button>
        </div>

        {/* Mock receipt preview */}
        {testPhoto && (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 overflow-hidden">
            <div className="bg-gray-100 px-3 py-1.5 flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Thermal Preview</span>
              <span className="text-[9px] text-gray-400">576px · {printer.printDithering}</span>
            </div>
            <div className="relative flex items-center justify-center min-h-[120px] bg-white p-2">
              {previewLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                </div>
              )}
              {previewUrl ? (
                <img src={previewUrl} alt="Thermal preview"
                  className="max-w-full rounded"
                  style={{ imageRendering: 'pixelated', maxHeight: 240 }} />
              ) : (
                <p className="text-xs text-gray-400">Processing…</p>
              )}
            </div>
            <div className="bg-gray-50 px-3 py-1 text-center font-mono text-[9px] text-gray-400 tracking-widest">
              — MONO BOOTH PH —
            </div>
          </div>
        )}

        {!testPhoto && (
          <div className="bg-md-surface-container-high rounded-xl border border-dashed border-md-outline-variant flex items-center justify-center h-24">
            <p className="text-xs text-md-outline text-center px-4">Capture a photo or load a sample<br/>to preview thermal output</p>
          </div>
        )}

        {testPhoto && (
          <button onClick={handleTestPrint}
            disabled={printStatus === 'printing'}
            className="w-full flex items-center justify-center gap-2 bg-md-secondary-container border border-md-outline-variant text-md-on-secondary-container rounded-xl py-3 text-sm font-medium hover:brightness-105 transition-all disabled:opacity-50">
            <Printer size={15} />
            {printStatus === 'printing' ? statusMessage || 'Issuing…' : 'Test Issue'}
          </button>
        )}

        {printStatus === 'success' && (
          <p className="text-xs text-green-500 text-center">{statusMessage}</p>
        )}
        {printStatus === 'error' && (
          <p className="text-xs text-red-400 text-center">{printError}</p>
        )}
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={() => {
          if (confirmDialog.onConfirm) confirmDialog.onConfirm();
          setConfirmDialog({ ...confirmDialog, open: false });
        }}
      />
    </div>
  );
}
