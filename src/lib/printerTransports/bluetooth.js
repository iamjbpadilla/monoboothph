import { buildEscPosImage } from '../escpos.js';

export async function bluetoothPrint(imageDataUrl, onStatus) {
  try {
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth API not supported in this browser.');
    }
    onStatus('Requesting Bluetooth device...');
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['generic_access', '000018f0-0000-1000-8000-00805f9b34fb'],
    });
    onStatus('Connecting...');
    const server = await device.gatt.connect();
    
    // Try to discover services
    onStatus('Discovering services...');
    const services = await server.getServices();
    console.log('Available services:', services.map(s => s.uuid));
    
    // Try to find a suitable service for printing
    let service = null;
    let characteristic = null;
    
    // Try the known service first
    try {
      service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');
    } catch (e) {
      // If known service fails, try to find any service with write characteristic
      console.log('Known service not found, searching for alternative...');
      for (const s of services) {
        try {
          const characteristics = await s.getCharacteristics();
          for (const c of characteristics) {
            if (c.properties.write || c.properties.writeWithoutResponse) {
              service = s;
              characteristic = c;
              console.log('Found writable characteristic:', c.uuid);
              break;
            }
          }
          if (characteristic) break;
        } catch (err) {
          continue;
        }
      }
    }
    
    if (!service || !characteristic) {
      throw new Error('No suitable Bluetooth service found for printing. Make sure your printer is in pairing mode.');
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
    return { success: false, message: err.message || 'Bluetooth connection failed' };
  }
}
