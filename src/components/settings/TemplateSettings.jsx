import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { compositeReceipt, SLOT_RATIOS } from '../../lib/canvasCompositor.js';

const SHOT_COUNTS = { '1strip': 1, '2strip': 2, '3strip': 3, '4grid': 4, '2x3-landscape': 6, '2x3-portrait': 6 };

function makePlaceholders(templateKey) {
  const ratio = SLOT_RATIOS[templateKey];
  const pw = 300;
  const ph = Math.round(pw * ratio.h / ratio.w);
  const count = SHOT_COUNTS[templateKey];
  return Array.from({ length: count }, (_, i) => {
    const c = document.createElement('canvas');
    c.width = pw; c.height = ph;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, pw, ph);
    grad.addColorStop(0, '#b0c4d8');
    grad.addColorStop(1, '#8aa4b8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, pw, ph);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Photo ${i + 1}`, pw / 2, ph / 2);
    return c.toDataURL('image/jpeg', 0.85);
  });
}

function ReceiptPreview({ templateKey }) {
  const { settings } = useSettings();
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const cancelRef = useRef(false);

  const render = useCallback(() => {
    cancelRef.current = true;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      cancelRef.current = false;
      try {
        const frames = makePlaceholders(templateKey);
        const canvas = await compositeReceipt(
          frames,
          templateKey,
          settings.templates,
          settings.general,
          settings.printer,
        );
        if (cancelRef.current) return;
        const el = containerRef.current;
        if (!el) return;
        el.innerHTML = '';
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.display = 'block';
        el.appendChild(canvas);
      } catch { /* ignore */ }
    }, 300);
  }, [templateKey, settings]);

  useEffect(() => {
    render();
    return () => {
      cancelRef.current = true;
      clearTimeout(debounceRef.current);
    };
  }, [render]);

  return (
    <div className="rounded-xl overflow-hidden border border-md-outline-variant shadow-lg">
      <div className="bg-md-surface-container px-3 py-1.5 text-[10px] text-md-outline uppercase tracking-widest">
        Live Preview
      </div>
      <div ref={containerRef} className="bg-white w-full p-3 flex items-center justify-center" style={{ minHeight: '300px' }} />
    </div>
  );
}

const TEMPLATE_TABS = [
  { key: '1strip', label: 'Solo Star', shots: 1 },
  { key: '2strip', label: 'Double Take', shots: 2 },
  { key: '3strip', label: 'Triple Threat', shots: 3 },
  { key: '4grid',  label: 'Quad Squad', shots: 4 },
  { key: '2x3-landscape', label: 'Wide Load', shots: 6 },
  { key: '2x3-portrait', label: 'Tall Order', shots: 6 },
];

const BORDER_STYLES = ['none', 'thin', 'thick', 'rounded'];

function Toggle({ value, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative inline-flex flex-shrink-0 w-[52px] h-[32px] rounded-full transition-colors duration-200 ${
        value
          ? 'bg-md-primary'
          : 'bg-md-surface-container-highest ring-2 ring-inset ring-md-outline'
      }`}
    >
      <span
        className={`pointer-events-none absolute top-[4px] left-[4px] w-[24px] h-[24px] rounded-full shadow-md transition-all duration-200 ease-out ${
          value ? 'translate-x-[20px] bg-md-on-primary' : 'translate-x-0 bg-md-on-surface-variant'
        }`}
      />
    </button>
  );
}

function SectionRow({ label, enabled, onToggle, children, alwaysOn = false }) {
  return (
    <div className="rounded-xl overflow-hidden border border-md-outline-variant">
      <div className="flex items-center justify-between px-4 py-4 bg-md-surface-container">
        <span className="text-sm font-medium text-md-on-surface">{label}</span>
        {alwaysOn
          ? <span className="text-[10px] text-md-outline italic">always on</span>
          : <Toggle value={enabled} onChange={onToggle} />
        }
      </div>
      {(alwaysOn || enabled) && (
        <div className="px-3 py-3 space-y-3 bg-md-surface-container-low border-t border-md-outline-variant">
          {children}
        </div>
      )}
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs text-md-on-surface-variant mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-lg px-3 py-3 text-md-on-surface text-sm placeholder:text-md-outline focus:outline-none focus:border-md-primary"
      />
    </div>
  );
}


function NumberInput({ label, value, onChange, min, max }) {
  return (
    <div>
      <label className="block text-xs text-md-on-surface-variant mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        min={min} max={max}
        className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-lg px-2 py-1.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary"
      />
    </div>
  );
}

function PresetSelector({ label, value, onChange, presets }) {
  return (
    <div>
      <label className="block text-xs text-md-on-surface-variant mb-1">{label}</label>
      <div className="flex gap-1">
        {presets.map(preset => (
          <button
            key={preset}
            onClick={() => onChange(preset)}
            className={`flex-1 py-2 rounded text-xs font-medium transition-colors min-h-[44px] ${
              value === preset
                ? 'bg-md-primary text-md-on-primary'
                : 'bg-md-surface-container-high text-md-on-surface-variant hover:bg-md-surface-container-highest'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}

function TemplateBlockEditor() {
  const { settings, updateSettings } = useSettings();
  const blocks = settings.templates.blocks;

  const upd = (blockKey, field, value) => updateSettings(`templates.blocks.${blockKey}.${field}`, value);

  const moveBlock = (blockKey, direction) => {
    const currentOrder = blocks.blockOrder || ['header', 'dividerBefore', 'photos', 'dividerAfter', 'datetime', 'customText', 'barcode', 'footer'];
    const currentIndex = currentOrder.indexOf(blockKey);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= currentOrder.length) return;

    const newOrder = [...currentOrder];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
    updateSettings('templates.blocks.blockOrder', newOrder);
  };

  return (
    <div className="space-y-3">
      {/* Quick toggles row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg px-4 py-3 bg-md-surface-container border border-md-outline-variant">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-md-on-surface">Header</span>
            <div className="flex items-center gap-2">
              <Toggle value={blocks.header.enabled} onChange={v => upd('header', 'enabled', v)} />
              <div className="flex gap-1">
                <button
                  onClick={() => moveBlock('header', 'up')}
                  className="p-1 rounded hover:bg-md-surface-container-high text-md-outline hover:text-md-on-surface-variant transition-colors"
                  title="Move up"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => moveBlock('header', 'down')}
                  className="p-1 rounded hover:bg-md-surface-container-high text-md-outline hover:text-md-on-surface-variant transition-colors"
                  title="Move down"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
              <button
                onClick={() => {
                  upd('header', 'title', '');
                  upd('header', 'subtitle', '');
                  upd('header', 'image', null);
                }}
                className="text-xs text-md-outline hover:text-md-on-surface-variant"
                title="Reset to default"
              >
                Reset
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <TextInput
              label="Title"
              value={blocks.header.title || ''}
              onChange={v => upd('header', 'title', v)}
              placeholder="Custom title"
            />
            <TextInput
              label="Subtitle"
              value={blocks.header.subtitle || ''}
              onChange={v => upd('header', 'subtitle', v)}
              placeholder="Custom subtitle"
            />
            <div>
              <label className="block text-xs text-md-on-surface-variant mb-1">Logo Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => upd('header', 'image', ev.target.result);
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full text-xs text-md-on-surface-variant file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-md-primary file:text-md-on-primary hover:file:bg-md-primary-container"
              />
              {blocks.header.image && (
                <button
                  onClick={() => upd('header', 'image', null)}
                  className="mt-2 text-xs text-md-outline hover:text-md-on-surface-variant"
                >
                  Remove image
                </button>
              )}
            </div>
            {blocks.header.image && (
              <>
                <div>
                  <label className="block text-xs text-md-on-surface-variant mb-1">Image Scale (1-8)</label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={blocks.header.imageScale || 4}
                    onChange={e => upd('header', 'imageScale', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-md-outline text-center mt-1">{blocks.header.imageScale || 4}</div>
                </div>
                <div>
                  <label className="block text-xs text-md-on-surface-variant mb-1">Bottom Margin (px)</label>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    value={blocks.header.imageBottomMargin || 16}
                    onChange={e => upd('header', 'imageBottomMargin', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-md-outline text-center mt-1">{blocks.header.imageBottomMargin || 16}px</div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="rounded-lg px-4 py-3 bg-md-surface-container border border-md-outline-variant">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-md-on-surface">Footer</span>
            <div className="flex items-center gap-2">
              <Toggle value={blocks.footer.enabled} onChange={v => upd('footer', 'enabled', v)} />
              <div className="flex gap-1">
                <button
                  onClick={() => moveBlock('footer', 'up')}
                  className="p-1 rounded hover:bg-md-surface-container-high text-md-outline hover:text-md-on-surface-variant transition-colors"
                  title="Move up"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => moveBlock('footer', 'down')}
                  className="p-1 rounded hover:bg-md-surface-container-high text-md-outline hover:text-md-on-surface-variant transition-colors"
                  title="Move down"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
              <button
                onClick={() => upd('footer', 'text', '')}
                className="text-xs text-md-outline hover:text-md-on-surface-variant"
                title="Reset to default"
              >
                Reset
              </button>
            </div>
          </div>
          <TextInput
            label="Text"
            value={blocks.footer.text || ''}
            onChange={v => upd('footer', 'text', v)}
            placeholder="Thank you for the memories!"
          />
          <div>
            <label className="block text-xs text-md-on-surface-variant mb-1">Footer Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => upd('footer', 'image', ev.target.result);
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full text-xs text-md-on-surface-variant file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-md-primary file:text-md-on-primary hover:file:bg-md-primary-container"
            />
            {blocks.footer.image && (
              <button
                onClick={() => upd('footer', 'image', null)}
                className="mt-2 text-xs text-md-outline hover:text-md-on-surface-variant"
              >
                Remove image
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Photos & Divider - compact */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg px-4 py-3 bg-md-surface-container border border-md-outline-variant">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-md-on-surface">Photos</span>
            <div className="flex gap-1">
              <button
                onClick={() => moveBlock('photos', 'up')}
                className="p-1 rounded hover:bg-md-surface-container-high text-md-outline hover:text-md-on-surface-variant transition-colors"
                title="Move up"
              >
                <ChevronUp size={16} />
              </button>
              <button
                onClick={() => moveBlock('photos', 'down')}
                className="p-1 rounded hover:bg-md-surface-container-high text-md-outline hover:text-md-on-surface-variant transition-colors"
                title="Move down"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            {BORDER_STYLES.map(s => (
              <button key={s} onClick={() => upd('photos', 'borderStyle', s)}
                className={`flex-1 py-3 rounded text-xs capitalize transition-colors min-h-[44px] ${
                  blocks.photos.borderStyle === s
                    ? 'bg-md-primary text-md-on-primary'
                    : 'bg-md-surface-container-high text-md-on-surface-variant hover:bg-md-surface-container-highest'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg px-4 py-3 bg-md-surface-container border border-md-outline-variant">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-md-on-surface">Divider</span>
            <div className="flex items-center gap-2">
              <Toggle value={blocks.divider.enabled} onChange={v => upd('divider', 'enabled', v)} />
              <div className="flex gap-1">
                <button
                  onClick={() => moveBlock('divider', 'up')}
                  className="p-1 rounded hover:bg-md-surface-container-high text-md-outline hover:text-md-on-surface-variant transition-colors"
                  title="Move up"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => moveBlock('divider', 'down')}
                  className="p-1 rounded hover:bg-md-surface-container-high text-md-outline hover:text-md-on-surface-variant transition-colors"
                  title="Move down"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            {['solid', 'dashed', 'dotted', 'double'].map(s => (
              <button key={s} onClick={() => upd('divider', 'style', s)}
                className={`flex-1 py-3 rounded text-xs capitalize transition-colors min-h-[44px] ${
                  (blocks.divider.style || 'solid') === s
                    ? 'bg-md-primary text-md-on-primary'
                    : 'bg-md-surface-container-high text-md-on-surface-variant hover:bg-md-surface-container-highest'
                }`}>
                {s}
              </button>
            ))}
          </div>
          <PresetSelector label="Thickness" value={blocks.divider.thickness} onChange={v => upd('divider', 'thickness', v)} presets={[1, 2, 3, 4, 5, 6, 7, 8]} />
        </div>
      </div>

      {/* Text fields row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg px-4 py-3 bg-md-surface-container border border-md-outline-variant">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-md-on-surface">Date/Time</span>
            <div className="flex items-center gap-2">
              <Toggle value={blocks.datetime.enabled} onChange={v => upd('datetime', 'enabled', v)} />
              <div className="flex gap-1">
                <button
                  onClick={() => moveBlock('datetime', 'up')}
                  className="p-1 rounded hover:bg-md-surface-container-high text-md-outline hover:text-md-on-surface-variant transition-colors"
                  title="Move up"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => moveBlock('datetime', 'down')}
                  className="p-1 rounded hover:bg-md-surface-container-high text-md-outline hover:text-md-on-surface-variant transition-colors"
                  title="Move down"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          </div>
          <TextInput label="Format" value={blocks.datetime.format} onChange={v => upd('datetime', 'format', v)} placeholder="MMM DD, YYYY HH:mm" />
        </div>

        <div className="rounded-lg px-4 py-3 bg-md-surface-container border border-md-outline-variant">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-md-on-surface">Custom Text</span>
            <div className="flex items-center gap-2">
              <Toggle value={blocks.customText.enabled} onChange={v => upd('customText', 'enabled', v)} />
              <div className="flex gap-1">
                <button
                  onClick={() => moveBlock('customText', 'up')}
                  className="p-1 rounded hover:bg-md-surface-container-high text-md-outline hover:text-md-on-surface-variant transition-colors"
                  title="Move up"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => moveBlock('customText', 'down')}
                  className="p-1 rounded hover:bg-md-surface-container-high text-md-outline hover:text-md-on-surface-variant transition-colors"
                  title="Move down"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          </div>
          <TextInput label="Content" value={blocks.customText.content} onChange={v => upd('customText', 'content', v)} placeholder="#MONOSTUDIOPH" />
        </div>
      </div>

      {/* Receipt Items */}
      <div className="rounded-lg px-4 py-3 bg-md-surface-container border border-md-outline-variant">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-md-on-surface">Receipt Items</span>
          <div className="flex items-center gap-2">
            <Toggle value={blocks.receiptItems.enabled} onChange={v => upd('receiptItems', 'enabled', v)} />
            <div className="flex gap-1">
              <button
                onClick={() => moveBlock('receiptItems', 'up')}
                className="p-1 rounded hover:bg-md-surface-container-high text-md-outline hover:text-md-on-surface-variant transition-colors"
                title="Move up"
              >
                <ChevronUp size={16} />
              </button>
              <button
                onClick={() => moveBlock('receiptItems', 'down')}
                className="p-1 rounded hover:bg-md-surface-container-high text-md-outline hover:text-md-on-surface-variant transition-colors"
                title="Move down"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        </div>
        {blocks.receiptItems.enabled && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newItems = [...(blocks.receiptItems.items || []), { name: '', quantity: 1, price: 0 }];
                  upd('receiptItems', 'items', newItems);
                }}
                className="px-3 py-1.5 rounded-lg bg-md-primary text-md-on-primary text-xs font-medium hover:brightness-110"
              >
                + Add Item
              </button>
              <button
                onClick={() => {
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
                  const randomItems = wittyItems.sort(() => 0.5 - Math.random()).slice(0, 3);
                  upd('receiptItems', 'items', randomItems);
                }}
                className="px-3 py-1.5 rounded-lg bg-md-primary text-md-on-primary text-xs font-medium hover:brightness-110 shadow-sm"
              >
                🎲 Random Witty Items
              </button>
              <button
                onClick={() => upd('receiptItems', 'items', [])}
                className="px-3 py-1.5 rounded-lg bg-md-error-container text-md-on-error-container text-xs font-medium hover:brightness-110"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2">
              {(blocks.receiptItems.items || []).map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <TextInput
                    label="Item"
                    value={item.name}
                    onChange={v => {
                      const newItems = [...blocks.receiptItems.items];
                      newItems[idx] = { ...newItems[idx], name: v };
                      upd('receiptItems', 'items', newItems);
                    }}
                    placeholder="Item name"
                    className="flex-1"
                  />
                  <TextInput
                    label="Qty"
                    type="number"
                    value={item.quantity}
                    onChange={v => {
                      const newItems = [...blocks.receiptItems.items];
                      newItems[idx] = { ...newItems[idx], quantity: parseInt(v) || 1 };
                      upd('receiptItems', 'items', newItems);
                    }}
                    className="w-16"
                  />
                  <TextInput
                    label="Price"
                    type="number"
                    value={item.price}
                    onChange={v => {
                      const newItems = [...blocks.receiptItems.items];
                      newItems[idx] = { ...newItems[idx], price: parseFloat(v) || 0 };
                      upd('receiptItems', 'items', newItems);
                    }}
                    className="w-20"
                  />
                  <button
                    onClick={() => {
                      const newItems = blocks.receiptItems.items.filter((_, i) => i !== idx);
                      upd('receiptItems', 'items', newItems);
                    }}
                    className="w-8 h-8 rounded-lg bg-md-error text-md-on-error flex items-center justify-center hover:bg-md-error-container hover:text-md-on-error-container"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-md-on-surface-variant">Randomize every print</span>
              <Toggle value={blocks.receiptItems.randomize} onChange={v => upd('receiptItems', 'randomize', v)} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-md-on-surface-variant">Show Qty</span>
              <Toggle value={blocks.receiptItems.showQty} onChange={v => upd('receiptItems', 'showQty', v)} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-md-on-surface-variant">Show Total</span>
              <Toggle value={blocks.receiptItems.showTotal} onChange={v => upd('receiptItems', 'showTotal', v)} />
            </div>
          </div>
        )}
      </div>

      {/* Barcode */}
      <div className="rounded-lg px-4 py-3 bg-md-surface-container border border-md-outline-variant">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-md-on-surface">Barcode</span>
          <div className="flex items-center gap-2">
            <Toggle value={blocks.barcode.enabled} onChange={v => upd('barcode', 'enabled', v)} />
            <div className="flex gap-1">
              <button
                onClick={() => moveBlock('barcode', 'up')}
                className="p-1 rounded hover:bg-md-surface-container-high text-md-outline hover:text-md-on-surface-variant transition-colors"
                title="Move up"
              >
                <ChevronUp size={16} />
              </button>
              <button
                onClick={() => moveBlock('barcode', 'down')}
                className="p-1 rounded hover:bg-md-surface-container-high text-md-outline hover:text-md-on-surface-variant transition-colors"
                title="Move down"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <TextInput label="Value" value={blocks.barcode.value} onChange={v => upd('barcode', 'value', v)} placeholder="SNAPROLL001" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-md-on-surface-variant">Show text</span>
            <Toggle value={blocks.barcode.showText} onChange={v => upd('barcode', 'showText', v)} />
          </div>
        </div>
      </div>

      {/* Spacing */}
      <div className="rounded-lg px-4 py-3 bg-md-surface-container border border-md-outline-variant">
        <PresetSelector label="Element Spacing (px)" value={blocks.elementSpacing || 16} onChange={v => updateSettings(`templates.blocks.elementSpacing`, v)} presets={[4, 8, 12, 16, 20, 24, 32, 40, 48]} />
      </div>
    </div>
  );
}

export default function TemplateSettings() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3">
      {/* Settings panel - sticky on desktop */}
      <div className="lg:sticky lg:top-0 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto space-y-3">
        <div className="text-xs font-medium tracking-widest uppercase text-md-on-surface-variant mb-3">
          Layout Settings
        </div>
        <TemplateBlockEditor />
      </div>

      {/* All template previews */}
      <div className="space-y-3">
        <div className="text-xs font-medium tracking-widest uppercase text-md-on-surface-variant">
          Template Previews
        </div>
        <div className="grid grid-cols-3 gap-3">
          {TEMPLATE_TABS.map(t => (
            <div key={t.key}>
              <div className="mb-2 text-sm font-medium text-md-on-surface">
                {t.label} <span className="text-md-outline text-xs">({t.shots} shot{t.shots > 1 ? 's' : ''})</span>
              </div>
              <ReceiptPreview templateKey={t.key} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
