// ESC/POS byte builder — raster image printing with Floyd-Steinberg dithering

const ESC = 0x1b;
const GS = 0x1d;

// Target print width for 203 DPI × 80 mm paper (printable area ≈ 72 mm → 576 px)
const PRINT_WIDTH_PX = 576;

// Bayer 4×4 ordered dither threshold matrix (normalized 0–255)
const BAYER_4X4 = [
   0, 136,  34, 170,
 204,  68, 238, 102,
  51, 187,  17, 153,
 255, 119, 221,  85,
];

function initPrinter() {
  return new Uint8Array([ESC, 0x40]); // ESC @
}

function feedLines(n = 4) {
  return new Uint8Array([ESC, 0x64, n]); // ESC d n
}

function cutPaper() {
  return new Uint8Array([GS, 0x56, 0x42, 0x00]); // GS V B — full cut
}

function clamp(v) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

/**
 * Load an image dataUrl into an offscreen canvas, resize to targetWidth,
 * and return { ctx, w, h } ready for pixel manipulation.
 */
async function loadResized(dataUrl, targetWidth) {
  const img = new Image();
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
    img.src = dataUrl;
  });

  const scale = targetWidth / img.width;
  const w = targetWidth;
  const h = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return { canvas, ctx, w, h };
}

/**
 * Build a grayscale Float32Array from RGBA imageData, applying brightness,
 * contrast and gamma corrections.
 */
function buildGrayscaleMatrix(imageData, opts = {}) {
  const { gamma = 1.2, brightness = 0, contrast = 0 } = opts;
  const { data, width, height } = imageData;
  const gray = new Float32Array(width * height);

  // Pre-compute contrast factor (S-curve scale)
  const cf = (contrast + 100) / 100; // 0 → 0.0×, 100 → 1.0× (neutral), 200 → 2.0×

  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];

    // Standard luminance
    let lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // Brightness offset
    lum = clamp(lum + brightness * 2.55);

    // Contrast (pivot around 128)
    lum = clamp((lum - 128) * cf + 128);

    // Gamma boost (> 1.0 brightens midtones to prevent skin tones going too dark)
    lum = clamp(Math.pow(lum / 255, 1.0 / gamma) * 255);

    gray[i] = lum;
  }
  return gray;
}

/**
 * Floyd-Steinberg error diffusion — modifies the grayscale Float32Array in-place
 * and returns a binary Uint8Array (0 = black, 255 = white).
 */
function floydSteinberg(gray, width, height) {
  const buf = new Float32Array(gray); // work on a copy
  const result = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const oldVal = buf[idx];
      const newVal = oldVal < 128 ? 0 : 255;
      result[idx] = newVal;
      const err = oldVal - newVal;

      if (x + 1 < width)                        buf[idx + 1]           += err * 7 / 16;
      if (y + 1 < height && x - 1 >= 0)         buf[idx + width - 1]   += err * 3 / 16;
      if (y + 1 < height)                        buf[idx + width]       += err * 5 / 16;
      if (y + 1 < height && x + 1 < width)      buf[idx + width + 1]   += err * 1 / 16;
    }
  }
  return result;
}

/**
 * Bayer 4×4 ordered dithering.
 */
function bayerDither(gray, width, height) {
  const result = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const threshold = BAYER_4X4[(y % 4) * 4 + (x % 4)];
      result[idx] = gray[idx] > threshold ? 255 : 0;
    }
  }
  return result;
}

/**
 * Simple threshold dithering.
 */
function simpleDither(gray, width, height, threshold = 128) {
  const result = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    result[i] = gray[i] < threshold ? 0 : 255;
  }
  return result;
}

/**
 * Pack binary (0/255) pixel array into 1-bit bytes for ESC/POS raster command.
 * Width must be a multiple of 8 (padded inside this function).
 */
function packBits(binary, width, height) {
  const paddedW = Math.ceil(width / 8) * 8;
  const bytesPerRow = paddedW / 8;
  const result = [];

  // GS v 0 — raster bit image header
  result.push(GS, 0x76, 0x30, 0x00);
  result.push(bytesPerRow & 0xff, (bytesPerRow >> 8) & 0xff);
  result.push(height & 0xff, (height >> 8) & 0xff);

  for (let row = 0; row < height; row++) {
    for (let byteIdx = 0; byteIdx < bytesPerRow; byteIdx++) {
      let byte = 0;
      for (let bit = 0; bit < 8; bit++) {
        const x = byteIdx * 8 + bit;
        if (x < width) {
          const pixel = binary[row * width + x];
          if (pixel === 0) byte |= (0x80 >> bit); // black = set bit
        }
      }
      result.push(byte);
    }
  }
  return new Uint8Array(result);
}

/**
 * Full thermal printing pipeline. Returns packed Uint8Array ready for ESC/POS.
 *
 * opts = { gamma, brightness, contrast, dithering }
 *   gamma:      0.8 – 2.0  (default 1.2)
 *   brightness: -100 – 100 (default 0)
 *   contrast:   -100 – 100 (default 0)
 *   dithering:  'floyd' | 'bayer' | 'simple' (default 'floyd')
 */
export async function optimizeImageForThermalPrinting(dataUrl, opts = {}) {
  const { dithering = 'floyd', ...colorOpts } = opts;

  const { ctx, w, h } = await loadResized(dataUrl, PRINT_WIDTH_PX);
  const imageData = ctx.getImageData(0, 0, w, h);
  const gray = buildGrayscaleMatrix(imageData, colorOpts);

  let binary;
  if (dithering === 'bayer') {
    binary = bayerDither(gray, w, h);
  } else if (dithering === 'simple') {
    binary = simpleDither(gray, w, h);
  } else {
    binary = floydSteinberg(gray, w, h);
  }

  return packBits(binary, w, h);
}

/**
 * Same pipeline as optimizeImageForThermalPrinting but returns a visible
 * grayscale/B&W canvas dataUrl for UI preview (not packed bits).
 */
export async function generateThermalPreview(dataUrl, opts = {}) {
  const { dithering = 'floyd', ...colorOpts } = opts;

  const { canvas, ctx, w, h } = await loadResized(dataUrl, PRINT_WIDTH_PX);
  const imageData = ctx.getImageData(0, 0, w, h);
  const gray = buildGrayscaleMatrix(imageData, colorOpts);

  let binary;
  if (dithering === 'bayer') {
    binary = bayerDither(gray, w, h);
  } else if (dithering === 'simple') {
    binary = simpleDither(gray, w, h);
  } else {
    binary = floydSteinberg(gray, w, h);
  }

  // Write result back to canvas for display
  const out = ctx.createImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    const v = binary[i]; // 0 or 255
    out.data[i * 4]     = v;
    out.data[i * 4 + 1] = v;
    out.data[i * 4 + 2] = v;
    out.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(out, 0, 0);
  return canvas.toDataURL('image/png');
}

export async function buildEscPosImage(dataUrl, printerSettings = {}) {
  const init = initPrinter();
  const feed = feedLines(4);
  const cut = cutPaper();

  const opts = {
    gamma:      printerSettings.printGamma      ?? 1.2,
    brightness: printerSettings.printBrightness ?? 0,
    contrast:   printerSettings.printContrast   ?? 0,
    dithering:  printerSettings.printDithering  ?? 'floyd',
  };

  // --- Apply print-only top/bottom padding (does not affect on-screen preview) ---
  const topPad = printerSettings.printTopMargin ?? 0;
  const mult = printerSettings.printBottomMultiplier ?? 1;
  const bottomPad = mult < 0 ? Math.round(topPad / Math.abs(mult)) : Math.round(topPad * mult);

  let paddedDataUrl = dataUrl;
  if (topPad > 0 || bottomPad > 0) {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });
    const w = img.width;
    const h = img.height;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h + topPad + bottomPad;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, c.height);
    ctx.drawImage(img, 0, topPad, w, h);
    paddedDataUrl = c.toDataURL('image/png');
  }

  const imgBytes = await optimizeImageForThermalPrinting(paddedDataUrl, opts);

  // ESC/POS height limit: 2 bytes = max 65,535 pixels
  const height = imgBytes[6] | (imgBytes[7] << 8);
  if (height > 65535) {
    console.warn(`Canvas height ${height}px exceeds ESC/POS limit. Print may be truncated.`);
  }

  const total = init.length + imgBytes.length + feed.length + cut.length;
  const out = new Uint8Array(total);
  let offset = 0;
  out.set(init, offset); offset += init.length;
  out.set(imgBytes, offset); offset += imgBytes.length;
  out.set(feed, offset); offset += feed.length;
  out.set(cut, offset);
  return out;
}
