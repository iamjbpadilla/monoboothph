import { getRandomVerse } from './bibleVerses.js';
import {
  MARGIN, DATETIME_FONT, BARCODE_HEIGHT,
  textH, dividerH, photosH, gridH, barcodeH, receiptItemsH,
  drawText, formatDate, drawDivider, renderBarcode, drawPhotoWithBorder, loadImage
} from './canvasCompositor.js';

// ─── Block Factory ─────────────────────────────────────────────────────────
export function createBlock(id, shared) {
  switch (id) {
    case 'header':        return createHeaderBlock(shared);
    case 'dividerBefore':
    case 'dividerAfter':
    case 'divider':       return createDividerBlock(shared);
    case 'photos':        return createPhotosBlock(shared);
    case 'datetime':      return createDatetimeBlock(shared);
    case 'customText':    return createCustomTextBlock(shared);
    case 'receiptItems':  return createReceiptItemsBlock(shared);
    case 'bibleVerses':   return createBibleVersesBlock(shared);
    case 'barcode':       return createBarcodeBlock(shared);
    case 'footer':        return createFooterBlock(shared);
    default:              return null;
  }
}

// ─── Header Block ────────────────────────────────────────────────────────────
function createHeaderBlock(shared) {
  const { blocks, contentWidth, homeScreenSettings, generalSettings } = shared;
  const cfg = blocks.header;
  const homeScreen = homeScreenSettings || generalSettings.homeScreen || {};
  const titleFontSize = homeScreen.title?.size || cfg.fontSize;
  const subtitleText = homeScreen.subtitle?.text || generalSettings.eventName;
  const subFontSize = homeScreen.subtitle?.size || Math.max(16, Math.round(titleFontSize * 0.52));

  return {
    id: 'header',
    async measure() {
      if (!cfg.enabled) return 0;
      if (cfg.image) {
        const scale = (cfg.imageScale || 4) / 4;
        return Math.min(100, contentWidth * 0.25) * scale + (cfg.imageBottomMargin || 16);
      }
      let h = textH(titleFontSize);
      if (subtitleText) {
        h += 12; // title-subtitle internal gap
        h += textH(subFontSize);
      }
      return h;
    },
    async render(ctx, y) {
      if (!cfg.enabled) return 0;
      const { x, fontHeading, fontBody } = shared;
      if (cfg.image) {
        const img = await loadImage(cfg.image);
        const scale = (cfg.imageScale || 4) / 4;
        const baseHeight = Math.min(100, contentWidth * 0.25);
        const imgHeight = baseHeight * scale;
        const imgWidth = imgHeight * (img.width / img.height);
        const imgX = cfg.alignment === 'center' ? x + (contentWidth - imgWidth) / 2
          : cfg.alignment === 'right' ? x + contentWidth - imgWidth : x;
        ctx.drawImage(img, imgX, y, imgWidth, imgHeight);
        return imgHeight + (cfg.imageBottomMargin || 16);
      }
      // Title
      const titleText = homeScreen.title?.text || generalSettings.boothName || 'MONO BOOTH PH';
      drawText(ctx, titleText, x, y, contentWidth, {
        fontSize: titleFontSize,
        bold: cfg.bold,
        alignment: cfg.alignment,
        fontFamily: fontHeading,
      });
      let h = textH(titleFontSize);
      y += h;
      // Subtitle
      if (subtitleText) {
        y += 12; // internal gap
        drawText(ctx, subtitleText, x, y, contentWidth, {
          fontSize: subFontSize,
          bold: false,
          alignment: cfg.alignment,
          color: '#000000',
          fontFamily: fontBody,
        });
        h += 12 + textH(subFontSize);
      }
      return h;
    },
  };
}

// ─── Divider Block ───────────────────────────────────────────────────────────
function createDividerBlock(shared) {
  const { blocks, contentWidth } = shared;
  const cfg = blocks.divider;

  return {
    id: 'divider',
    async measure() {
      if (!cfg.enabled) return 0;
      return dividerH(cfg.thickness);
    },
    async render(ctx, y) {
      if (!cfg.enabled) return 0;
      drawDivider(ctx, shared.x, y, contentWidth, cfg);
      return dividerH(cfg.thickness);
    },
  };
}

// ─── Photos Block ────────────────────────────────────────────────────────────
function createPhotosBlock(shared) {
  const { blocks, contentWidth, x, templateKey, frames, mirrorImages } = shared;
  const { photoSlotWidth, photoSlotHeight, photoGap, gridCols, gridRows, isGrid, stripCount } = shared;
  const cfg = blocks.photos;

  return {
    id: 'photos',
    async measure() {
      if (!cfg.enabled) return 0;
      if (templateKey === '4grid') {
        return gridH(photoSlotHeight, photoGap);
      } else if (templateKey === '2x3-landscape' || templateKey === '2x3-portrait') {
        return photoSlotHeight * 3 + photoGap * 2;
      }
      return photosH(photoSlotHeight, stripCount, photoGap);
    },
    async render(ctx, y) {
      if (!cfg.enabled) return 0;
      const borderStyle = cfg.borderStyle || 'none';
      const borderColor = cfg.borderColor || '#000000';
      const borderThickness = cfg.borderThickness || 1;

      if (templateKey === '4grid') {
        const imgs = await Promise.all(frames.slice(0, 4).map(f => f ? loadImage(f) : null));
        const slots = [[0,0],[1,0],[0,1],[1,1]];
        for (let i = 0; i < 4; i++) {
          const [col, row] = slots[i];
          const px = x + col * (photoSlotWidth + photoGap);
          const py = y + row * (photoSlotHeight + photoGap);
          if (imgs[i]) {
            drawPhotoWithBorder(ctx, imgs[i], px, py, photoSlotWidth, photoSlotHeight,
              borderStyle, borderColor, borderThickness, mirrorImages);
          } else {
            ctx.fillStyle = '#e8e8e8';
            ctx.fillRect(px, py, photoSlotWidth, photoSlotHeight);
          }
        }
        return gridH(photoSlotHeight, photoGap);
      }

      if (templateKey === '2x3-landscape') {
        const imgs = await Promise.all(frames.slice(0, 6).map(f => f ? loadImage(f) : null));
        const slots = [[0,0],[1,0],[0,1],[1,1],[0,2],[1,2]];
        for (let i = 0; i < 6; i++) {
          const [col, row] = slots[i];
          const px = x + col * (photoSlotWidth + photoGap);
          const py = y + row * (photoSlotHeight + photoGap);
          if (imgs[i]) {
            drawPhotoWithBorder(ctx, imgs[i], px, py, photoSlotWidth, photoSlotHeight,
              borderStyle, borderColor, borderThickness, mirrorImages);
          } else {
            ctx.fillStyle = '#e8e8e8';
            ctx.fillRect(px, py, photoSlotWidth, photoSlotHeight);
          }
        }
        return photoSlotHeight * 3 + photoGap * 2;
      }

      if (templateKey === '2x3-portrait') {
        const imgs = await Promise.all(frames.slice(0, 6).map(f => f ? loadImage(f) : null));
        const slots = [[0,0],[1,0],[0,1],[1,1],[0,2],[1,2]];
        for (let i = 0; i < 6; i++) {
          const [col, row] = slots[i];
          const px = x + col * (photoSlotWidth + photoGap);
          const py = y + row * (photoSlotHeight + photoGap);
          if (imgs[i]) {
            drawPhotoWithBorder(ctx, imgs[i], px, py, photoSlotWidth, photoSlotHeight,
              borderStyle, borderColor, borderThickness, mirrorImages);
          } else {
            ctx.fillStyle = '#e8e8e8';
            ctx.fillRect(px, py, photoSlotWidth, photoSlotHeight);
          }
        }
        return photoSlotHeight * 3 + photoGap * 2;
      }

      // Strip layout
      for (let i = 0; i < stripCount; i++) {
        const py = y + i * (photoSlotHeight + photoGap);
        if (frames[i]) {
          const img = await loadImage(frames[i]);
          drawPhotoWithBorder(ctx, img, x, py, photoSlotWidth, photoSlotHeight,
            borderStyle, borderColor, borderThickness, mirrorImages);
        } else {
          ctx.fillStyle = '#e8e8e8';
          ctx.fillRect(x, py, photoSlotWidth, photoSlotHeight);
        }
      }
      return photosH(photoSlotHeight, stripCount, photoGap);
    },
  };
}

// ─── Datetime Block ───────────────────────────────────────────────────────────
function createDatetimeBlock(shared) {
  const { blocks, contentWidth } = shared;
  const cfg = blocks.datetime;

  return {
    id: 'datetime',
    async measure() {
      if (!cfg.enabled) return 0;
      return textH(DATETIME_FONT);
    },
    async render(ctx, y) {
      if (!cfg.enabled) return 0;
      const dateStr = formatDate(cfg.format || 'MMM DD, YYYY HH:mm');
      drawText(ctx, dateStr, shared.x, y, contentWidth, {
        fontSize: DATETIME_FONT,
        alignment: 'center',
        color: '#000000',
        fontFamily: shared.fontBody,
      });
      return textH(DATETIME_FONT);
    },
  };
}

// ─── Custom Text Block ───────────────────────────────────────────────────────
function createCustomTextBlock(shared) {
  const { blocks, contentWidth } = shared;
  const cfg = blocks.customText;

  return {
    id: 'customText',
    async measure() {
      if (!cfg.enabled || !cfg.content) return 0;
      return textH(cfg.fontSize);
    },
    async render(ctx, y) {
      if (!cfg.enabled || !cfg.content) return 0;
      drawText(ctx, cfg.content, shared.x, y, contentWidth, {
        fontSize: cfg.fontSize,
        alignment: cfg.alignment,
        fontFamily: shared.fontBody,
      });
      return textH(cfg.fontSize);
    },
  };
}

// ─── Receipt Items Block ───────────────────────────────────────────────────────
function createReceiptItemsBlock(shared) {
  const { blocks, contentWidth, designData } = shared;
  const cfg = blocks.receiptItems;

  function getItems() {
    let items = designData?.receiptItems || cfg.items || [];
    if (!designData?.receiptItems && cfg.randomize) {
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
    return items;
  }

  return {
    id: 'receiptItems',
    async measure() {
      if (!cfg.enabled) return 0;
      const items = getItems();
      return receiptItemsH(cfg.fontSize || 20, items, cfg.showTotal);
    },
    async render(ctx, y) {
      if (!cfg.enabled) return 0;
      const { x } = shared;
      const fontSize = cfg.fontSize || 20;
      const itemHeight = fontSize + 4;
      const showQty = cfg.showQty !== false;
      const items = getItems();

      if (!items.length) return 0;

      // Draw table header
      ctx.font = `bold ${fontSize}px '${shared.fontBody}', sans-serif`;
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
      ctx.font = `normal ${fontSize}px '${shared.fontBody}', sans-serif`;
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
        ctx.fillText(`\u20B1${price.toFixed(2)}`, x + contentWidth, y + fontSize);
        total += price * (item.quantity || 1);
        y += itemHeight;
      }

      // Draw total line
      if (cfg.showTotal) {
        ctx.font = `bold ${fontSize}px '${shared.fontBody}', sans-serif`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.fillText('TOTAL', x, y + fontSize + 4);
        ctx.textAlign = 'right';
        ctx.fillText(`\u20B1${total.toFixed(2)}`, x + contentWidth, y + fontSize + 4);
        y += fontSize + 8;
      }

      return receiptItemsH(fontSize, items, cfg.showTotal);
    },
  };
}

// ─── Bible Verses Block ────────────────────────────────────────────────────────
function createBibleVersesBlock(shared) {
  const { blocks, contentWidth, designData, fontHeading } = shared;
  const cfg = blocks.bibleVerses;

  function getVerse() {
    return designData?.verse || getRandomVerse(cfg.topic || 'all');
  }

  function measureWrappedVerse(text, fontSize) {
    const tmp = document.createElement('canvas').getContext('2d');
    tmp.font = `bold ${fontSize}px '${fontHeading}', sans-serif`;
    const words = text.split(' ');
    let line = '';
    let lines = 1;
    for (const word of words) {
      const test = line + (line ? ' ' : '') + word;
      if (tmp.measureText(test).width > contentWidth && line) {
        lines++;
        line = word;
      } else {
        line = test;
      }
    }
    return lines;
  }

  return {
    id: 'bibleVerses',
    async measure() {
      if (!cfg.enabled) return 0;
      const fontSize = cfg.fontSize || 28;
      const verse = getVerse();
      const lineCount = measureWrappedVerse(verse.text, fontSize);
      let h = fontSize * lineCount;
      if (cfg.showReference) h += fontSize;
      return h;
    },
    async render(ctx, y) {
      if (!cfg.enabled) return 0;
      const { x } = shared;
      const fontSize = cfg.fontSize || 28;
      const verse = getVerse();
      const align = cfg.alignment || 'center';

      // Draw wrapped verse text
      const h = drawText(ctx, verse.text, x, y, contentWidth, {
        fontSize,
        bold: true,
        alignment: align,
        color: cfg.color || '#000000',
        fontFamily: fontHeading,
        wrap: true,
      });
      y += h;

      // Reference
      if (cfg.showReference) {
        drawText(ctx, verse.reference, x, y, contentWidth, {
          fontSize,
          alignment: align,
          color: '#666666',
          fontFamily: shared.fontBody,
        });
        y += fontSize;
      }

      return h + (cfg.showReference ? fontSize : 0);
    },
  };
}

// ─── Barcode Block ───────────────────────────────────────────────────────────
function createBarcodeBlock(shared) {
  const { blocks, contentWidth } = shared;
  const cfg = blocks.barcode;

  return {
    id: 'barcode',
    async measure() {
      if (!cfg.enabled) return 0;
      try {
        const JsBarcode = (await import('jsbarcode')).default;
        const tmp = document.createElement('canvas');
        JsBarcode(tmp, cfg.value || shared.barcodeValue, {
          format: cfg.type || 'CODE128',
          width: Math.max(2, Math.floor(contentWidth / 50)),
          height: 80,
          displayValue: cfg.showText !== false,
          fontSize: 22,
          margin: 0,
        });
        return barcodeH((contentWidth / tmp.width) * tmp.height);
      } catch {
        return barcodeH(cfg.showText !== false ? BARCODE_HEIGHT : 80);
      }
    },
    async render(ctx, y) {
      if (!cfg.enabled) return 0;
      const bh = await renderBarcode(ctx, shared.x, y, contentWidth, {
        ...cfg,
        value: cfg.value || shared.barcodeValue,
      });
      return barcodeH(bh);
    },
  };
}

// ─── Footer Block ──────────────────────────────────────────────────────────────
function createFooterBlock(shared) {
  const { blocks, contentWidth } = shared;
  const cfg = blocks.footer;

  return {
    id: 'footer',
    async measure() {
      if (!cfg.enabled) return 0;
      if (cfg.image) {
        const scale = (cfg.imageScale || 4) / 4;
        const img = await loadImage(cfg.image);
        const baseWidth = contentWidth;
        const imgWidth = baseWidth * scale;
        const imgHeight = imgWidth * (img.height / img.width);
        return (cfg.imageTopMargin || 16) + imgHeight;
      }
      return textH(cfg.fontSize);
    },
    async render(ctx, y) {
      if (!cfg.enabled) return 0;
      const { x, fontBody } = shared;
      const startY = y;
      if (cfg.image) {
        const scale = (cfg.imageScale || 4) / 4;
        const img = await loadImage(cfg.image);
        const baseWidth = contentWidth;
        const imgWidth = baseWidth * scale;
        const imgHeight = imgWidth * (img.height / img.width);
        const imgX = x;
        y += (cfg.imageTopMargin || 16);
        ctx.drawImage(img, imgX, y, imgWidth, imgHeight);
        y += imgHeight;
      } else {
        const footerHeight = drawText(ctx, cfg.text || 'Thank you!', x, y, contentWidth, {
          fontSize: cfg.fontSize,
          alignment: cfg.alignment,
          color: '#000000',
          fontFamily: fontBody,
        });
        y += footerHeight;
      }
      return y - startY;
    },
  };
}
