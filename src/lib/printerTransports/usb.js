import { buildEscPosImage } from '../escpos.js';

export async function usbPrint(imageDataUrl, onStatus) {
  try {
    if (!navigator.usb) {
      throw new Error('WebUSB API not supported in this browser.');
    }
    onStatus('Requesting USB device...');
    const device = await navigator.usb.requestDevice({ filters: [] });
    onStatus('Opening USB connection...');
    await device.open();
    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }
    await device.claimInterface(0);

    onStatus('Building print data...');
    const bytes = await buildEscPosImage(imageDataUrl);
    const CHUNK = 64;
    onStatus('Sending data...');
    for (let i = 0; i < bytes.length; i += CHUNK) {
      await device.transferOut(1, bytes.slice(i, i + CHUNK));
    }
    await device.close();
    return { success: true, message: 'Printed via USB' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}
