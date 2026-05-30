import { buildEscPosImage } from '../escpos.js';

export async function wifiPrint(imageDataUrl, ip, port, onStatus) {
  try {
    if (!ip) throw new Error('Printer IP address is not configured.');
    onStatus(`Connecting to ${ip}:${port}...`);
    const bytes = await buildEscPosImage(imageDataUrl);
    const base64 = btoa(String.fromCharCode(...bytes));

    const response = await fetch(`http://${ip}:${port}/print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: base64, encoding: 'base64' }),
    });

    if (!response.ok) {
      throw new Error(`Printer responded with ${response.status}`);
    }
    return { success: true, message: 'Printed via WiFi' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}
