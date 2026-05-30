export async function simulatePrint(imageDataUrl, onStatus) {
  onStatus('Simulating print job...');
  await new Promise(r => setTimeout(r, 800));
  onStatus('Sending to printer...');
  await new Promise(r => setTimeout(r, 800));
  onStatus('Printing...');
  await new Promise(r => setTimeout(r, 600));
  return { success: true, message: 'Print simulated successfully' };
}
