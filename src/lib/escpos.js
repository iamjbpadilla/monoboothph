// ESC/POS byte builder — raster image printing

const ESC = 0x1b;
const GS = 0x1d;

function initPrinter() {
  return new Uint8Array([ESC, 0x40]); // ESC @
}

function feedLines(n = 4) {
  return new Uint8Array([ESC, 0x64, n]); // ESC d n
}

function cutPaper() {
  return new Uint8Array([GS, 0x56, 0x42, 0x00]); // GS V B — full cut
}

// Convert image dataURL to ESC/POS raster bitmap
async function imageToEscPos(dataUrl) {
  const img = new Image();
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
    img.src = dataUrl;
  });

  const canvas = document.createElement('canvas');
  // ESC/POS expects width multiple of 8
  const w = Math.ceil(img.width / 8) * 8;
  canvas.width = w;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, img.height);
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, w, img.height);
  const { data } = imageData;
  const bytesPerRow = w / 8;
  const result = [];

  // GS v 0 — raster bit image
  // m=0 normal, xL xH = bytesPerRow, yL yH = height
  result.push(GS, 0x76, 0x30, 0x00);
  result.push(bytesPerRow & 0xff, (bytesPerRow >> 8) & 0xff);
  result.push(img.height & 0xff, (img.height >> 8) & 0xff);

  for (let row = 0; row < img.height; row++) {
    for (let byteIdx = 0; byteIdx < bytesPerRow; byteIdx++) {
      let byte = 0;
      for (let bit = 0; bit < 8; bit++) {
        const x = byteIdx * 8 + bit;
        const pixelIdx = (row * w + x) * 4;
        const r = data[pixelIdx];
        const g = data[pixelIdx + 1];
        const b = data[pixelIdx + 2];
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        if (luminance < 128) {
          byte |= (0x80 >> bit);
        }
      }
      result.push(byte);
    }
  }

  return new Uint8Array(result);
}

export async function buildEscPosImage(dataUrl) {
  const init = initPrinter();
  const imgBytes = await imageToEscPos(dataUrl);
  const feed = feedLines(4);
  const cut = cutPaper();

  const total = init.length + imgBytes.length + feed.length + cut.length;
  const out = new Uint8Array(total);
  let offset = 0;
  out.set(init, offset); offset += init.length;
  out.set(imgBytes, offset); offset += imgBytes.length;
  out.set(feed, offset); offset += feed.length;
  out.set(cut, offset);
  return out;
}
