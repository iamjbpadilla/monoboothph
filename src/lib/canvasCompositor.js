import { resolveFontPair } from './theme.js';

// canvasCompositor.js — builds the receipt canvas from frames + settings
// RULE: 48px minimum margin enforced on all four edges. NO EXCEPTIONS.

const MARGIN = 48;

// Aspect ratios per template slot
export const SLOT_RATIOS = {
  '1strip': { w: 3, h: 4 }, // portrait 3:4
  '2strip': { w: 4, h: 3 }, // landscape 4:3
  '3strip': { w: 4, h: 3 }, // landscape 4:3
  '4grid':  { w: 3, h: 4 }, // portrait 3:4 (2×2)
};

export function calcCanvasWidth(dpi, paperWidthMm) {
  return Math.round((dpi * paperWidthMm) / 25.4);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const DATETIME_FONT = 22; // ≈2.7mm at 203 DPI — legible on thermal
const BARCODE_HEIGHT = 110; // includes text label below bars

// --- height helpers (must exactly match draw helpers below) ---
function textH(fontSize, gap) { return fontSize + gap; }
function dividerH(thickness, gap) { return (thickness || 1) + gap; }
function photosH(slotH, count, photoGap, gap) { return slotH * count + photoGap * Math.max(0, count - 1) + gap; }
function gridH(slotH, photoGap, gap) { return slotH * 2 + photoGap + gap; }
function barcodeH(h, gap) { return h + gap; }

// --- draw helpers ---
function drawText(ctx, text, x, y, maxWidth, { fontSize = 16, bold = false, alignment = 'center', color = '#000000', fontFamily = 'sans-serif' } = {}) {
  ctx.font = `${bold ? 'bold' : 'normal'} ${fontSize}px '${fontFamily}', sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = alignment;
  const tx = alignment === 'center' ? x + maxWidth / 2
    : alignment === 'right' ? x + maxWidth
    : x;
  ctx.fillText(text, tx, y + fontSize, maxWidth);
}

function formatDate(fmt) {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return fmt
    .replace('MMM', months[now.getMonth()])
    .replace('DD', pad(now.getDate()))
    .replace('YYYY', now.getFullYear())
    .replace('HH', pad(now.getHours()))
    .replace('mm', pad(now.getMinutes()));
}

function drawDivider(ctx, x, y, width, { style = 'solid', thickness = 1, color = '#cccccc' } = {}, gap) {
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

async function renderBarcode(ctx, x, y, contentWidth, { value = 'SNAPROLL', type = 'CODE128', showText = true } = {}) {
  try {
    const JsBarcode = (await import('jsbarcode')).default;
    const tmpCanvas = document.createElement('canvas');
    JsBarcode(tmpCanvas, value, {
      format: type,
      width: 3,
      height: 80,
      displayValue: showText,
      fontSize: 22,
      margin: 0,
      background: '#ffffff',
      lineColor: '#000000',
    });
    const bw = Math.min(tmpCanvas.width, contentWidth);
    const bh = (bw / tmpCanvas.width) * tmpCanvas.height;
    const bx = x + (contentWidth - bw) / 2;
    ctx.drawImage(tmpCanvas, bx, y, bw, bh);
    return bh;
  } catch {
    return showText ? BARCODE_HEIGHT : 80;
  }
}

function drawPhotoWithBorder(ctx, img, x, y, width, height, borderStyle, borderColor) {
  if (borderStyle && borderStyle !== 'none') {
    const thickness = borderStyle === 'thin' ? 1 : borderStyle === 'thick' ? 4 : 2;
    const radius = borderStyle === 'rounded' ? 8 : 0;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = thickness;
    if (radius > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
      ctx.stroke();
      ctx.clip();
      ctx.drawImage(img, x, y, width, height);
      ctx.restore();
      return;
    }
    ctx.strokeRect(x + thickness / 2, y + thickness / 2, width - thickness, height - thickness);
  }
  ctx.drawImage(img, x, y, width, height);
}

export async function compositeReceipt(frames, templateKey, templateSettings, generalSettings, printerSettings) {
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
  const elGap = blocks.elementSpacing || 16;
  const photoSlotWidth = templateKey === '4grid'
    ? Math.floor((contentWidth - photoGap) / 2)
    : contentWidth;
  const photoSlotHeight = Math.round(photoSlotWidth * ratio.h / ratio.w);
  const stripCount = templateKey === '1strip' ? 1 : templateKey === '2strip' ? 2 : 3;

  const order = blocks.blockOrder || ['header', 'dividerBefore', 'photos', 'dividerAfter', 'datetime', 'customText', 'barcode', 'footer'];

  // ── Compute total height (must mirror drawing order exactly) ──────────────
  let contentH = 0;
  for (const key of order) {
    switch (key) {
      case 'header':
        if (blocks.header.enabled) {
          if (blocks.header.image) {
            contentH += Math.min(100, contentWidth * 0.25) + elGap;
          } else {
            contentH += textH(blocks.header.fontSize, elGap);
            const subtitleText = blocks.header.subtitle || (blocks.header.text ? '' : generalSettings.eventName);
            if (subtitleText) {
              const subFontSize = Math.max(16, Math.round(blocks.header.fontSize * 0.52));
              contentH += textH(subFontSize, elGap);
            }
          }
        }
        break;
      case 'dividerBefore':
        if (blocks.divider.enabled) contentH += dividerH(blocks.divider.thickness, elGap);
        break;
      case 'photos':
        contentH += templateKey === '4grid'
          ? gridH(photoSlotHeight, photoGap, elGap)
          : photosH(photoSlotHeight, stripCount, photoGap, elGap);
        break;
      case 'dividerAfter':
        if (blocks.divider.enabled) contentH += dividerH(blocks.divider.thickness, elGap);
        break;
      case 'datetime':
        if (blocks.datetime.enabled) contentH += textH(DATETIME_FONT, elGap);
        break;
      case 'customText':
        if (blocks.customText.enabled && blocks.customText.content) contentH += textH(blocks.customText.fontSize, elGap);
        break;
      case 'barcode':
        if (blocks.barcode.enabled) contentH += barcodeH(blocks.barcode.showText !== false ? BARCODE_HEIGHT : 80, elGap);
        break;
      case 'footer':
        if (blocks.footer.enabled) contentH += textH(blocks.footer.fontSize, elGap);
        break;
    }
  }

  const totalHeight = MARGIN + contentH + MARGIN;

  // ── Create canvas ─────────────────────────────────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = blocks.backgroundColor || '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, totalHeight);

  let y = MARGIN;

  for (const key of order) {
    switch (key) {
      case 'header': {
        if (!blocks.header.enabled) break;

        // If image is uploaded, draw it instead of text
        if (blocks.header.image) {
          const img = await loadImage(blocks.header.image);
          const imgHeight = Math.min(100, contentWidth * 0.25);
          const imgWidth = imgHeight * (img.width / img.height);
          const imgX = blocks.header.alignment === 'center' ? x + (contentWidth - imgWidth) / 2 :
                       blocks.header.alignment === 'right' ? x + contentWidth - imgWidth : x;
          ctx.drawImage(img, imgX, y, imgWidth, imgHeight);
          y += imgHeight + elGap;
        } else {
          // Use custom title/subtitle or fall back to defaults
          const titleText = blocks.header.title || blocks.header.text || generalSettings.boothName;
          const subtitleText = blocks.header.subtitle || (blocks.header.text ? '' : generalSettings.eventName);

          drawText(ctx, titleText, x, y, contentWidth, {
            fontSize: blocks.header.fontSize,
            bold: blocks.header.bold,
            alignment: blocks.header.alignment,
            fontFamily: fontHeading,
          });
          y += textH(blocks.header.fontSize, elGap);

          if (subtitleText) {
            const subFontSize = Math.max(16, Math.round(blocks.header.fontSize * 0.52));
            drawText(ctx, subtitleText, x, y, contentWidth, {
              fontSize: subFontSize,
              bold: false,
              alignment: blocks.header.alignment,
              color: '#666666',
              fontFamily: fontBody,
            });
            y += textH(subFontSize, elGap);
          }
        }
        break;
      }
      case 'photos': {
        if (templateKey === '4grid') {
          const imgs = await Promise.all(frames.slice(0, 4).map(f => f ? loadImage(f) : null));
          const slots = [[0,0],[1,0],[0,1],[1,1]];
          for (let i = 0; i < 4; i++) {
            const [col, row] = slots[i];
            const px = x + col * (photoSlotWidth + photoGap);
            const py = y + row * (photoSlotHeight + photoGap);
            if (imgs[i]) {
              drawPhotoWithBorder(ctx, imgs[i], px, py, photoSlotWidth, photoSlotHeight,
                blocks.photos.borderStyle, blocks.photos.borderColor);
            } else {
              ctx.fillStyle = '#e8e8e8';
              ctx.fillRect(px, py, photoSlotWidth, photoSlotHeight);
            }
          }
          y += gridH(photoSlotHeight, photoGap, elGap);
        } else {
          for (let i = 0; i < stripCount; i++) {
            const py = y + i * (photoSlotHeight + photoGap);
            if (frames[i]) {
              const img = await loadImage(frames[i]);
              drawPhotoWithBorder(ctx, img, x, py, photoSlotWidth, photoSlotHeight,
                blocks.photos.borderStyle, blocks.photos.borderColor);
            } else {
              ctx.fillStyle = '#e8e8e8';
              ctx.fillRect(x, py, photoSlotWidth, photoSlotHeight);
            }
          }
          y += photosH(photoSlotHeight, stripCount, photoGap, elGap);
        }
        break;
      }
      case 'dividerBefore': {
        if (!blocks.divider.enabled) break;
        drawDivider(ctx, x, y, contentWidth, blocks.divider, elGap);
        y += dividerH(blocks.divider.thickness, elGap);
        break;
      }
      case 'dividerAfter': {
        if (!blocks.divider.enabled) break;
        drawDivider(ctx, x, y, contentWidth, blocks.divider, elGap);
        y += dividerH(blocks.divider.thickness, elGap);
        break;
      }
      case 'datetime': {
        if (!blocks.datetime.enabled) break;
        const dateStr = formatDate(blocks.datetime.format || 'MMM DD, YYYY HH:mm');
        drawText(ctx, dateStr, x, y, contentWidth, {
          fontSize: DATETIME_FONT,
          alignment: 'center',
          color: '#555555',
          fontFamily: fontBody,
        });
        y += textH(DATETIME_FONT, elGap);
        break;
      }
      case 'customText': {
        if (!blocks.customText.enabled || !blocks.customText.content) break;
        drawText(ctx, blocks.customText.content, x, y, contentWidth, {
          fontSize: blocks.customText.fontSize,
          alignment: blocks.customText.alignment,
          fontFamily: fontBody,
        });
        y += textH(blocks.customText.fontSize, elGap);
        break;
      }
      case 'barcode': {
        if (!blocks.barcode.enabled) break;
        const bh = await renderBarcode(ctx, x, y, contentWidth, blocks.barcode);
        y += barcodeH(bh, elGap);
        break;
      }
      case 'footer': {
        if (!blocks.footer.enabled) break;
        drawText(ctx, blocks.footer.text, x, y, contentWidth, {
          fontSize: blocks.footer.fontSize,
          alignment: blocks.footer.alignment,
          color: '#555555',
          fontFamily: fontBody,
        });
        y += textH(blocks.footer.fontSize, elGap);
        break;
      }
    }
  }

  return canvas;
}
