# Snap & Roll — Session Update (May 30, 2026)

## New Features

### Sound System (`src/hooks/useSound.js`)
- Web Audio API generated sounds — no external files, works offline
- `playClick()` — button click feedback
- `playHover()` — subtle hover tick
- `playShutter()` — mechanical click + noise burst for photo capture
- `playBeep()` — countdown timer ticks
- `playSuccess()` — C-major arpeggio for print success
- `playError()` — descending buzz for print failures
- `playTransition()` — rising sweep for screen changes
- Wired into every screen: Standby, Capture, CountdownOverlay, TemplateSelect, PrintPreview, PrintStatus, SettingsPanel

### Branding Icons (`src/components/settings/GeneralSettings.jsx`)
- 34 icon options (expanded from 16): Camera, Sparkles, Heart, Star, Party, Gift, Music, Diamond, Crown, Flame, Zap, Smile, Art, Flag, Trophy, Cake, Flower, Pine Tree, Cherry, Coffee, Wine, Beer, Bird, Paw Print, Rocket, Swords, Gamepad, Dice, Globe, Pin, Umbrella, Snowflake, Anchor, Bike
- Shown in 6-column grid for better touch targets
- Icon renders on Standby screen when no logo is uploaded
- Auto-clears icon selection when a logo image is uploaded
- Standby `ICON_MAP` supports all 34 icons

### Block Order Reordering (`src/components/settings/TemplateSettings.jsx`)
- Drag-and-drop via native HTML5 DnD API
- Grip handle (`GripVertical`) on each row
- Visual feedback: dragged item fades to 40%, drop target gets primary ring
- Updates `blockOrder` array in settings and triggers live preview refresh
- `canvasCompositor.js` fully refactored to iterate `blockOrder` for both height calc and drawing

### Barcode Text Toggle (`src/components/settings/TemplateSettings.jsx`)
- New toggle: "Show text below barcode"
- `showText` default is `true`
- `renderBarcode()` respects `displayValue` based on `showText`

## UI Enhancements

### Standby Screen (`src/screens/Standby.jsx`)
- Title size: `45px` → `56px` (leading `52px` → `64px`)
- Subtitle size: `text-xl` → `text-2xl`
- **Subtle looping animations:**
  - Icon float: 6px vertical float + 3% scale pulse (4s cycle)
  - Title glow: opacity breathe 1.0 → 0.85 (5s cycle)
  - CTA pulse: scale 1.0 → 1.02 with shadow expansion (3s cycle)

### Print Preview (`src/screens/PrintPreview.jsx`)
- Receipt entrance animation: `scale(0.96) translateY(10px)` → `scale(1) translateY(0)`, 300ms MD3 decelerate
- Auto-print countdown: button shows "Print (10)" counting down to "Print (1)", auto-fires at 0

### Print Status (`src/screens/PrintStatus.jsx`)
- Auto-return to standby: 10 seconds
- Realistic QR code using `qrcode` package
- Static footer branding: "SNAP & ROLL / Show them the proof!"
- Removed redundant countdown text (countdown only shown on button)

### Capture Screen (`src/screens/Capture.jsx`)
- "Get Ready" overlay with enter/hold/exit animation:
  - Overlay fades in (0-15%), holds (15-85%), fades out (85-100%)
  - Text springs in with overshoot, holds, then floats up and fades
  - Duration 1.2s matching the get-ready pause timer
- Removed retake button from Capture top bar (retake only via PrintPreview)
- Cross-fade transition fixes: `useCrossFadeNavigate` uses refs for stale closure prevention, `captureSession` key prevents remount glitch
- Camera stays alive during transition (removed premature `stopCamera()`), completion overlay covers video during hand-off

### Settings Panel (`src/components/SettingsPanel.jsx`)
- FAB moved from top-right to bottom-right (`bottom-4 right-4`)
- Manual save architecture restored: dirty state, save button, unsaved changes dialog, reset confirmation
- Snackbar uses MD3 motion timing
- All interactive buttons wired with click sounds

### Template Settings (`src/components/settings/TemplateSettings.jsx`)
- Redundant fields removed: header text/font/bold, footer text/font/alignment, photo gap, custom text font/alignment, barcode type picker
- Divider restored with more options: solid/dashed/dotted/double style + thickness + color
- Element spacing control (4-48px) for entire receipt layout
- Toggle buttons rebuilt: `ring-2 ring-inset` for off-state (no box-model shift), proper MD3 proportions (52×32)

## Bug Fixes

- `resolveFontPair is not defined` — added import to `canvasCompositor.js`
- Canvas compositor `NaN` drawing — all `textH()`, `gridH()`, `photosH()`, `barcodeH()` calls now pass `elGap` parameter
- Interlude screen visibility — `CleaningScreen` integrated into global navigation flow via `useCrossFadeNavigate`
- Cleaning interlude duration: 10s → 3s (message rotation 1200ms → 600ms)
- Camera capture → PrintPreview transition glitch — fixed by removing `stopCamera()` premature call, adding completion overlay, reducing delay from 600ms to 200ms

## Architecture

- `blockOrder` array added to `defaultBlocks()` in `SettingsContext.jsx`
- `brandingIcon: null` added to general settings defaults
- `elementSpacing: 16` and `divider.style: 'solid'` added to block defaults
- `barcode.showText: true` added to block defaults
- Canvas compositor: `drawDivider()` supports solid/dashed/dotted/double styles
- Canvas compositor: spacing system migrated from hardcoded `BLOCK_GAP = 8` to configurable `elGap` parameter throughout
