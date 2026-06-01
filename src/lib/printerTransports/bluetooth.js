import { buildEscPosImage } from '../escpos.js';

export async function bluetoothPrint(imageDataUrl, onStatus) {
  try {
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth API not supported in this browser.');
    }
    onStatus('Requesting Bluetooth device...');
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'],
    });
    onStatus('Connecting...');
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
    const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

    onStatus('Building print data...');
    const bytes = await buildEscPosImage(imageDataUrl);
    const CHUNK = 512;
    onStatus('Sending data...');
    for (let i = 0; i < bytes.length; i += CHUNK) {
      await characteristic.writeValueWithoutResponse(bytes.slice(i, i + CHUNK));
    }
    device.gatt.disconnect();
    return { success: true, message: 'Printed via Bluetooth' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}
