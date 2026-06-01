import { buildEscPosImage } from '../escpos.js';

export async function bluetoothPrint(imageDataUrl, onStatus) {
  try {
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth API not supported in this browser. Bluetooth printing is only available on the Android app.');
    }
    
    if (!imageDataUrl) {
      throw new Error('No image data provided for printing');
    }
    
    // Check if running in browser (not Capacitor app)
    const isCapacitor = window.Capacitor && window.Capacitor.isNative();
    if (!isCapacitor) {
      throw new Error('Bluetooth printing is only available on the Android app. Please use USB or WiFi for browser testing.');
    }
    
    onStatus('Requesting Bluetooth device...');
    // Request device without specifying services to see all available
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
    });
    
    onStatus('Connecting...');
    const server = await device.gatt.connect();
    
    onStatus('Discovering services...');
    // Get all services the device offers
    const services = await server.getPrimaryServices();
    console.log('Available services:', services.map(s => s.uuid));
    
    // Try to find a service with a writable characteristic
    let service = null;
    let characteristic = null;
    
    for (const s of services) {
      try {
        const characteristics = await s.getCharacteristics();
        for (const c of characteristics) {
          if (c.properties.write || c.properties.writeWithoutResponse) {
            service = s;
            characteristic = c;
            console.log('Found writable characteristic:', c.uuid, 'in service:', s.uuid);
            break;
          }
        }
        if (characteristic) break;
      } catch (err) {
        console.log('Error accessing service:', s.uuid, err);
        continue;
      }
    }
    
    if (!service || !characteristic) {
      throw new Error('No writable Bluetooth characteristic found. Make sure your printer is connected and in printing mode.');
    }

    onStatus('Building print data...');
    const bytes = await buildEscPosImage(imageDataUrl);
    const CHUNK = 512;
    onStatus('Sending data...');
    
    for (let i = 0; i < bytes.length; i += CHUNK) {
      const chunk = bytes.slice(i, i + CHUNK);
      if (characteristic.properties.writeWithoutResponse) {
        await characteristic.writeValueWithoutResponse(chunk);
      } else {
        await characteristic.writeValue(chunk);
      }
    }
    
    await device.gatt.disconnect();
    return { success: true, message: 'Printed via Bluetooth' };
  } catch (err) {
    console.error('Bluetooth print error:', err);
    let errorMessage = 'Bluetooth connection failed';
    if (err) {
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.type === 'error') {
        errorMessage = 'Bluetooth operation failed';
      }
    }
    return { success: false, message: errorMessage };
  }
}
