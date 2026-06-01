import { BleClient } from '@capacitor-community/bluetooth-le';
import { buildEscPosImage } from '../escpos.js';

export async function bluetoothPrint(imageDataUrl, onStatus) {
  try {
    onStatus('Initializing Bluetooth...');
    await BleClient.initialize();

    onStatus('Requesting Bluetooth device...');
    const device = await BleClient.requestDevice({
      services: ['000018f0-0000-1000-8000-00805f9b34fb'],
    });

    onStatus('Connecting...');
    await BleClient.connect(device.deviceId, () => {
      // Disconnect callback
    });

    onStatus('Building print data...');
    const bytes = await buildEscPosImage(imageDataUrl);
    const CHUNK = 512;
    onStatus('Sending data...');
    
    const serviceUUID = '000018f0-0000-1000-8000-00805f9b34fb';
    const characteristicUUID = '00002af1-0000-1000-8000-00805f9b34fb';
    
    for (let i = 0; i < bytes.length; i += CHUNK) {
      const chunk = bytes.slice(i, i + CHUNK);
      await BleClient.write(
        device.deviceId,
        serviceUUID,
        characteristicUUID,
        chunk
      );
    }

    await BleClient.disconnect(device.deviceId);
    return { success: true, message: 'Printed via Bluetooth' };
  } catch (err) {
    console.error('Bluetooth print error:', err);
    return { success: false, message: err.message || 'Bluetooth connection failed' };
  }
}
