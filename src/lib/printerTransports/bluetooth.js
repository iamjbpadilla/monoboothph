import { buildEscPosImage } from '../escpos.js';

export async function bluetoothPrint(imageDataUrl, onStatus) {
  return { success: false, message: 'Bluetooth transport is not available. Please use USB or WiFi.' };
}
