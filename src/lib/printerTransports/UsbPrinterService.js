import { Capacitor } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';

const UsbPrinter = registerPlugin('UsbPrinter');

// Status values: 'idle' | 'scanning' | 'connecting' | 'connected' | 'disconnected' | 'error'
let _status = 'idle';
let _statusMessage = '';
const _listeners = new Set();

function setStatus(status, message = '') {
  _status = status;
  _statusMessage = message;
  _listeners.forEach(fn => fn(status, message));
}

function isNativeAvailable() {
  return Capacitor.isNativePlatform() && UsbPrinter != null;
}

export const UsbPrinterService = {
  get status() { return _status; },
  get statusMessage() { return _statusMessage; },

  onStatusChange(fn) {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },

  async scanDevices() {
    if (!isNativeAvailable()) {
      throw new Error('USB printing requires native Android platform.');
    }
    setStatus('scanning', 'Scanning for USB devices...');
    try {
      const { devices } = await UsbPrinter.scanDevices();
      setStatus('idle');
      return devices;
    } catch (err) {
      setStatus('error', err.message);
      throw err;
    }
  },

  async requestPermission(deviceName) {
    if (!isNativeAvailable()) {
      throw new Error('USB printing requires native Android platform.');
    }
    try {
      const result = await UsbPrinter.requestPermission({ deviceName });
      return result.granted;
    } catch (err) {
      setStatus('error', 'Permission denied: ' + err.message);
      throw err;
    }
  },

  async connect(deviceName) {
    if (!isNativeAvailable()) {
      throw new Error('USB printing requires native Android platform.');
    }
    setStatus('connecting', 'Connecting to printer...');
    try {
      const result = await UsbPrinter.connect({ deviceName });
      setStatus('connected', 'Printer connected: ' + (result.productName || deviceName));
      return result;
    } catch (err) {
      setStatus('disconnected', 'Connection failed: ' + err.message);
      throw err;
    }
  },

  async write(uint8Array) {
    if (!isNativeAvailable()) {
      throw new Error('USB printing requires native Android platform.');
    }
    try {
      const base64 = uint8ArrayToBase64(uint8Array);
      const result = await UsbPrinter.write({ data: base64 });
      return result;
    } catch (err) {
      setStatus('disconnected', 'Printer Disconnected');
      throw err;
    }
  },

  async disconnect() {
    try {
      if (isNativeAvailable()) {
        await UsbPrinter.disconnect();
      }
    } catch (err) {
      // Ignore disconnect errors
    } finally {
      setStatus('disconnected', 'Printer disconnected');
    }
  },

  async isConnected() {
    if (!isNativeAvailable()) return false;
    try {
      const { connected } = await UsbPrinter.isConnected();
      return connected;
    } catch {
      return false;
    }
  },

  async connectToFirstPrinter(onStatus) {
    if (!isNativeAvailable()) {
      throw new Error('USB printing requires native Android platform. Use WiFi or Simulate transport instead.');
    }

    onStatus('Scanning for USB printers...');
    const devices = await this.scanDevices();

    if (devices.length === 0) {
      throw new Error('No USB devices found. Connect printer via OTG cable.');
    }

    // Prefer USB printer class (class=7) device first, fallback to first device
    const printer = devices.find(d => d.deviceClass === 7) || devices[0];
    onStatus(`Found: ${printer.productName || printer.name}`);

    if (!printer.hasPermission) {
      onStatus('Requesting USB permission...');
      const granted = await this.requestPermission(printer.name);
      if (!granted) {
        throw new Error('USB permission denied. Please allow access when prompted.');
      }
    }

    onStatus('Connecting to printer...');
    await this.connect(printer.name);
    return printer;
  },
};

function uint8ArrayToBase64(uint8Array) {
  let binary = '';
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}
