// Bluetooth transport disabled - not supported in this build
export async function bluetoothPrint(imageDataUrl, onStatus) {
  return { success: false, message: 'Bluetooth transport is disabled in this build' };
}
