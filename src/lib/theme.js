// Shared font + accent palette definitions used by App.jsx, GeneralSettings, and canvasCompositor

/** Curated heading + body font pairs */
export const FONT_PAIRS = [
  { id: 'modern',    name: 'Modern',    heading: 'Montserrat',       body: 'Inter',       vibe: 'Clean & Professional' },
  { id: 'editorial', name: 'Editorial', heading: 'Playfair Display',  body: 'Lato',        vibe: 'Classic & Elegant'    },
  { id: 'friendly',  name: 'Friendly',  heading: 'Poppins',           body: 'Nunito',      vibe: 'Warm & Approachable'  },
  { id: 'bold',      name: 'Bold',      heading: 'Oswald',            body: 'Roboto',      vibe: 'Strong & Impactful'   },
  { id: 'refined',   name: 'Refined',   heading: 'Raleway',           body: 'DM Sans',     vibe: 'Minimalist & Sleek'   },
  { id: 'techy',     name: 'Techy',     heading: 'Space Grotesk',     body: 'Inter',       vibe: 'Digital & Modern'     },
  { id: 'premium',   name: 'Premium',   heading: 'Playfair Display',  body: 'Montserrat',  vibe: 'Luxury & Upscale'     },
  { id: 'neutral',   name: 'Neutral',   heading: 'Roboto',            body: 'Roboto',      vibe: 'Universal Classic'    },
];

/** Resolve a pair by ID (falls back to first pair) */
export function resolveFontPair(pairId) {
  return FONT_PAIRS.find(p => p.id === pairId) ?? FONT_PAIRS[0];
}

/** @deprecated — individual font list kept for any remaining references */
export const FONT_OPTIONS = FONT_PAIRS.map(p => ({ name: p.heading, category: p.vibe }));

// MD3-compatible primary palette per accent × theme
// Only primary family is swapped; secondary/tertiary remain at CSS defaults
export const ACCENT_PALETTES = {
  purple: {
    label: 'Purple', swatch: '#9C27B0',
    dark:  { primary: '#E040FB', onPrimary: '#4A0072', primaryContainer: '#6A1B9A', onPrimaryContainer: '#F3E5F5' },
    light: { primary: '#9C27B0', onPrimary: '#FFFFFF', primaryContainer: '#F3E5F5', onPrimaryContainer: '#4A0072' },
  },
  pink: {
    label: 'Pink', swatch: '#E91E63',
    dark:  { primary: '#FF4081', onPrimary: '#880E4F', primaryContainer: '#C2185B', onPrimaryContainer: '#FCE4EC' },
    light: { primary: '#E91E63', onPrimary: '#FFFFFF', primaryContainer: '#FCE4EC', onPrimaryContainer: '#880E4F' },
  },
  red: {
    label: 'Red', swatch: '#F44336',
    dark:  { primary: '#FF5252', onPrimary: '#B71C1C', primaryContainer: '#D32F2F', onPrimaryContainer: '#FFEBEE' },
    light: { primary: '#F44336', onPrimary: '#FFFFFF', primaryContainer: '#FFEBEE', onPrimaryContainer: '#B71C1C' },
  },
  orange: {
    label: 'Orange', swatch: '#FF9800',
    dark:  { primary: '#FFB74D', onPrimary: '#E65100', primaryContainer: '#F57C00', onPrimaryContainer: '#FFF3E0' },
    light: { primary: '#FF9800', onPrimary: '#FFFFFF', primaryContainer: '#FFF3E0', onPrimaryContainer: '#E65100' },
  },
  amber: {
    label: 'Amber', swatch: '#FFC107',
    dark:  { primary: '#FFD54F', onPrimary: '#FF6F00', primaryContainer: '#FFA000', onPrimaryContainer: '#FFF8E1' },
    light: { primary: '#FFC107', onPrimary: '#000000', primaryContainer: '#FFF8E1', onPrimaryContainer: '#FF6F00' },
  },
  yellow: {
    label: 'Yellow', swatch: '#FFEB3B',
    dark:  { primary: '#FFFF00', onPrimary: '#F57F17', primaryContainer: '#FFD600', onPrimaryContainer: '#FFFDE7' },
    light: { primary: '#FBC02D', onPrimary: '#000000', primaryContainer: '#FFFDE7', onPrimaryContainer: '#F57F17' },
  },
  lime: {
    label: 'Lime', swatch: '#CDDC39',
    dark:  { primary: '#EEFF41', onPrimary: '#827717', primaryContainer: '#C0CA33', onPrimaryContainer: '#F9FBE7' },
    light: { primary: '#CDDC39', onPrimary: '#000000', primaryContainer: '#F9FBE7', onPrimaryContainer: '#827717' },
  },
  green: {
    label: 'Green', swatch: '#4CAF50',
    dark:  { primary: '#69F0AE', onPrimary: '#1B5E20', primaryContainer: '#388E3C', onPrimaryContainer: '#E8F5E9' },
    light: { primary: '#4CAF50', onPrimary: '#FFFFFF', primaryContainer: '#E8F5E9', onPrimaryContainer: '#1B5E20' },
  },
  teal: {
    label: 'Teal', swatch: '#009688',
    dark:  { primary: '#64FFDA', onPrimary: '#004D40', primaryContainer: '#00796B', onPrimaryContainer: '#E0F2F1' },
    light: { primary: '#009688', onPrimary: '#FFFFFF', primaryContainer: '#E0F2F1', onPrimaryContainer: '#004D40' },
  },
  cyan: {
    label: 'Cyan', swatch: '#00BCD4',
    dark:  { primary: '#18FFFF', onPrimary: '#006064', primaryContainer: '#0097A7', onPrimaryContainer: '#E0F7FA' },
    light: { primary: '#00BCD4', onPrimary: '#FFFFFF', primaryContainer: '#E0F7FA', onPrimaryContainer: '#006064' },
  },
  blue: {
    label: 'Blue', swatch: '#2196F3',
    dark:  { primary: '#40C4FF', onPrimary: '#01579B', primaryContainer: '#0288D1', onPrimaryContainer: '#E1F5FE' },
    light: { primary: '#2196F3', onPrimary: '#FFFFFF', primaryContainer: '#E1F5FE', onPrimaryContainer: '#01579B' },
  },
  indigo: {
    label: 'Indigo', swatch: '#3F51B5',
    dark:  { primary: '#536DFE', onPrimary: '#1A237E', primaryContainer: '#303F9F', onPrimaryContainer: '#E8EAF6' },
    light: { primary: '#3F51B5', onPrimary: '#FFFFFF', primaryContainer: '#E8EAF6', onPrimaryContainer: '#1A237E' },
  },
  violet: {
    label: 'Violet', swatch: '#673AB7',
    dark:  { primary: '#7C4DFF', onPrimary: '#311B92', primaryContainer: '#512DA8', onPrimaryContainer: '#EDE7F6' },
    light: { primary: '#673AB7', onPrimary: '#FFFFFF', primaryContainer: '#EDE7F6', onPrimaryContainer: '#311B92' },
  },
  rose: {
    label: 'Rose', swatch: '#E91E63',
    dark:  { primary: '#FF4081', onPrimary: '#880E4F', primaryContainer: '#C2185B', onPrimaryContainer: '#FCE4EC' },
    light: { primary: '#E91E63', onPrimary: '#FFFFFF', primaryContainer: '#FCE4EC', onPrimaryContainer: '#880E4F' },
  },
  deepPurple: {
    label: 'Deep Purple', swatch: '#673AB7',
    dark:  { primary: '#9575CD', onPrimary: '#311B92', primaryContainer: '#512DA8', onPrimaryContainer: '#EDE7F6' },
    light: { primary: '#673AB7', onPrimary: '#FFFFFF', primaryContainer: '#EDE7F6', onPrimaryContainer: '#311B92' },
  },
};

/** Apply an accent palette via an injected <style> block that respects data-theme. */
export function applyAccent(accentKey) {
  const palette = ACCENT_PALETTES[accentKey] ?? ACCENT_PALETTES.purple;
  const id = 'snaproll-accent-style';
  let style = document.getElementById(id);
  if (!style) {
    style = document.createElement('style');
    style.id = id;
    document.head.appendChild(style);
  }
  // Clear any stale inline styles from old applyAccent approach so CSS selectors win
  const el = document.documentElement;
  el.style.removeProperty('--color-md-primary');
  el.style.removeProperty('--color-md-on-primary');
  el.style.removeProperty('--color-md-primary-container');
  el.style.removeProperty('--color-md-on-primary-container');

  style.textContent = `
    :root {
      --color-md-primary:               ${palette.dark.primary};
      --color-md-on-primary:            ${palette.dark.onPrimary};
      --color-md-primary-container:     ${palette.dark.primaryContainer};
      --color-md-on-primary-container:  ${palette.dark.onPrimaryContainer};
    }
    [data-theme="light"] {
      --color-md-primary:               ${palette.light.primary};
      --color-md-on-primary:            ${palette.light.onPrimary};
      --color-md-primary-container:     ${palette.light.primaryContainer};
      --color-md-on-primary-container:  ${palette.light.onPrimaryContainer};
    }
  `;
}

/** Paperlike background patterns for standby screen */
export const PAPERBACKGROUNDS = {
  plain: {
    id: 'plain',
    label: 'Plain',
    className: 'bg-paper-plain',
  },
  grid: {
    id: 'grid',
    label: 'Grid',
    className: 'bg-paper-grid',
  },
  dots: {
    id: 'dots',
    label: 'Dots',
    className: 'bg-paper-dots',
  },
  lines: {
    id: 'lines',
    label: 'Lines',
    className: 'bg-paper-lines',
  },
};
