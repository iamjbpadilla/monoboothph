import { useState, useCallback } from 'react';
import { simulatePrint } from '../lib/printerTransports/simulate.js';
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
        case 'usb':
          result = await usbPrint(imageDataUrl, onStatus, printerSettings);
          break;
        case 'wifi':
          result = await wifiPrint(imageDataUrl, wifiIp, wifiPort, onStatus, printerSettings);
          break;
        default:
          result = await simulatePrint(imageDataUrl, onStatus, printerSettings);
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
