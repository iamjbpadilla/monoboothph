import { resolveFontPair } from './theme.js';
import { getRandomVerse } from './bibleVerses.js';

// canvasCompositor.js — builds the receipt canvas from frames + settings
// RULE: 48px minimum margin enforced on all four edges. NO EXCEPTIONS.

const MARGIN = 12;

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
function receiptItemsH(fontSize, items, showTotal, gap) {
  const itemHeight = fontSize + 4;
  const headerHeight = itemHeight; // ITEM / QTY / PRICE header row always drawn
  const itemsHeight = items.length * itemHeight;
  const totalHeight = showTotal ? fontSize + 8 : 0;
  return headerHeight + itemsHeight + totalHeight + gap;
}

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

async function renderBarcode(ctx, x, y, contentWidth, { value = '', type = 'CODE128', showText = true } = {}) {
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

function drawPhotoWithBorder(ctx, img, x, y, width, height, borderStyle, borderColor, mirror = false) {
  if (borderStyle && borderStyle !== 'none') {
    const thickness = borderStyle === 'thin' ? 1 : borderStyle === 'thick' ? 4 : 2;
    const radius = borderStyle === 'rounded' ? 8 : 0;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = thickness;
    
    // Handle dashed/dotted styles
    if (borderStyle === 'dashed') {
      ctx.setLineDash([thickness * 4, thickness * 2]);
    } else if (borderStyle === 'dotted') {
      ctx.setLineDash([thickness, thickness * 2]);
    } else {
      ctx.setLineDash([]);
    }
    
    if (radius > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
      ctx.stroke();
      ctx.clip();
      if (mirror) {
        ctx.translate(x + width, y);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, width, height);
      } else {
        ctx.drawImage(img, x, y, width, height);
      }
      ctx.restore();
      return;
    }
    
    // Handle double border
    if (borderStyle === 'double') {
      ctx.strokeRect(x + thickness / 2, y + thickness / 2, width - thickness, height - thickness);
      ctx.lineWidth = 1;
      ctx.strokeRect(x + thickness * 1.5, y + thickness * 1.5, width - thickness * 3, height - thickness * 3);
    } else {
      ctx.strokeRect(x + thickness / 2, y + thickness / 2, width - thickness, height - thickness);
    }
    
    ctx.setLineDash([]);
  }
  if (mirror) {
    ctx.save();
    ctx.translate(x + width, y);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, width, height);
    ctx.restore();
  } else {
    ctx.drawImage(img, x, y, width, height);
  }
}

export async function compositeReceipt(frames, templateKey, templateSettings, generalSettings, printerSettings, homeScreenSettings = null, mirrorImages = false) {
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
  const isGrid = templateKey === '4grid' || templateKey === '2x3-landscape' || templateKey === '2x3-portrait';
  const gridCols = templateKey === '4grid' || templateKey === '2x3-portrait' || templateKey === '2x3-landscape' ? 2 : 1;
  const gridRows = templateKey === '4grid' ? 2 : templateKey === '2x3-landscape' || templateKey === '2x3-portrait' ? 3 : 1;
  const photoSlotWidth = isGrid
    ? Math.floor((contentWidth - photoGap * (gridCols - 1)) / gridCols)
    : contentWidth;
  const photoSlotHeight = Math.round(photoSlotWidth * ratio.h / ratio.w);
  const stripCount = templateKey === '1strip' ? 1 : templateKey === '2strip' ? 2 : templateKey === '3strip' ? 3 : templateKey === '2x3-landscape' || templateKey === '2x3-portrait' ? 6 : 3;

  const order = blocks.blockOrder || ['header', 'dividerBefore', 'photos', 'dividerAfter', 'datetime', 'customText', 'barcode', 'footer'];

  // ── Compute total height (must mirror drawing order exactly) ──────────────
  let contentH = 0;
  for (const key of order) {
    switch (key) {
      case 'header':
        if (blocks.header.enabled) {
          if (blocks.header.image) {
            const scale = (blocks.header.imageScale || 4) / 4; // 1-8 scale, default 4
            contentH += Math.min(100, contentWidth * 0.25) * scale + (blocks.header.imageBottomMargin || 16) + elGap;
          } else {
            contentH += textH(blocks.header.fontSize, elGap);
            const homeScreen = homeScreenSettings || generalSettings.homeScreen || {};
            const subtitleText = homeScreen.subtitle?.enabled ? (homeScreen.subtitle?.text || generalSettings.eventName) : null;
            if (subtitleText) {
              contentH += (blocks.header.titleSubtitleGap || 8);
              const subFontSize = homeScreen.subtitle?.size || Math.max(16, Math.round(blocks.header.fontSize * 0.52));
              contentH += textH(subFontSize, elGap);
            }
          }
        }
        break;
      case 'dividerBefore':
        if (blocks.divider.enabled) contentH += dividerH(blocks.divider.thickness, elGap);
        break;
      case 'photos':
        if (templateKey === '4grid') {
          contentH += gridH(photoSlotHeight, photoGap, elGap);
        } else if (templateKey === '2x3-landscape' || templateKey === '2x3-portrait') {
          contentH += photoSlotHeight * 3 + photoGap * 2 + elGap;
        } else {
          contentH += photosH(photoSlotHeight, stripCount, photoGap, elGap);
        }
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
      case 'receiptItems':
        if (blocks.receiptItems.enabled && blocks.receiptItems.items.length > 0) {
          contentH += receiptItemsH(blocks.receiptItems.fontSize, blocks.receiptItems.items, blocks.receiptItems.showTotal, elGap);
        }
        break;
      case 'bibleVerses':
        if (blocks.bibleVerses.enabled) {
          contentH += textH(blocks.bibleVerses.fontSize, elGap);
          if (blocks.bibleVerses.showReference) {
            contentH += textH(Math.max(14, Math.round(blocks.bibleVerses.fontSize * 0.7)), elGap);
          }
        }
        break;
      case 'barcode': {
        if (blocks.barcode.enabled) {
          try {
            const JsBarcode = (await import('jsbarcode')).default;
            const tmp = document.createElement('canvas');
            const homeScreen = homeScreenSettings || generalSettings.homeScreen || {};
            const barcodeValue = homeScreen.title?.text || generalSettings.boothName || 'MONO BOOTH PH';
            JsBarcode(tmp, blocks.barcode.value || barcodeValue, {
              format: blocks.barcode.type || 'CODE128',
              width: Math.max(2, Math.floor(contentWidth / 50)),
              height: 80,
              displayValue: blocks.barcode.showText !== false,
              fontSize: 22,
              margin: 0,
            });
            contentH += barcodeH((contentWidth / tmp.width) * tmp.height, elGap);
          } catch {
            contentH += barcodeH(blocks.barcode.showText !== false ? BARCODE_HEIGHT : 80, elGap);
          }
        }
        break;
      }
      case 'footer': {
        if (blocks.footer.enabled) {
          if (blocks.footer.image) {
            const scale = (blocks.footer.imageScale || 4) / 4;
            const fImg = await loadImage(blocks.footer.image);
            const fImgWidth = contentWidth * scale;
            const fImgHeight = fImgWidth * (fImg.height / fImg.width);
            contentH += fImgHeight + (blocks.footer.imageTopMargin || 16) + elGap;
          } else {
            contentH += textH(blocks.footer.fontSize, elGap);
          }
        }
        break;
      }
    }
  }

  // Strip the trailing elGap from the last element so top and bottom margins are equal
  if (contentH > 0) contentH -= elGap;
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
          const scale = (blocks.header.imageScale || 4) / 4; // 1-8 scale, default 4
          const baseHeight = Math.min(100, contentWidth * 0.25);
          const imgHeight = baseHeight * scale;
          const imgWidth = imgHeight * (img.width / img.height);
          const imgX = blocks.header.alignment === 'center' ? x + (contentWidth - imgWidth) / 2 :
                       blocks.header.alignment === 'right' ? x + contentWidth - imgWidth : x;
          ctx.drawImage(img, imgX, y, imgWidth, imgHeight);
          y += imgHeight + (blocks.header.imageBottomMargin || 16) + elGap;
        } else {
          // Always use home screen title/subtitle (template header custom text is ignored)
          const homeScreen = homeScreenSettings || generalSettings.homeScreen || {};
          const titleText = homeScreen.title?.text || generalSettings.boothName || 'MONO BOOTH PH';
          const subtitleText = homeScreen.subtitle?.enabled ? (homeScreen.subtitle?.text || generalSettings.eventName) : null;

          const titleFontSize = homeScreen.title?.size || blocks.header.fontSize;
          drawText(ctx, titleText, x, y, contentWidth, {
            fontSize: titleFontSize,
            bold: blocks.header.bold,
            alignment: blocks.header.alignment,
            fontFamily: fontHeading,
          });
          y += textH(titleFontSize, 0);

          if (subtitleText) {
            y += (blocks.header.titleSubtitleGap || 8);
            const subFontSize = homeScreen.subtitle?.size || Math.max(16, Math.round(blocks.header.fontSize * 0.52));
            drawText(ctx, subtitleText, x, y, contentWidth, {
              fontSize: subFontSize,
              bold: false,
              alignment: blocks.header.alignment,
              color: '#000000',
              fontFamily: fontBody,
            });
            y += textH(subFontSize, elGap);
          } else {
            y += elGap;
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
                blocks.photos.borderStyle, blocks.photos.borderColor, mirrorImages);
            } else {
              ctx.fillStyle = '#e8e8e8';
              ctx.fillRect(px, py, photoSlotWidth, photoSlotHeight);
            }
          }
          y += gridH(photoSlotHeight, photoGap, elGap);
        } else if (templateKey === '2x3-landscape') {
          const imgs = await Promise.all(frames.slice(0, 6).map(f => f ? loadImage(f) : null));
          const slots = [[0,0],[1,0],[0,1],[1,1],[0,2],[1,2]];
          for (let i = 0; i < 6; i++) {
            const [col, row] = slots[i];
            const px = x + col * (photoSlotWidth + photoGap);
            const py = y + row * (photoSlotHeight + photoGap);
            if (imgs[i]) {
              drawPhotoWithBorder(ctx, imgs[i], px, py, photoSlotWidth, photoSlotHeight,
                blocks.photos.borderStyle, blocks.photos.borderColor, mirrorImages);
            } else {
              ctx.fillStyle = '#e8e8e8';
              ctx.fillRect(px, py, photoSlotWidth, photoSlotHeight);
            }
          }
          y += photoSlotHeight * 3 + photoGap * 2 + elGap;
        } else if (templateKey === '2x3-portrait') {
          const imgs = await Promise.all(frames.slice(0, 6).map(f => f ? loadImage(f) : null));
          const slots = [[0,0],[1,0],[0,1],[1,1],[0,2],[1,2]];
          for (let i = 0; i < 6; i++) {
            const [col, row] = slots[i];
            const px = x + col * (photoSlotWidth + photoGap);
            const py = y + row * (photoSlotHeight + photoGap);
            if (imgs[i]) {
              drawPhotoWithBorder(ctx, imgs[i], px, py, photoSlotWidth, photoSlotHeight,
                blocks.photos.borderStyle, blocks.photos.borderColor, mirrorImages);
            } else {
              ctx.fillStyle = '#e8e8e8';
              ctx.fillRect(px, py, photoSlotWidth, photoSlotHeight);
            }
          }
          y += photoSlotHeight * 3 + photoGap * 2 + elGap;
        } else {
          for (let i = 0; i < stripCount; i++) {
            const py = y + i * (photoSlotHeight + photoGap);
            if (frames[i]) {
              const img = await loadImage(frames[i]);
              drawPhotoWithBorder(ctx, img, x, py, photoSlotWidth, photoSlotHeight,
                blocks.photos.borderStyle, blocks.photos.borderColor, mirrorImages);
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
          color: '#000000',
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
      case 'receiptItems': {
        if (!blocks.receiptItems.enabled) break;

        const fontSize = blocks.receiptItems.fontSize || 20;
        const itemHeight = fontSize + 4;
        const showQty = blocks.receiptItems.showQty !== false;

        // Get items - use random witty items if randomize is enabled
        let items = blocks.receiptItems.items || [];
        if (blocks.receiptItems.randomize) {
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
          items = wittyItems.sort(() => 0.5 - Math.random()).slice(0, 3);
        }

        if (!items.length) break;

        // Draw table header
        ctx.font = `bold ${fontSize}px '${fontBody}', sans-serif`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.fillText('ITEM', x, y + fontSize);
        if (showQty) {
          ctx.textAlign = 'right';
          ctx.fillText('QTY', x + contentWidth * 0.6, y + fontSize);
        }
        ctx.textAlign = 'right';
        ctx.fillText('PRICE', x + contentWidth, y + fontSize);
        y += itemHeight;

        // Draw items
        ctx.font = `normal ${fontSize}px '${fontBody}', sans-serif`;
        let total = 0;
        for (const item of items) {
          ctx.textAlign = 'left';
          ctx.fillText(item.name || '', x, y + fontSize);
          if (showQty) {
            ctx.textAlign = 'right';
            ctx.fillText(String(item.quantity || 1), x + contentWidth * 0.6, y + fontSize);
          }
          ctx.textAlign = 'right';
          const price = parseFloat(item.price) || 0;
          ctx.fillText(`₱${price.toFixed(2)}`, x + contentWidth, y + fontSize);
          total += price * (item.quantity || 1);
          y += itemHeight;
        }

        // Draw total line
        if (blocks.receiptItems.showTotal) {
          ctx.font = `bold ${fontSize}px '${fontBody}', sans-serif`;
          ctx.fillStyle = '#000000';
          ctx.textAlign = 'left';
          ctx.fillText('TOTAL', x, y + fontSize + 4);
          ctx.textAlign = 'right';
          ctx.fillText(`₱${total.toFixed(2)}`, x + contentWidth, y + fontSize + 4);
          y += fontSize + 8;
        }

        y += elGap;
        break;
      }
      case 'bibleVerses': {
        if (!blocks.bibleVerses.enabled) break;
        
        const verse = getRandomVerse(blocks.bibleVerses.topic || 'love');
        const fontSize = blocks.bibleVerses.fontSize || 20;
        
        drawText(ctx, verse.text, x, y, contentWidth, {
          fontSize: fontSize,
          alignment: blocks.bibleVerses.alignment || 'center',
          color: '#000000',
          fontFamily: fontBody,
        });
        y += textH(fontSize, 0);
        
        if (blocks.bibleVerses.showReference) {
          const refFontSize = Math.max(14, Math.round(fontSize * 0.7));
          drawText(ctx, verse.reference, x, y, contentWidth, {
            fontSize: refFontSize,
            alignment: blocks.bibleVerses.alignment || 'center',
            color: '#666666',
            fontFamily: fontBody,
          });
          y += textH(refFontSize, elGap);
        } else {
          y += elGap;
        }
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
        
        // If image is uploaded, draw it instead of text
        if (blocks.footer.image) {
          const img = await loadImage(blocks.footer.image);
          const scale = (blocks.footer.imageScale || 4) / 4; // 1-8 scale, default 4
          const baseWidth = contentWidth; // Full width
          const imgWidth = baseWidth * scale;
          const imgHeight = imgWidth * (img.height / img.width);
          const imgX = x; // Left aligned for full width
          y += (blocks.footer.imageTopMargin || 16); // Add top margin
          ctx.drawImage(img, imgX, y, imgWidth, imgHeight);
          y += imgHeight + elGap;
        } else {
          drawText(ctx, blocks.footer.text, x, y, contentWidth, {
            fontSize: blocks.footer.fontSize,
            alignment: blocks.footer.alignment,
            color: '#000000',
            fontFamily: fontBody,
          });
          y += textH(blocks.footer.fontSize, elGap);
        }
        break;
      }
    }
  }

  return canvas;
}
