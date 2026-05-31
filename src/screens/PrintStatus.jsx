import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, RefreshCw, Home } from 'lucide-react';
import QRCode from 'qrcode';
import { useSettings } from '../context/SettingsContext.jsx';
import { usePrinter } from '../hooks/usePrinter.js';
import { playSuccess, playError, playClick } from '../hooks/useSound.js';

function ReceiptQR({ size = 200, eventName }) {
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    const url = `https://snaproll.app/gallery/${encodeURIComponent(eventName || 'event')}`;
    QRCode.toDataURL(url, {
      width: size,
      margin: 2,
      color: { dark: '#1C1B1F', light: '#FFFFFF' },
    }).then(setDataUrl).catch(() => setDataUrl(null));
  }, [size, eventName]);

  if (!dataUrl) {
    return (
      <div className="w-[200px] h-[200px] flex items-center justify-center bg-white rounded-2xl">
        <div className="w-6 h-6 border-2 border-md-outline border-t-md-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt="QR Code"
      className="rounded-2xl"
      width={size}
      height={size}
      draggable={false}
    />
  );
}

export default function PrintStatus({ imageDataUrl, onHome, onRetry }) {
  const { settings } = useSettings();
  const isDark = settings.general.theme === 'dark';
  const { print, status, statusMessage, error, reset } = usePrinter();
  const [countdown, setCountdown] = useState(20);

  useEffect(() => {
    print(imageDataUrl, settings.printer);
  }, []);

  // Play success/error sounds
  useEffect(() => {
    if (status === 'success') playSuccess();
    if (status === 'error') playError();
  }, [status]);

  // Auto-return home 10 seconds after success
  useEffect(() => {
    if (status !== 'success') return;
    if (countdown <= 0) {
      handleHome();
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown]);

  function handleRetry() {
    playClick();
    reset();
    print(imageDataUrl, settings.printer);
  }

  function handleHome() {
    playClick();
    reset();
    onHome();
  }

  const { boothName, eventName } = settings.general;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 px-8 bg-md-surface">

      {/* Booth identity — top */}
      <div className="absolute top-8 flex flex-col items-center gap-0.5">
        <p className="text-base font-semibold text-md-on-surface tracking-wide">
          {boothName || 'Snap \u0026 Roll'}
        </p>
        {eventName && (
          <p className="text-xs text-md-on-surface-variant tracking-widest uppercase">{eventName}</p>
        )}
      </div>

      {/* Status indicator */}
      <div className="flex flex-col items-center gap-6 page-content-enter">
        {status === 'printing' && (
          <div key="printing" className="flex flex-col items-center gap-6 status-enter">
            {/* MD3 Circular Progress */}
            <div className="w-28 h-28 rounded-full border-[5px] border-md-surface-container-highest border-t-md-primary animate-spin" />
            <div className="text-center">
              <p className="text-[32px] leading-10 font-normal text-md-on-surface">
                {settings.printer.transport === 'simulate' ? 'Simulating…' : 'Printing…'}
              </p>
              <p className="text-lg mt-2 text-md-on-surface-variant">{statusMessage || 'Please wait'}</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div key="success" className="flex flex-col items-center gap-6 status-enter">
            <div className="w-28 h-28 rounded-full bg-md-primary-container flex items-center justify-center">
              <CheckCircle size={56} className="text-md-on-primary-container" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-[32px] leading-10 font-normal text-md-on-surface">
                {settings.printer.transport === 'simulate' ? 'Simulated!' : 'Printed!'}
              </p>
              <p className="text-lg mt-2 text-md-on-surface-variant">{statusMessage}</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div key="error" className="flex flex-col items-center gap-6 status-enter">
            <div className="w-28 h-28 rounded-full bg-md-error-container flex items-center justify-center">
              <XCircle size={56} className="text-md-on-error-container" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-[32px] leading-10 font-normal text-md-on-surface">Print Failed</p>
              <p className="text-lg mt-2 text-md-error max-w-xs">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* QR code — success only */}
      {status === 'success' && (
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-2xl overflow-hidden shadow-md border border-md-outline-variant p-1 bg-white">
            <ReceiptQR size={200} eventName={settings.general.eventName} />
          </div>
          <p className="text-[10px] text-md-outline tracking-widest uppercase">Scan for digital copy</p>
        </div>
      )}

      {/* Actions */}
      {status === 'success' && (
        <button
          onClick={handleHome}
          className="flex items-center gap-3 bg-md-primary text-md-on-primary font-semibold min-h-[56px] px-12 rounded-full text-base hover:brightness-110 hover:scale-[1.03] hover:shadow-xl active:scale-[0.97] transition-all duration-150 shadow"
        >
          <Home size={22} />
          Print Another ({countdown})
        </button>
      )}

      {status === 'error' && (
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 bg-md-primary text-md-on-primary font-semibold min-h-[56px] rounded-full text-base hover:brightness-110 hover:scale-[1.03] hover:shadow-lg active:scale-[0.97] transition-all duration-150"
          >
            <RefreshCw size={20} />
            Retry
          </button>
          <button
            onClick={handleHome}
            className="flex items-center justify-center gap-2 min-h-[56px] rounded-full text-base font-medium border border-md-outline text-md-on-surface-variant hover:bg-md-surface-container-high hover:scale-[1.03] hover:shadow-md active:scale-[0.97] transition-all duration-150"
          >
            <Home size={20} />
            Return Home
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-6 flex flex-col items-center gap-0.5">
        <p className="text-sm font-semibold text-md-on-surface-variant tracking-wider">MONO STUDIO PH</p>
        <p className="text-[10px] text-md-outline tracking-widest uppercase">No proof without @monoboothph</p>
        <p className="text-[10px] text-md-on-surface-variant">📍 Kabankalan City & Beyond</p>
      </div>
    </div>
  );
}
