import { useState, useCallback } from 'react';
import { simulatePrint } from '../lib/printerTransports/simulate.js';
import { bluetoothPrint } from '../lib/printerTransports/bluetooth.js';
import { usbPrint } from '../lib/printerTransports/usb.js';
import { wifiPrint } from '../lib/printerTransports/wifi.js';

export function usePrinter() {
  const [status, setStatus] = useState('idle'); // idle | printing | success | error
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);

  const print = useCallback(async (imageDataUrl, printerSettings) => {
    try {
      setStatus('printing');
      setError(null);
      const { transport, wifiIp, wifiPort } = printerSettings;

      let result;
      const onStatus = msg => setStatusMessage(msg);

      switch (transport) {
        case 'bluetooth':
          result = await bluetoothPrint(imageDataUrl, onStatus);
          break;
        case 'usb':
          result = await usbPrint(imageDataUrl, onStatus);
          break;
        case 'wifi':
          result = await wifiPrint(imageDataUrl, wifiIp, wifiPort, onStatus);
          break;
        default:
          result = await simulatePrint(imageDataUrl, onStatus);
      }

      if (result.success) {
        setStatus('success');
        setStatusMessage(result.message);
      } else {
        setStatus('error');
        setError(result.message);
      }
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Unknown print error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setStatusMessage('');
    setError(null);
  }, []);

  return { print, status, statusMessage, error, reset };
}
