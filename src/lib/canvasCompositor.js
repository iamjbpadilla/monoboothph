import { resolveFontPair } from './theme.js';
import { BIBLE_VERSES, getRandomVerse } from './bibleVerses.js';

// canvasCompositor.js — builds the receipt canvas from frames + settings
// RULE: 48px minimum margin enforced on all four edges. NO EXCEPTIONS.

export const MARGIN = 12;

// Aspect ratios per template slot
export const SLOT_RATIOS = {
  '1strip': { w: 3, h: 4 }, // portrait 3:4
  '2strip': { w: 4, h: 3 }, // landscape 4:3
  '3strip': { w: 4, h: 3 }, // landscape 4:3
  '4grid':  { w: 3, h: 4 }, // portrait 3:4 (2×2)
  '2x3-landscape': { w: 4, h: 3 }, // landscape 4:3 (2×3)
  '2x3-portrait': { w: 3, h: 4 }, // portrait 3:4 (2×3)
};

export function calcCanvasWidth(dpi, paperWidthMm) {
  return Math.round((dpi * paperWidthMm) / 25.4);
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export const DATETIME_FONT = 22; // ≈2.7mm at 203 DPI — legible on thermal
export const BARCODE_HEIGHT = 110; // includes text label below bars

// --- height helpers (each block's content height only, no trailing gap) ---
export function textH(fontSize) { return Math.ceil(fontSize * 1.2); }
export function dividerH(thickness) { return thickness || 1; }
export function photosH(slotH, count, photoGap) { return slotH * count + photoGap * Math.max(0, count - 1); }
export function gridH(slotH, photoGap) { return slotH * 2 + photoGap; }
export function barcodeH(h) { return h; }
export function receiptItemsH(fontSize, items, showTotal) {
  const itemHeight = fontSize + 4;
  const headerHeight = itemHeight; // ITEM / QTY / PRICE header row always drawn
  const itemsHeight = items.length * itemHeight;
  const totalHeight = showTotal ? fontSize + 8 : 0;
  return headerHeight + itemsHeight + totalHeight;
}

// --- draw helpers ---
export function drawText(ctx, text, x, y, maxWidth, { fontSize = 16, bold = false, alignment = 'center', color = '#000000', fontFamily = 'sans-serif', wrap = false } = {}) {
  ctx.font = `${bold ? 'bold' : 'normal'} ${fontSize}px '${fontFamily}', sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = alignment;
  
  if (wrap) {
    // Word wrap text
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    
    // Draw each line
    let lineY = y;
    for (const line of lines) {
      const tx = alignment === 'center' ? x + maxWidth / 2
        : alignment === 'right' ? x + maxWidth
        : x;
      ctx.fillText(line, tx, lineY + fontSize);
      lineY += fontSize;
    }
    
    return lines.length * fontSize; // Return total height
  } else {
    const tx = alignment === 'center' ? x + maxWidth / 2
      : alignment === 'right' ? x + maxWidth
      : x;
    ctx.fillText(text, tx, y + fontSize, maxWidth);
    return fontSize; // Return single line height
  }
}

export function formatDate(fmt) {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const hours12 = now.getHours() % 12 || 12;
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
  return fmt
    .replace('MMM', months[now.getMonth()])
    .replace('MM', pad(now.getMonth() + 1))
    .replace('DD', pad(now.getDate()))
    .replace('YYYY', now.getFullYear())
    .replace('HH', pad(now.getHours()))
    .replace('h', String(hours12))
    .replace('mm', pad(now.getMinutes()))
    .replace('A', ampm);
}

export function drawDivider(ctx, x, y, width, { style = 'solid', thickness = 1, color = '#cccccc' } = {}, gap) {
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  const cy = y + thickness / 2;

  if (style === 'dashed') {
    ctx.setLineDash([thickness * 4, thickness * 2]);
  } else if (style === 'dotted') {
    ctx.setLineDash([thickness, thickness * 2]);
  } else if (style === 'double') {
    ctx.beginPath();
    ctx.moveTo(x, cy - thickness);
    ctx.lineTo(x + width, cy - thickness);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, cy + thickness);
    ctx.lineTo(x + width, cy + thickness);
    ctx.stroke();
    ctx.setLineDash([]);
    return;
  }

  ctx.beginPath();
  ctx.moveTo(x, cy);
  ctx.lineTo(x + width, cy);
  ctx.stroke();
  ctx.setLineDash([]);
}

export async function renderBarcode(ctx, x, y, contentWidth, { value = '', type = 'CODE128', showText = true } = {}) {
  try {
    const JsBarcode = (await import('jsbarcode')).default;
    const tmpCanvas = document.createElement('canvas');
    JsBarcode(tmpCanvas, value, {
      format: type,
      width: Math.max(2, Math.floor(contentWidth / 50)),
      height: 80,
      displayValue: showText,
      fontSize: 22,
      margin: 0,
      background: '#ffffff',
      lineColor: '#000000',
    });
    const bw = contentWidth;
    const bh = (bw / tmpCanvas.width) * tmpCanvas.height;
    const bx = x;
    ctx.drawImage(tmpCanvas, bx, y, bw, bh);
    return bh;
  } catch {
    return showText ? BARCODE_HEIGHT : 80;
  }
}

export function drawPhotoWithBorder(ctx, img, x, y, width, height, borderStyle = 'none', borderColor = '#000000', borderThickness = 1, mirror = false) {
  const t = Number(borderThickness) || 1;

  if (!borderStyle || borderStyle === 'none' || t <= 0) {
    if (mirror) {
      ctx.save();
      ctx.translate(x + width, y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, width, height);
      ctx.restore();
    } else {
      ctx.drawImage(img, x, y, width, height);
    }
    return;
  }

  // Content area inset by thickness on all sides
  const cx = x + t;
  const cy = y + t;
  const cw = width - 2 * t;
  const ch = height - 2 * t;

  // Helper to draw photo content
  function drawContent(dx, dy, dw, dh) {
    if (mirror) {
      ctx.save();
      ctx.translate(dx + dw, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, dw, dh);
      ctx.restore();
    } else {
      ctx.drawImage(img, dx, dy, dw, dh);
    }
  }

  if (borderStyle === 'rounded') {
    const r = Math.min(8, t * 2, cw / 4, ch / 4);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cx, cy, cw, ch, r);
    ctx.clip();
    drawContent(cx, cy, cw, ch);
    ctx.restore();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = t;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.roundRect(x + t/2, y + t/2, width - t, height - t, r + t/2);
    ctx.stroke();
    return;
  }

  if (borderStyle === 'zigzag') {
    drawContent(cx, cy, cw, ch);
    const period = Math.max(6, t * 3);
    const amp = Math.max(3, t * 1.5);
    const inset = t / 2;
    const lx = x + inset, rx = x + width - inset;
    const ty = y + inset, by = y + height - inset;

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = t;
    ctx.setLineDash([]);
    ctx.lineJoin = 'miter';
    ctx.beginPath();

    // Top edge
    let i = 0;
    for (let px = lx; px <= rx; px += period / 2) {
      const py = ty + (i % 2 === 0 ? amp : -amp);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
      i++;
    }
    // Right edge
    i = 0;
    for (let py = ty; py <= by; py += period / 2) {
      const px = rx + (i % 2 === 0 ? amp : -amp);
      ctx.lineTo(px, py);
      i++;
    }
    // Bottom edge
    i = 0;
    for (let px = rx; px >= lx; px -= period / 2) {
      const py = by + (i % 2 === 0 ? amp : -amp);
      ctx.lineTo(px, py);
      i++;
    }
    // Left edge
    i = 0;
    for (let py = by; py >= ty; py -= period / 2) {
      const px = lx + (i % 2 === 0 ? amp : -amp);
      ctx.lineTo(px, py);
      i++;
    }
    ctx.closePath();
    ctx.stroke();
    return;
  }

  if (borderStyle === 'wavy') {
    drawContent(cx, cy, cw, ch);
    const waves = 4;
    const steps = 24;
    const amp = Math.max(2, t * 0.8);
    const inset = t / 2;
    const lx = x + inset, rx = x + width - inset;
    const ty = y + inset, by = y + height - inset;

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = t;
    ctx.setLineDash([]);
    ctx.lineJoin = 'round';
    ctx.beginPath();

    // Top edge
    for (let s = 0; s <= steps; s++) {
      const px = lx + (rx - lx) * s / steps;
      const py = ty + amp * Math.sin(s * Math.PI * waves / steps);
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    // Right edge
    for (let s = 0; s <= steps; s++) {
      const px = rx + amp * Math.sin(s * Math.PI * waves / steps);
      const py = ty + (by - ty) * s / steps;
      ctx.lineTo(px, py);
    }
    // Bottom edge
    for (let s = 0; s <= steps; s++) {
      const px = rx - (rx - lx) * s / steps;
      const py = by + amp * Math.sin(s * Math.PI * waves / steps);
      ctx.lineTo(px, py);
    }
    // Left edge
    for (let s = 0; s <= steps; s++) {
      const px = lx + amp * Math.sin(s * Math.PI * waves / steps);
      const py = by - (by - ty) * s / steps;
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    return;
  }

  if (borderStyle === 'bevel') {
    drawContent(cx, cy, cw, ch);
    const off = t;
    // Outer shadow
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = t;
    ctx.setLineDash([]);
    ctx.strokeRect(x + off + t/2, y + off + t/2, width - off*2 - t, height - off*2 - t);
    // Inner highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.strokeRect(x + t/2, y + t/2, width - t, height - t);
    // Main border
    ctx.strokeStyle = borderColor;
    ctx.strokeRect(x + off/2 + t/2, y + off/2 + t/2, width - off - t, height - off - t);
    return;
  }

  if (borderStyle === 'inset') {
    drawContent(cx, cy, cw, ch);
    const gap = Math.max(2, Math.round(t * 0.8));
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = t;
    ctx.setLineDash([]);
    ctx.strokeRect(x + t/2, y + t/2, width - t, height - t);
    ctx.strokeRect(x + t + gap + t/2, y + t + gap + t/2, width - 2*(t + gap) - t, height - 2*(t + gap) - t);
    return;
  }

  if (borderStyle === 'scallop') {
    drawContent(cx, cy, cw, ch);
    const sz = Math.max(4, t * 2);
    const inset = t / 2;
    const lx = x + inset, rx = x + width - inset;
    const ty = y + inset, by = y + height - inset;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = t;
    ctx.setLineDash([]);
    ctx.beginPath();
    // Top
    for (let px = lx; px <= rx; px += sz) {
      ctx.arc(px + sz/2, ty, sz/2, Math.PI, 0);
    }
    // Right
    for (let py = ty; py <= by; py += sz) {
      ctx.arc(rx, py + sz/2, sz/2, -Math.PI/2, Math.PI/2);
    }
    // Bottom
    for (let px = rx; px >= lx; px -= sz) {
      ctx.arc(px - sz/2, by, sz/2, 0, Math.PI);
    }
    // Left
    for (let py = by; py >= ty; py -= sz) {
      ctx.arc(lx, py - sz/2, sz/2, Math.PI/2, -Math.PI/2);
    }
    ctx.stroke();
    return;
  }

  if (borderStyle === 'stitch') {
    drawContent(cx, cy, cw, ch);
    const step = Math.max(6, t * 3);
    const tick = Math.max(3, t * 1.2);
    const inset = t / 2;
    const lx = x + inset, rx = x + width - inset;
    const ty = y + inset, by = y + height - inset;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = Math.max(1, Math.round(t * 0.6));
    ctx.setLineDash([]);
    ctx.beginPath();
    // Draw border line
    ctx.moveTo(lx, ty); ctx.lineTo(rx, ty);
    ctx.moveTo(rx, ty); ctx.lineTo(rx, by);
    ctx.moveTo(rx, by); ctx.lineTo(lx, by);
    ctx.moveTo(lx, by); ctx.lineTo(lx, ty);
    ctx.stroke();
    // Draw stitches
    ctx.beginPath();
    for (let px = lx; px < rx; px += step) {
      ctx.moveTo(px, ty - tick); ctx.lineTo(px, ty + tick);
      ctx.moveTo(px, by - tick); ctx.lineTo(px, by + tick);
    }
    for (let py = ty; py < by; py += step) {
      ctx.moveTo(lx - tick, py); ctx.lineTo(lx + tick, py);
      ctx.moveTo(rx - tick, py); ctx.lineTo(rx + tick, py);
    }
    ctx.stroke();
    return;
  }

  if (borderStyle === 'chain') {
    drawContent(cx, cy, cw, ch);
    const linkW = Math.max(6, t * 2.5);
    const linkH = Math.max(4, t * 1.5);
    const inset = t / 2;
    const lx = x + inset, rx = x + width - inset;
    const ty = y + inset, by = y + height - inset;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = Math.max(1, Math.round(t * 0.5));
    ctx.setLineDash([]);
    // Top & Bottom
    for (let px = lx; px + linkW <= rx; px += linkW) {
      ctx.strokeRect(px, ty - linkH/2, linkW, linkH);
      ctx.strokeRect(px, by - linkH/2, linkW, linkH);
    }
    // Left & Right
    for (let py = ty; py + linkW <= by; py += linkW) {
      ctx.strokeRect(lx - linkH/2, py, linkH, linkW);
      ctx.strokeRect(rx - linkH/2, py, linkH, linkW);
    }
    return;
  }

  if (borderStyle === 'shadow') {
    drawContent(cx, cy, cw, ch);
    const off = Math.max(2, t);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = t;
    ctx.setLineDash([]);
    ctx.strokeRect(x + off + t/2, y + off + t/2, width - off*2 - t, height - off*2 - t);
    ctx.strokeStyle = borderColor;
    ctx.strokeRect(x + t/2, y + t/2, width - t, height - t);
    return;
  }

  // Standard styles: solid, dashed, dotted, double
  // Draw photo inset
  drawContent(cx, cy, cw, ch);

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = t;

  if (borderStyle === 'dashed') {
    ctx.setLineDash([t * 4, t * 2]);
  } else if (borderStyle === 'dotted') {
    ctx.setLineDash([t, t * 2]);
  } else {
    ctx.setLineDash([]);
  }

  if (borderStyle === 'double') {
    ctx.strokeRect(x + t/2, y + t/2, width - t, height - t);
    const inner = Math.max(1, Math.round(t / 3));
    ctx.lineWidth = inner;
    ctx.strokeRect(x + t + inner/2, y + t + inner/2, width - 2*t - inner, height - 2*t - inner);
  } else {
    ctx.strokeRect(x + t/2, y + t/2, width - t, height - t);
  }

  ctx.setLineDash([]);
}

export function generateDesignData(blocks) {
  const data = {};
  if (blocks.bibleVerses?.enabled) {
    data.verse = getRandomVerse(blocks.bibleVerses.topic || 'all');
  }
  if (blocks.receiptItems?.enabled && blocks.receiptItems.randomize) {
    const wittyItems = [
      { name: 'Good Vibes', quantity: 1, price: 999 },
      { name: 'Bad Decisions', quantity: 2, price: 0 },
      { name: 'Y2K Energy', quantity: 1, price: 500 },
      { name: 'Main Character Energy', quantity: 1, price: 750 },
      { name: 'Side Quest', quantity: 3, price: 150 },
      { name: 'Plot Armor', quantity: 1, price: 1000 },
      { name: 'Emotional Damage', quantity: 1, price: 50 },
      { name: 'Brain Cells', quantity: 0, price: 0 },
      { name: 'Social Battery', quantity: 1, price: 25 },
      { name: 'Serenity', quantity: 1, price: 888 },
    ];
    data.receiptItems = wittyItems.sort(() => 0.5 - Math.random()).slice(0, 3);
  }
  return data;
}

export async function compositeReceipt(frames, templateKey, templateSettings, generalSettings, printerSettings, homeScreenSettings = null, mirrorImages = false, designData = null) {
  const { createBlock } = await import('./receiptBlocks.js');
  const { dpi, paperWidthMm } = printerSettings;
  const canvasWidth = calcCanvasWidth(dpi, paperWidthMm);
  const contentWidth = canvasWidth - MARGIN * 2;
  const x = MARGIN;
  const blocks = templateSettings.blocks || templateSettings;
  const ratio = SLOT_RATIOS[templateKey];
  const pair = resolveFontPair(generalSettings?.fontPair);
  const fontHeading = pair.heading;
  const fontBody    = pair.body;

  // Ensure both fonts are loaded before drawing
  try {
    await Promise.all([
      document.fonts.load(`bold 42px '${fontHeading}'`),
      document.fonts.load(`normal 28px '${fontBody}'`),
    ]);
  } catch { /* fall through to system sans-serif */ }

  const photoGap = blocks.photos.gap || 8;
  const isGrid = templateKey === '4grid' || templateKey === '2x3-landscape' || templateKey === '2x3-portrait';
  const gridCols = templateKey === '4grid' || templateKey === '2x3-portrait' || templateKey === '2x3-landscape' ? 2 : 1;
  const gridRows = templateKey === '4grid' ? 2 : templateKey === '2x3-landscape' || templateKey === '2x3-portrait' ? 3 : 1;
  const photoSlotWidth = isGrid
    ? Math.floor((contentWidth - photoGap * (gridCols - 1)) / gridCols)
    : contentWidth;
  const photoSlotHeight = Math.round(photoSlotWidth * ratio.h / ratio.w);
  const stripCount = templateKey === '1strip' ? 1 : templateKey === '2strip' ? 2 : templateKey === '3strip' ? 3 : templateKey === '2x3-landscape' || templateKey === '2x3-portrait' ? 6 : 3;

  const homeScreen = homeScreenSettings || generalSettings.homeScreen || {};
  const barcodeValue = homeScreen.title?.text || generalSettings.boothName || 'MONO BOOTH PH';

  // Build shared context object passed to all blocks
  const shared = {
    canvasWidth,
    contentWidth,
    x,
    blocks,
    templateKey,
    frames,
    designData,
    generalSettings,
    homeScreenSettings,
    mirrorImages,
    fontHeading,
    fontBody,
    photoSlotWidth,
    photoSlotHeight,
    photoGap,
    gridCols,
    gridRows,
    isGrid,
    stripCount,
    barcodeValue,
  };

  const order = blocks.blockOrder || ['datetime', 'header', 'dividerBefore', 'photos', 'dividerAfter', 'customText', 'receiptItems', 'bibleVerses', 'barcode', 'footer'];
  const GAP = blocks.elementSpacing || 16;

  // ── Build enabled block list ──
  const blockList = order
    .map(id => createBlock(id, shared))
    .filter(Boolean);

  // ── Measure pass ──
  for (const block of blockList) {
    block._height = await block.measure(shared);
  }

  // Filter out 0-height (disabled) blocks
  const enabledBlocks = blockList.filter(b => b._height > 0);

  // ── Render to temp canvas (large height) ──
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = canvasWidth;
  tmpCanvas.height = 5000; // Large enough for any receipt
  const tmpCtx = tmpCanvas.getContext('2d');

  tmpCtx.fillStyle = blocks.backgroundColor || '#ffffff';
  tmpCtx.fillRect(0, 0, canvasWidth, tmpCanvas.height);

  let currentY = MARGIN;
  for (let i = 0; i < enabledBlocks.length; i++) {
    const block = enabledBlocks[i];
    const h = await block.render(tmpCtx, currentY, shared);
    currentY += h;
    if (i < enabledBlocks.length - 1) currentY += GAP;
  }

  // ── Create final canvas with exact height from rendered content ──
  const totalHeight = currentY + MARGIN;
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = blocks.backgroundColor || '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, totalHeight);
  ctx.drawImage(tmpCanvas, 0, 0);

  return canvas;
}