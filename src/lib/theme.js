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
    label: 'Purple', swatch: '#6750A4',
    dark:  { primary: '#D0BCFF', onPrimary: '#381E72', primaryContainer: '#4F378B', onPrimaryContainer: '#EADDFF' },
    light: { primary: '#6750A4', onPrimary: '#FFFFFF', primaryContainer: '#EADDFF', onPrimaryContainer: '#21005D' },
  },
  blue: {
    label: 'Blue', swatch: '#1B4EA5',
    dark:  { primary: '#A8C7FA', onPrimary: '#0A2E69', primaryContainer: '#1B4EA5', onPrimaryContainer: '#D6E3FF' },
    light: { primary: '#1B4EA5', onPrimary: '#FFFFFF', primaryContainer: '#D6E3FF', onPrimaryContainer: '#001440' },
  },
  teal: {
    label: 'Teal', swatch: '#006B5E',
    dark:  { primary: '#4FDACC', onPrimary: '#003733', primaryContainer: '#005048', onPrimaryContainer: '#70F7E9' },
    light: { primary: '#006B5E', onPrimary: '#FFFFFF', primaryContainer: '#70F7E9', onPrimaryContainer: '#00201C' },
  },
  green: {
    label: 'Green', swatch: '#006D32',
    dark:  { primary: '#6DD58C', onPrimary: '#003919', primaryContainer: '#00522A', onPrimaryContainer: '#89F5A8' },
    light: { primary: '#006D32', onPrimary: '#FFFFFF', primaryContainer: '#89F5A8', onPrimaryContainer: '#002110' },
  },
  orange: {
    label: 'Orange', swatch: '#8C4A00',
    dark:  { primary: '#FFB787', onPrimary: '#4A2800', primaryContainer: '#6B3B00', onPrimaryContainer: '#FFDCBE' },
    light: { primary: '#8C4A00', onPrimary: '#FFFFFF', primaryContainer: '#FFDCBE', onPrimaryContainer: '#2D1400' },
  },
  pink: {
    label: 'Pink', swatch: '#B0005A',
    dark:  { primary: '#FFB0CE', onPrimary: '#64003D', primaryContainer: '#8E0057', onPrimaryContainer: '#FFD8E8' },
    light: { primary: '#B0005A', onPrimary: '#FFFFFF', primaryContainer: '#FFD8E8', onPrimaryContainer: '#3E001C' },
  },
  red: {
    label: 'Red', swatch: '#BA1A1A',
    dark:  { primary: '#FFB3AD', onPrimary: '#680004', primaryContainer: '#93000D', onPrimaryContainer: '#FFDAD8' },
    light: { primary: '#BA1A1A', onPrimary: '#FFFFFF', primaryContainer: '#FFDAD6', onPrimaryContainer: '#410002' },
  },
  indigo: {
    label: 'Indigo', swatch: '#383E92',
    dark:  { primary: '#BBC2FF', onPrimary: '#1F2578', primaryContainer: '#383E92', onPrimaryContainer: '#DEE0FF' },
    light: { primary: '#383E92', onPrimary: '#FFFFFF', primaryContainer: '#DEE0FF', onPrimaryContainer: '#070E64' },
  },
  amber: {
    label: 'Amber', swatch: '#7A5900',
    dark:  { primary: '#F6C843', onPrimary: '#3F2E00', primaryContainer: '#5A4300', onPrimaryContainer: '#FFDF9E' },
    light: { primary: '#7A5900', onPrimary: '#FFFFFF', primaryContainer: '#FFDF9E', onPrimaryContainer: '#271900' },
  },
  rose: {
    label: 'Rose', swatch: '#9C2040',
    dark:  { primary: '#FFB1C1', onPrimary: '#5F1128', primaryContainer: '#7D2940', onPrimaryContainer: '#FFD9E2' },
    light: { primary: '#9C2040', onPrimary: '#FFFFFF', primaryContainer: '#FFD9E2', onPrimaryContainer: '#3E0016' },
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
