import { useState } from 'react';
import { Upload, X, Palette, Image as ImageIcon, Video, Download, Trash2, RotateCcw } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { PAPERBACKGROUNDS } from '../../lib/theme.js';

const GRADIENT_PRESETS = [
  { id: 'gradient-purple-pink', label: 'Purple Pink', css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'gradient-blue-cyan', label: 'Blue Cyan', css: 'linear-gradient(135deg, #667eea 0%, #00d2ff 100%)' },
  { id: 'gradient-orange-red', label: 'Orange Red', css: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'gradient-green-teal', label: 'Green Teal', css: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 'gradient-sunset', label: 'Sunset', css: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
];

const FONT_OPTIONS = [
  { id: 'Inter', label: 'Inter' },
  { id: 'Roboto', label: 'Roboto' },
  { id: 'Open Sans', label: 'Open Sans' },
  { id: 'Montserrat', label: 'Montserrat' },
  { id: 'Poppins', label: 'Poppins' },
  { id: 'Playfair Display', label: 'Playfair Display' },
];

const BUTTON_SHAPES = [
  { id: 'pill', label: 'Pill', class: 'rounded-full' },
  { id: 'rectangle', label: 'Rectangle', class: 'rounded-lg' },
  { id: 'square', label: 'Square', class: 'rounded-none' },
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
  const [presetName, setPresetName] = useState('');

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

  // Preset handlers
  function savePreset() {
    const name = presetName || `${homeScreen.title.text} ${new Date().toLocaleString()}`;
    const newPreset = {
      id: `preset-${Date.now()}`,
      name,
      config: JSON.parse(JSON.stringify(homeScreen)),
      createdAt: Date.now(),
    };
    updateSettings('homeScreen.presets', [...homeScreen.presets, newPreset]);
    setPresetName('');
  }

  function loadPreset(presetId) {
    const preset = homeScreen.presets.find(p => p.id === presetId);
    if (preset) {
      updateSettings('homeScreen', preset.config);
    }
  }

  function deletePreset(presetId) {
    updateSettings('homeScreen.presets', homeScreen.presets.filter(p => p.id !== presetId));
  }

  function resetSection(section) {
    const defaults = {
      background: { type: 'preset', presetId: 'plain', color: '#ffffff', gradientId: 'gradient-purple-pink', imageBase64: null, videoBase64: null },
      title: { enabled: true, text: 'MONO BOOTH PH', font: 'Inter', size: 56, color: '#000000' },
      subtitle: { enabled: true, text: 'Receipt Photobooth', font: 'Inter', size: 24, color: '#666666' },
      button: { shape: 'pill', scale: 1.0, text: 'Tap to Start', imageBase64: null },
      logo: { imageBase64: null, scale: 1.0, iconKey: null },
    };
    updateSettings(`homeScreen.${section}`, defaults[section]);
  }

  function resetAll() {
    updateSettings('homeScreen.presets', []);
    resetSection('background');
    resetSection('title');
    resetSection('subtitle');
    resetSection('button');
    resetSection('logo');
  }

  return (
    <div className="space-y-6">
      {/* Background Section */}
      <Section title="Background">
        <div className="space-y-4">
          {/* Background Type */}
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Background Type</label>
            <div className="flex gap-2">
              {['preset', 'color', 'gradient', 'image', 'video'].map(type => (
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

          {/* Preset Background */}
          {homeScreen.background.type === 'preset' && (
            <div>
              <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Preset</label>
              <div className="grid grid-cols-4 gap-2">
                {Object.values(PAPERBACKGROUNDS).map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => updateSettings('homeScreen.background.presetId', bg.id)}
                    className={`aspect-square rounded-lg border-2 transition-all ${
                      homeScreen.background.presetId === bg.id
                        ? 'border-md-primary ring-2 ring-md-primary ring-offset-2'
                        : 'border-md-outline-variant hover:border-md-outline'
                    }`}
                    style={{ backgroundColor: bg.color }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Solid Color */}
          {homeScreen.background.type === 'color' && (
            <div>
              <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={homeScreen.background.color}
                  onChange={e => updateSettings('homeScreen.background.color', e.target.value)}
                  className="w-12 h-12 rounded-lg border border-md-outline-variant cursor-pointer"
                />
                <input
                  type="text"
                  value={homeScreen.background.color}
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
                  />
                ))}
              </div>
            </div>
          )}

          {/* Image Upload */}
          {homeScreen.background.type === 'image' && (
            <div>
              <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Background Image</label>
              <div className="space-y-2">
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
              <div className="space-y-2">
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
                <p className="text-xs text-md-outline">Video will loop. Falls back to preset if it fails to load.</p>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Title & Subtitle Section */}
      <Section title="Title & Subtitle">
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

              {/* Font Picker */}
              <div>
                <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Font</label>
                <select
                  value={homeScreen.title.font}
                  onChange={e => {
                    updateSettings('homeScreen.title.font', e.target.value);
                    updateSettings('homeScreen.subtitle.font', e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-md-surface-container border border-md-outline-variant rounded-lg text-sm"
                >
                  {FONT_OPTIONS.map(font => (
                    <option key={font.id} value={font.id}>{font.label}</option>
                  ))}
                </select>
              </div>

              {/* Size Slider */}
              <div>
                <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Size: {homeScreen.title.size}px</label>
                <input
                  type="range"
                  min="24"
                  max="80"
                  value={homeScreen.title.size}
                  onChange={e => {
                    updateSettings('homeScreen.title.size', parseInt(e.target.value));
                    updateSettings('homeScreen.subtitle.size', parseInt(e.target.value) * 0.4);
                  }}
                  className="w-full"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={homeScreen.title.color}
                    onChange={e => {
                      updateSettings('homeScreen.title.color', e.target.value);
                      updateSettings('homeScreen.subtitle.color', e.target.value);
                    }}
                    className="w-12 h-12 rounded-lg border border-md-outline-variant cursor-pointer"
                  />
                  <input
                    type="text"
                    value={homeScreen.title.color}
                    onChange={e => {
                      updateSettings('homeScreen.title.color', e.target.value);
                      updateSettings('homeScreen.subtitle.color', e.target.value);
                    }}
                    className="flex-1 px-3 py-2 bg-md-surface-container border border-md-outline-variant rounded-lg text-sm"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </Section>

      {/* Button Section */}
      <Section title="Tap to Start Button">
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
        <div className="space-y-4">
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
              min="0.5"
              max="1.5"
              step="0.1"
              value={homeScreen.logo.scale}
              onChange={e => updateSettings('homeScreen.logo.scale', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </Section>

      {/* Presets Section */}
      <Section title="Presets">
        <div className="space-y-4">
          {/* Save Preset */}
          <div className="flex gap-2">
            <input
              type="text"
              value={presetName}
              onChange={e => setPresetName(e.target.value)}
              className="flex-1 px-3 py-2 bg-md-surface-container border border-md-outline-variant rounded-lg text-sm"
              placeholder="Preset name (optional)"
            />
            <button
              onClick={savePreset}
              className="flex items-center gap-2 px-4 py-2 bg-md-primary text-md-on-primary rounded-lg text-sm font-medium hover:brightness-110 transition-colors"
            >
              <Download size={16} />
              Save
            </button>
          </div>

          {/* Preset List */}
          {(homeScreen.presets || []).length > 0 && (
            <div className="space-y-2">
              {(homeScreen.presets || []).map(preset => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between px-3 py-2 bg-md-surface-container border border-md-outline-variant rounded-lg"
                >
                  <div>
                    <div className="text-sm font-medium text-md-on-surface">{preset.name}</div>
                    <div className="text-xs text-md-on-surface-variant">
                      {new Date(preset.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => loadPreset(preset.id)}
                      className="p-2 text-md-primary hover:bg-md-primary-container rounded-lg transition-colors"
                      title="Load"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => deletePreset(preset.id)}
                      className="p-2 text-md-error hover:bg-md-error-container rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reset Options */}
          <div className="flex gap-2">
            <button
              onClick={() => resetSection('background')}
              className="flex items-center gap-2 px-3 py-2 bg-md-surface-container border border-md-outline-variant rounded-lg text-sm hover:bg-md-surface-container-high transition-colors"
            >
              <RotateCcw size={16} />
              Reset Background
            </button>
            <button
              onClick={() => resetSection('title')}
              className="flex items-center gap-2 px-3 py-2 bg-md-surface-container border border-md-outline-variant rounded-lg text-sm hover:bg-md-surface-container-high transition-colors"
            >
              <RotateCcw size={16} />
              Reset Title
            </button>
            <button
              onClick={() => resetSection('button')}
              className="flex items-center gap-2 px-3 py-2 bg-md-surface-container border border-md-outline-variant rounded-lg text-sm hover:bg-md-surface-container-high transition-colors"
            >
              <RotateCcw size={16} />
              Reset Button
            </button>
            <button
              onClick={resetAll}
              className="flex items-center gap-2 px-3 py-2 bg-md-error-container border border-md-error rounded-lg text-sm text-md-on-error hover:brightness-110 transition-colors"
            >
              <Trash2 size={16} />
              Reset All
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}
