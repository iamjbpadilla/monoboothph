import { useState } from 'react';
import { Upload, X, Palette, Image as ImageIcon, Video, Trash2, RotateCcw, Sun, Moon, Eye, EyeOff, Move, Camera, Image, Star, Heart, Sparkles, PartyPopper, Gift, Music, Diamond, Crown, Flame, Zap, Smile, Palette as PaletteIcon, Flag, Trophy, Cake, Flower2, TreePine, Cherry, Coffee, Wine, Beer, Bird, PawPrint, Rocket, Swords, Gamepad2, Dices, Globe, MapPin, Umbrella, Snowflake, Anchor, Bike, Pizza, Sandwich, Drum, Guitar, Mic, Headphones, Car, Plane, Train, Bus, Compass, Sunrise, Sunset, Cloud, CloudRain } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { PAPERBACKGROUNDS, ACCENT_PALETTES, FONT_PAIRS, FONT_OPTIONS } from '../../lib/theme.js';
import ConfirmDialog from '../ConfirmDialog.jsx';

const GRADIENT_PRESETS = [
  { id: 'gradient-purple-pink', label: 'Purple Pink', css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'gradient-blue-cyan', label: 'Blue Cyan', css: 'linear-gradient(135deg, #667eea 0%, #00d2ff 100%)' },
  { id: 'gradient-orange-red', label: 'Orange Red', css: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'gradient-green-teal', label: 'Green Teal', css: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 'gradient-sunset', label: 'Sunset', css: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 'gradient-ocean', label: 'Ocean', css: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)' },
  { id: 'gradient-sunset-2', label: 'Sunset 2', css: 'linear-gradient(135deg, #ff512f 0%, #dd2476 100%)' },
  { id: 'gradient-forest', label: 'Forest', css: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
  { id: 'gradient-midnight', label: 'Midnight', css: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { id: 'gradient-royal', label: 'Royal', css: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)' },
];

const COLOR_PRESETS = [
  { id: 'color-white', label: 'White', color: '#ffffff' },
  { id: 'color-black', label: 'Black', color: '#000000' },
  { id: 'color-gray', label: 'Gray', color: '#6b7280' },
  { id: 'color-red', label: 'Red', color: '#ef4444' },
  { id: 'color-orange', label: 'Orange', color: '#f97316' },
  { id: 'color-yellow', label: 'Yellow', color: '#eab308' },
  { id: 'color-green', label: 'Green', color: '#22c55e' },
  { id: 'color-blue', label: 'Blue', color: '#3b82f6' },
  { id: 'color-purple', label: 'Purple', color: '#a855f7' },
  { id: 'color-pink', label: 'Pink', color: '#ec4899' },
];

const BUTTON_SHAPES = [
  { id: 'pill', label: 'Pill', class: 'rounded-full' },
  { id: 'rectangle', label: 'Rectangle', class: 'rounded-lg' },
  { id: 'square', label: 'Square', class: 'rounded-none' },
];

const BUTTON_ANIMATIONS = [
  { id: 'none', label: 'None', class: '' },
  { id: 'pulse', label: 'Pulse', class: 'standby-cta-pulse' },
  { id: 'pulse-slow', label: 'Pulse Slow', class: 'standby-cta-pulse-slow' },
  { id: 'pulse-fast', label: 'Pulse Fast', class: 'standby-cta-pulse-fast' },
  { id: 'pulse-glow', label: 'Pulse Glow', class: 'standby-cta-pulse-glow' },
  { id: 'pulse-ring', label: 'Pulse Ring', class: 'standby-cta-pulse-ring' },
  { id: 'bounce', label: 'Bounce', class: 'standby-cta-bounce' },
  { id: 'bounce-subtle', label: 'Bounce Subtle', class: 'standby-cta-bounce-subtle' },
  { id: 'bounce-elastic', label: 'Bounce Elastic', class: 'standby-cta-bounce-elastic' },
  { id: 'shake', label: 'Shake', class: 'standby-cta-shake' },
  { id: 'wiggle', label: 'Wiggle', class: 'standby-cta-wiggle' },
  { id: 'jiggle', label: 'Jiggle', class: 'standby-cta-jiggle' },
  { id: 'glow', label: 'Glow', class: 'standby-cta-glow' },
  { id: 'glow-pulse', label: 'Glow Pulse', class: 'standby-cta-glow-pulse' },
  { id: 'glow-border', label: 'Glow Border', class: 'standby-cta-glow-border' },
  { id: 'breathe', label: 'Breathe', class: 'standby-cta-breathe' },
  { id: 'pulse-scale', label: 'Pulse Scale', class: 'standby-cta-pulse-scale' },
];

const LOGO_ICONS = [
  { id: 'camera', label: 'Camera', icon: Camera },
  { id: 'photo', label: 'Photo', icon: Image },
  { id: 'smile', label: 'Smile', icon: Smile },
  { id: 'star', label: 'Star', icon: Star },
  { id: 'heart', label: 'Heart', icon: Heart },
  { id: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { id: 'party', label: 'Party', icon: PartyPopper },
  { id: 'gift', label: 'Gift', icon: Gift },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'diamond', label: 'Diamond', icon: Diamond },
  { id: 'crown', label: 'Crown', icon: Crown },
  { id: 'flame', label: 'Flame', icon: Flame },
  { id: 'zap', label: 'Zap', icon: Zap },
  { id: 'palette', label: 'Palette', icon: PaletteIcon },
  { id: 'flag', label: 'Flag', icon: Flag },
  { id: 'trophy', label: 'Trophy', icon: Trophy },
  { id: 'cake', label: 'Cake', icon: Cake },
  { id: 'flower', label: 'Flower', icon: Flower2 },
  { id: 'pine', label: 'Pine', icon: TreePine },
  { id: 'cherry', label: 'Cherry', icon: Cherry },
  { id: 'coffee', label: 'Coffee', icon: Coffee },
  { id: 'wine', label: 'Wine', icon: Wine },
  { id: 'beer', label: 'Beer', icon: Beer },
  { id: 'bird', label: 'Bird', icon: Bird },
  { id: 'paw', label: 'Paw', icon: PawPrint },
  { id: 'rocket', label: 'Rocket', icon: Rocket },
  { id: 'swords', label: 'Swords', icon: Swords },
  { id: 'game', label: 'Game', icon: Gamepad2 },
  { id: 'dice', label: 'Dice', icon: Dices },
  { id: 'globe', label: 'Globe', icon: Globe },
  { id: 'pin', label: 'Pin', icon: MapPin },
  { id: 'umbrella', label: 'Umbrella', icon: Umbrella },
  { id: 'snow', label: 'Snow', icon: Snowflake },
  { id: 'anchor', label: 'Anchor', icon: Anchor },
  { id: 'bike', label: 'Bike', icon: Bike },
  { id: 'pizza', label: 'Pizza', icon: Pizza },
  { id: 'sandwich', label: 'Sandwich', icon: Sandwich },
  { id: 'drum', label: 'Drum', icon: Drum },
  { id: 'guitar', label: 'Guitar', icon: Guitar },
  { id: 'mic', label: 'Mic', icon: Mic },
  { id: 'headphones', label: 'Headphones', icon: Headphones },
  { id: 'car', label: 'Car', icon: Car },
  { id: 'plane', label: 'Plane', icon: Plane },
  { id: 'train', label: 'Train', icon: Train },
  { id: 'bus', label: 'Bus', icon: Bus },
  { id: 'compass', label: 'Compass', icon: Compass },
  { id: 'sunrise', label: 'Sunrise', icon: Sunrise },
  { id: 'sunset', label: 'Sunset', icon: Sunset },
  { id: 'cloud', label: 'Cloud', icon: Cloud },
  { id: 'rain', label: 'Rain', icon: CloudRain },
];

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-md-on-surface tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

export default function HomeScreenSettings() {
  const { settings, updateSettings } = useSettings();
  const { homeScreen } = settings;
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', onConfirm: null });

  // Background handlers
  function handleBackgroundImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      updateSettings('homeScreen.background.imageBase64', ev.target.result);
      updateSettings('homeScreen.background.type', 'image');
    };
    reader.readAsDataURL(file);
  }

  function handleBackgroundVideoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      updateSettings('homeScreen.background.videoBase64', ev.target.result);
      updateSettings('homeScreen.background.type', 'video');
    };
    reader.readAsDataURL(file);
  }

  // Logo handlers
  function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      updateSettings('homeScreen.logo.imageBase64', ev.target.result);
      updateSettings('homeScreen.logo.iconKey', null);
    };
    reader.readAsDataURL(file);
  }

  // Button image handler
  function handleButtonImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      updateSettings('homeScreen.button.imageBase64', ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  function showConfirm(title, description, onConfirm) {
    setConfirmDialog({ open: true, title, description, onConfirm });
  }

  function resetSection(section) {
    const defaults = {
      background: { type: 'color', color: '#ffffff', gradientId: 'gradient-purple-pink', imageBase64: null, videoBase64: null },
      title: { enabled: true, text: 'MONO BOOTH PH', size: 56 },
      subtitle: { enabled: true, text: 'Receipt Photobooth', size: 24 },
      button: { shape: 'pill', scale: 1.0, text: 'Tap to Start', imageBase64: null, verticalOffset: 0, animation: 'pulse' },
      logo: { imageBase64: null, scale: 1.0, iconKey: null, enabled: true },
    };
    updateSettings(`homeScreen.${section}`, defaults[section]);
  }

  function resetAll() {
    resetSection('background');
    resetSection('title');
    resetSection('subtitle');
    resetSection('button');
    resetSection('logo');
  }

  return (
    <div className="space-y-6">
      {/* Title & Subtitle Section */}
      <Section title="Title & Subtitle">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => showConfirm(
              'Reset Title & Subtitle',
              'Are you sure you want to reset the title and subtitle to their default values?',
              () => {
                resetSection('title');
                resetSection('subtitle');
              }
            )}
            className="flex items-center gap-1 px-2 py-1 text-xs text-md-primary hover:bg-md-primary-container rounded-md transition-colors"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>
        <div className="space-y-4">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between py-3 px-4 bg-md-surface-container border border-md-outline-variant rounded-lg">
            <div>
              <div className="text-sm font-medium text-md-on-surface">Show Title & Subtitle</div>
              <div className="text-xs text-md-on-surface-variant">Display booth name and event name</div>
            </div>
            <button
              role="switch"
              aria-checked={homeScreen.title.enabled}
              onClick={() => {
                updateSettings('homeScreen.title.enabled', !homeScreen.title.enabled);
                updateSettings('homeScreen.subtitle.enabled', !homeScreen.subtitle.enabled);
              }}
              className={`relative inline-flex flex-shrink-0 w-[52px] h-[32px] rounded-full transition-colors duration-200 ${
                homeScreen.title.enabled
                  ? 'bg-md-primary'
                  : 'bg-md-surface-container-highest ring-2 ring-inset ring-md-outline'
              }`}
            >
              <span
                className={`pointer-events-none absolute top-[4px] left-[4px] w-[24px] h-[24px] rounded-full shadow-md transition-all duration-200 ease-out ${
                  homeScreen.title.enabled ? 'translate-x-[20px] bg-md-on-primary' : 'translate-x-0 bg-md-on-surface-variant'
                }`}
              />
            </button>
          </div>

          {homeScreen.title.enabled && (
            <>
              {/* Title Input */}
              <div>
                <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Title</label>
                <input
                  type="text"
                  value={homeScreen.title.text}
                  onChange={e => updateSettings('homeScreen.title.text', e.target.value)}
                  className="w-full px-3 py-2 bg-md-surface-container border border-md-outline-variant rounded-lg text-sm"
                  placeholder="MONO BOOTH PH"
                />
              </div>

              {/* Title Size Slider */}
              <div>
                <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Title Size: {homeScreen.title.size}px</label>
                <input
                  type="range"
                  min="24"
                  max="80"
                  value={homeScreen.title.size}
                  onChange={e => updateSettings('homeScreen.title.size', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Subtitle Input */}
              <div>
                <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Subtitle</label>
                <input
                  type="text"
                  value={homeScreen.subtitle.text}
                  onChange={e => updateSettings('homeScreen.subtitle.text', e.target.value)}
                  className="w-full px-3 py-2 bg-md-surface-container border border-md-outline-variant rounded-lg text-sm"
                  placeholder="Receipt Photobooth"
                />
              </div>

              {/* Subtitle Size Slider */}
              <div>
                <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Subtitle Size: {homeScreen.subtitle.size}px</label>
                <input
                  type="range"
                  min="16"
                  max="48"
                  value={homeScreen.subtitle.size}
                  onChange={e => updateSettings('homeScreen.subtitle.size', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      </Section>

      {/* Background Section */}
      <Section title="Background">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => showConfirm(
              'Reset Background',
              'Are you sure you want to reset the background to its default settings?',
              () => resetSection('background')
            )}
            className="flex items-center gap-1 px-2 py-1 text-xs text-md-primary hover:bg-md-primary-container rounded-md transition-colors"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>
        <div className="space-y-4">
          {/* Background Type */}
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Background Type</label>
            <div className="flex gap-2">
              {['color', 'gradient', 'image', 'video'].map(type => (
                <button
                  key={type}
                  onClick={() => updateSettings('homeScreen.background.type', type)}
                  className={`px-3 py-2 text-sm capitalize rounded-lg border transition-colors ${
                    homeScreen.background.type === type
                      ? 'bg-md-primary text-md-on-primary border-md-primary'
                      : 'bg-md-surface-container text-md-on-surface-variant border-md-outline-variant hover:bg-md-surface-container-high'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Solid Color */}
          {homeScreen.background.type === 'color' && (
            <div>
              <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={homeScreen.background.color || '#ffffff'}
                  onChange={e => updateSettings('homeScreen.background.color', e.target.value)}
                  className="w-12 h-12 rounded-lg border border-md-outline-variant cursor-pointer"
                />
                <input
                  type="text"
                  value={homeScreen.background.color || '#ffffff'}
                  onChange={e => updateSettings('homeScreen.background.color', e.target.value)}
                  className="flex-1 px-3 py-2 bg-md-surface-container border border-md-outline-variant rounded-lg text-sm"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          )}

          {/* Gradient */}
          {homeScreen.background.type === 'gradient' && (
            <div>
              <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Gradient</label>
              <div className="grid grid-cols-2 gap-2">
                {GRADIENT_PRESETS.map(grad => (
                  <button
                    key={grad.id}
                    onClick={() => updateSettings('homeScreen.background.gradientId', grad.id)}
                    className={`h-12 rounded-lg border-2 transition-all ${
                      homeScreen.background.gradientId === grad.id
                        ? 'border-md-primary ring-2 ring-md-primary ring-offset-2'
                        : 'border-md-outline-variant hover:border-md-outline'
                    }`}
                    style={{ background: grad.css }}
                    title={grad.label}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Image Upload */}
          {homeScreen.background.type === 'image' && (
            <div>
              <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Background Image</label>
              <div className="space-y-3">
                {homeScreen.background.imageBase64 && (
                  <div className="relative">
                    <img
                      src={homeScreen.background.imageBase64}
                      alt="Background"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => updateSettings('homeScreen.background.imageBase64', null)}
                      className="absolute top-2 right-2 p-1 bg-md-error-container rounded-full text-md-on-error-container"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-md-surface-container border border-md-outline-variant rounded-lg cursor-pointer hover:bg-md-surface-container-high transition-colors">
                  <Upload size={16} />
                  <span className="text-sm">Upload Image (1920×1080px, under 5MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Video Upload */}
          {homeScreen.background.type === 'video' && (
            <div>
              <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Background Video</label>
              <div className="space-y-3">
                {homeScreen.background.videoBase64 && (
                  <div className="relative">
                    <video
                      src={homeScreen.background.videoBase64}
                      className="w-full h-32 object-cover rounded-lg"
                      muted
                      loop
                      autoPlay
                    />
                    <button
                      onClick={() => updateSettings('homeScreen.background.videoBase64', null)}
                      className="absolute top-2 right-2 p-1 bg-md-error-container rounded-full text-md-on-error-container"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-md-surface-container border border-md-outline-variant rounded-lg cursor-pointer hover:bg-md-surface-container-high transition-colors">
                  <Video size={16} />
                  <span className="text-sm">Upload Video (MP4/WebM, loops)</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleBackgroundVideoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-md-outline">Video will loop. Falls back to solid color if it fails to load.</p>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Button Section */}
      <Section title="Tap to Start Button">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => showConfirm(
              'Reset Button',
              'Are you sure you want to reset the button to its default settings?',
              () => resetSection('button')
            )}
            className="flex items-center gap-1 px-2 py-1 text-xs text-md-primary hover:bg-md-primary-container rounded-md transition-colors"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>
        <div className="space-y-4">
          {/* Shape */}
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Shape</label>
            <div className="flex gap-2">
              {BUTTON_SHAPES.map(shape => (
                <button
                  key={shape.id}
                  onClick={() => updateSettings('homeScreen.button.shape', shape.id)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    homeScreen.button.shape === shape.id
                      ? 'bg-md-primary text-md-on-primary border-md-primary'
                      : 'bg-md-surface-container text-md-on-surface-variant border-md-outline-variant hover:bg-md-surface-container-high'
                  }`}
                >
                  {shape.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size Slider */}
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Size: {Math.round(homeScreen.button.scale * 100)}%</label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={homeScreen.button.scale}
              onChange={e => updateSettings('homeScreen.button.scale', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Vertical Position */}
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Vertical Position: {homeScreen.button.verticalOffset || 0}px</label>
            <div className="grid grid-cols-5 gap-2">
              {[0, 10, 25, 50, 75, 100].map(offset => (
                <button
                  key={offset}
                  onClick={() => updateSettings('homeScreen.button.verticalOffset', offset)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    (homeScreen.button.verticalOffset || 0) === offset
                      ? 'bg-md-primary text-md-on-primary border-md-primary'
                      : 'bg-md-surface-container text-md-on-surface-variant border-md-outline-variant hover:bg-md-surface-container-high'
                  }`}
                >
                  {offset === 0 ? 'Default' : `${offset}px`}
                </button>
              ))}
            </div>
            <p className="text-xs text-md-outline mt-1">Move button down from center (0 = centered)</p>
          </div>

          {/* Animation */}
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Animation</label>
            <div className="grid grid-cols-3 gap-2">
              {BUTTON_ANIMATIONS.map(anim => (
                <button
                  key={anim.id}
                  onClick={() => updateSettings('homeScreen.button.animation', anim.id)}
                  className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                    (homeScreen.button.animation || 'pulse') === anim.id
                      ? 'bg-md-primary text-md-on-primary border-md-primary'
                      : 'bg-md-surface-container text-md-on-surface-variant border-md-outline-variant hover:bg-md-surface-container-high'
                  }`}
                >
                  {anim.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Button Text</label>
            <input
              type="text"
              value={homeScreen.button.text}
              onChange={e => updateSettings('homeScreen.button.text', e.target.value)}
              className="w-full px-3 py-2 bg-md-surface-container border border-md-outline-variant rounded-lg text-sm"
              placeholder="Tap to Start"
            />
          </div>

          {/* Button Image Upload */}
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Button Image (Optional)</label>
            <div className="space-y-2">
              {homeScreen.button.imageBase64 && (
                <div className="relative">
                  <img
                    src={homeScreen.button.imageBase64}
                    alt="Button"
                    className="w-full h-20 object-contain rounded-lg bg-md-surface-container"
                  />
                  <button
                    onClick={() => updateSettings('homeScreen.button.imageBase64', null)}
                    className="absolute top-2 right-2 p-1 bg-md-error-container rounded-full text-md-on-error-container"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <label className="flex items-center justify-center gap-2 px-4 py-3 bg-md-surface-container border border-md-outline-variant rounded-lg cursor-pointer hover:bg-md-surface-container-high transition-colors">
                <ImageIcon size={16} />
                <span className="text-sm">Upload Button Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleButtonImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </Section>

      {/* Logo Section */}
      <Section title="Logo">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => showConfirm(
              'Reset Logo',
              'Are you sure you want to reset the logo to its default settings?',
              () => resetSection('logo')
            )}
            className="flex items-center gap-1 px-2 py-1 text-xs text-md-primary hover:bg-md-primary-container rounded-md transition-colors"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>
        <div className="space-y-4">
          {/* Show/Hide Toggle */}
          <div className="flex items-center justify-between py-3 px-4 bg-md-surface-container border border-md-outline-variant rounded-lg">
            <div>
              <div className="text-sm font-medium text-md-on-surface">Show Logo</div>
              <div className="text-xs text-md-on-surface-variant">Display logo on home screen</div>
            </div>
            <button
              role="switch"
              aria-checked={homeScreen.logo.enabled !== false}
              onClick={() => updateSettings('homeScreen.logo.enabled', homeScreen.logo.enabled === false)}
              className={`relative inline-flex flex-shrink-0 w-[52px] h-[32px] rounded-full transition-colors duration-200 ${
                homeScreen.logo.enabled !== false
                  ? 'bg-md-primary'
                  : 'bg-md-surface-container-highest ring-2 ring-inset ring-md-outline'
              }`}
            >
              <span
                className={`pointer-events-none absolute top-[4px] left-[4px] w-[24px] h-[24px] rounded-full shadow-md transition-all duration-200 ease-out ${
                  homeScreen.logo.enabled !== false ? 'translate-x-[20px] bg-md-on-primary' : 'translate-x-0 bg-md-on-surface-variant'
                }`}
              />
            </button>
          </div>

          {homeScreen.logo.enabled !== false && (
            <>
              {/* Icon Selection */}
              <div>
                <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Icon</label>
                <div className="grid grid-cols-6 gap-2 mb-2">
                  {LOGO_ICONS.map(iconOption => (
                    <button
                      key={iconOption.id}
                      onClick={() => {
                        updateSettings('homeScreen.logo.iconKey', iconOption.id);
                        updateSettings('homeScreen.logo.imageBase64', null);
                      }}
                      className={`aspect-square rounded-lg border-2 transition-all flex items-center justify-center ${
                        homeScreen.logo.iconKey === iconOption.id && !homeScreen.logo.imageBase64
                          ? 'border-md-primary ring-2 ring-md-primary ring-offset-2'
                          : 'border-md-outline-variant hover:border-md-outline'
                      }`}
                      title={iconOption.label}
                    >
                      <iconOption.icon size={18} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Logo Image</label>
                <div className="space-y-2">
                  {homeScreen.logo.imageBase64 && (
                    <div className="relative">
                      <img
                        src={homeScreen.logo.imageBase64}
                        alt="Logo"
                        className="w-full h-32 object-contain rounded-lg bg-md-surface-container"
                      />
                      <button
                        onClick={() => updateSettings('homeScreen.logo.imageBase64', null)}
                        className="absolute top-2 right-2 p-1 bg-md-error-container rounded-full text-md-on-error-container"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center justify-center gap-2 px-4 py-3 bg-md-surface-container border border-md-outline-variant rounded-lg cursor-pointer hover:bg-md-surface-container-high transition-colors">
                    <Upload size={16} />
                    <span className="text-sm">Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Logo Scale */}
              <div>
                <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Logo Scale: {Math.round(homeScreen.logo.scale * 100)}%</label>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={homeScreen.logo.scale}
                  onChange={e => updateSettings('homeScreen.logo.scale', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-md-on-surface-variant">20%</span>
                  <span className="text-[10px] text-md-on-surface-variant">300%</span>
                </div>
              </div>
            </>
          )}
        </div>
      </Section>

      {/* Appearance Section */}
      <Section title="Appearance">
        <div className="space-y-4">
          {/* Theme */}
          <div className="flex gap-3 mb-4">
            {[
              { key: 'dark',  label: 'Dark',  icon: Moon },
              { key: 'light', label: 'Light', icon: Sun },
            ].map(({ key, label, icon: Icon }) => {
              const isActive = settings.general.theme === key;
              return (
                <button
                  key={key}
                  onClick={() => updateSettings('general.theme', key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-md-primary text-md-on-primary border-md-primary shadow-md'
                      : 'bg-md-surface-container text-md-on-surface-variant border-md-outline-variant hover:bg-md-surface-container-high'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Accent */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Accent Color</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {Object.entries(ACCENT_PALETTES).map(([key, { label, swatch }]) => {
                const isActive = (settings.general.accent ?? 'purple') === key;
                return (
                  <button
                    key={key}
                    onClick={() => updateSettings('general.accent', key)}
                    title={label}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all duration-150 ${
                      isActive
                        ? 'shadow-sm'
                        : 'border-md-outline-variant bg-md-surface-container hover:bg-md-surface-container-high'
                    }`}
                    style={isActive ? {
                      borderColor: swatch,
                      backgroundColor: swatch + '14',
                    } : {}}
                  >
                    <div
                      className="w-5 h-5 rounded-full shadow-sm ring-2 ring-white"
                      style={{ backgroundColor: swatch }}
                    />
                    <span
                      className="text-[10px] font-medium truncate w-full text-center"
                      style={isActive ? { color: swatch } : {}}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typography */}
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Typography</label>
            <div className="grid grid-cols-2 gap-2">
              {FONT_PAIRS.map((pair) => {
                const isActive = (settings.general.fontPair ?? 'modern') === pair.id;
                return (
                  <button
                    key={pair.id}
                    onClick={() => updateSettings('general.fontPair', pair.id)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-left transition-all duration-150 ${
                      isActive
                        ? 'bg-md-primary-container border-md-primary shadow-md'
                        : 'bg-md-surface-container border-md-outline-variant hover:bg-md-surface-container-high'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span
                        className={`text-base font-bold leading-tight ${isActive ? 'text-md-on-primary-container' : 'text-md-on-surface'}`}
                        style={{ fontFamily: `'${pair.heading}', sans-serif` }}
                      >
                        {pair.name}
                      </span>
                      <span
                        className={`text-xs mt-0.5 ${isActive ? 'text-md-on-primary-container/70' : 'text-md-on-surface-variant'}`}
                        style={{ fontFamily: `'${pair.body}', sans-serif` }}
                      >
                        {pair.vibe}
                      </span>
                    </div>
                    <span className={`text-[10px] ${isActive ? 'text-md-on-primary-container/50' : 'text-md-outline'}`}>
                      {pair.heading} · {pair.body}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* Reset All Button */}
      <div className="pt-6 border-t border-md-outline-variant">
        <button
          onClick={() => showConfirm(
            'Reset All Home Screen Settings',
            'Are you sure you want to reset all home screen settings to their default values? This cannot be undone.',
            resetAll
          )}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-md-error-container border border-md-error rounded-xl text-sm font-medium text-md-on-error hover:brightness-110 transition-colors"
        >
          <Trash2 size={16} />
          Reset All Home Screen Settings
        </button>
      </div>
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={() => {
          if (confirmDialog.onConfirm) confirmDialog.onConfirm();
        }}
      />
    </div>
  );
}
