import { useState } from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { calcCanvasWidth } from '../../lib/canvasCompositor.js';
import { simulatePrint } from '../../lib/printerTransports/simulate.js';

const TRANSPORTS = [
  { value: 'simulate', label: 'Simulate (Test Mode)', color: 'text-yellow-300' },
  { value: 'usb', label: 'USB OTG ESC/POS', color: 'text-purple-300' },
  { value: 'wifi', label: 'WiFi / Network IP', color: 'text-green-300' },
];

const DPI_PRESETS = [203, 300];

export default function PrinterSettings() {
  const { settings, updateSettings } = useSettings();
  const { printer } = settings;
  const [testStatus, setTestStatus] = useState('');
  const [testing, setTesting] = useState(false);

  const canvasPx = calcCanvasWidth(printer.dpi, printer.paperWidthMm);

  async function handleTransportChange(transport) {
    updateSettings('printer.transport', transport);
  }

  async function handleTestPrint() {
    setTesting(true);
    setTestStatus('');
    try {
      const result = await simulatePrint(null, msg => setTestStatus(msg));
      setTestStatus(result.message);
    } catch (err) {
      setTestStatus('Error: ' + err.message);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Print Transport</label>
        <div className="grid grid-cols-2 gap-2">
          {TRANSPORTS.map(t => (
            <button
              key={t.value}
              onClick={() => handleTransportChange(t.value)}
              className={`px-3 py-2.5 rounded-xl border text-sm text-left transition-colors ${
                printer.transport === t.value
                  ? 'bg-md-secondary-container border-md-secondary text-md-on-secondary-container'
                  : 'bg-md-surface-container border-md-outline-variant text-md-on-surface-variant hover:bg-md-surface-container-high'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {printer.transport === 'wifi' && (
        <div className="grid grid-cols-2 gap-3 p-3 bg-md-surface-container rounded-xl border border-md-outline-variant">
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-1">Printer IP</label>
            <input
              type="text"
              value={printer.wifiIp}
              onChange={e => updateSettings('printer.wifiIp', e.target.value)}
              className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm placeholder:text-md-outline focus:outline-none focus:border-md-primary"
              placeholder="192.168.1.100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-1">Port</label>
            <input
              type="number"
              value={printer.wifiPort}
              onChange={e => updateSettings('printer.wifiPort', e.target.value)}
              className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm placeholder:text-md-outline focus:outline-none focus:border-md-primary"
              placeholder="9100"
            />
          </div>
        </div>
      )}

      {/* DPI + Paper Width — 2 col */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Paper DPI</label>
          <div className="flex flex-col gap-1.5">
            {DPI_PRESETS.map(d => (
              <button
                key={d}
                onClick={() => updateSettings('printer.dpi', d)}
                className={`py-2.5 rounded-xl border text-sm transition-colors ${
                  printer.dpi === d
                    ? 'bg-md-primary text-md-on-primary border-md-primary'
                    : 'bg-md-surface-container text-md-on-surface-variant border-md-outline-variant hover:bg-md-surface-container-high'
                }`}
              >
                {d} DPI
              </button>
            ))}
            <input
              type="number"
              value={!DPI_PRESETS.includes(printer.dpi) ? printer.dpi : ''}
              onChange={e => updateSettings('printer.dpi', Number(e.target.value))}
              className={`py-2.5 rounded-xl border text-sm text-center focus:outline-none focus:border-md-primary ${
                !DPI_PRESETS.includes(printer.dpi)
                  ? 'bg-md-primary text-md-on-primary border-md-primary'
                  : 'bg-md-surface-container text-md-on-surface-variant border-md-outline-variant'
              }`}
              placeholder="Custom"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Paper Width (mm)</label>
          <input
            type="number"
            value={printer.paperWidthMm}
            onChange={e => updateSettings('printer.paperWidthMm', Number(e.target.value))}
            className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-3.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary"
            min={58} max={112}
          />
          <p className="text-md-outline text-xs mt-2 leading-relaxed">
            {canvasPx}px canvas<br/>({printer.paperWidthMm}mm @ {printer.dpi} DPI)
          </p>
        </div>
      </div>

      <div>
        <button
          onClick={handleTestPrint}
          disabled={testing}
          className="w-full bg-md-secondary-container hover:brightness-105 hover:scale-[1.01] border border-md-outline-variant text-md-on-secondary-container rounded-xl px-4 py-4 text-base font-medium transition-all disabled:opacity-50"
        >
          {testing ? 'Testing…' : 'Test Print (Simulate)'}
        </button>
        {testStatus && (
          <p className="text-md-on-surface-variant text-xs mt-2 text-center">{testStatus}</p>
        )}
      </div>
    </div>
  );
}
