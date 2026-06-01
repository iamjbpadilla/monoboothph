import { buildEscPosImage } from '../escpos.js';
import { UsbPrinterService } from './UsbPrinterService.js';

export async function usbPrint(imageDataUrl, onStatus, printerSettings = {}) {
  try {
    onStatus('Preparing print data...');
    const bytes = await buildEscPosImage(imageDataUrl, printerSettings);

    await UsbPrinterService.connectToFirstPrinter(onStatus);

    onStatus('Sending data to printer...');
    await UsbPrinterService.write(bytes);

    return { success: true, message: '' };
  } catch (err) {
    const msg = err.message || 'USB print failed';
    onStatus(msg);
    return { success: false, message: msg };
  } finally {
    await UsbPrinterService.disconnect();
  }
}

