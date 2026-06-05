import { useEffect } from 'react';
import {
  Sun, Moon, Upload, X, Camera, Sparkles, Heart, Star,
  PartyPopper, Gift, Music, Diamond, Crown, Flame, Zap,
  Smile, Palette, Flag, Trophy, Cake, Info, Shuffle,
  Flower2, TreePine, Cherry, Coffee, Wine, Beer,
  Bird, PawPrint, Rocket, Swords, Gamepad2, Dices,
  Globe, MapPin, Umbrella, Snowflake, Anchor, Bike,
  Pizza, Sandwich, Drum, Guitar,
  Mic, Headphones, Car, Plane, Train, Bus,
  Compass, Sunrise, Sunset, Cloud, CloudRain,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { FONT_PAIRS, ACCENT_PALETTES, PAPERBACKGROUNDS } from '../../lib/theme.js';

const BRANDING_ICONS = [
  { key: 'camera', Icon: Camera, label: 'Camera' },
  { key: 'sparkles', Icon: Sparkles, label: 'Sparkles' },
  { key: 'heart', Icon: Heart, label: 'Heart' },
  { key: 'star', Icon: Star, label: 'Star' },
  { key: 'party', Icon: PartyPopper, label: 'Party' },
  { key: 'gift', Icon: Gift, label: 'Gift' },
  { key: 'music', Icon: Music, label: 'Music' },
  { key: 'diamond', Icon: Diamond, label: 'Diamond' },
  { key: 'crown', Icon: Crown, label: 'Crown' },
  { key: 'flame', Icon: Flame, label: 'Flame' },
  { key: 'zap', Icon: Zap, label: 'Zap' },
  { key: 'smile', Icon: Smile, label: 'Smile' },
  { key: 'palette', Icon: Palette, label: 'Art' },
  { key: 'flag', Icon: Flag, label: 'Flag' },
  { key: 'trophy', Icon: Trophy, label: 'Trophy' },
  { key: 'cake', Icon: Cake, label: 'Cake' },
  { key: 'flower', Icon: Flower2, label: 'Flower' },
  { key: 'pine', Icon: TreePine, label: 'Nature' },
  { key: 'cherry', Icon: Cherry, label: 'Cherry' },
  { key: 'coffee', Icon: Coffee, label: 'Coffee' },
  { key: 'wine', Icon: Wine, label: 'Wine' },
  { key: 'beer', Icon: Beer, label: 'Beer' },
  { key: 'bird', Icon: Bird, label: 'Bird' },
  { key: 'paw', Icon: PawPrint, label: 'Paw' },
  { key: 'rocket', Icon: Rocket, label: 'Rocket' },
  { key: 'swords', Icon: Swords, label: 'Swords' },
  { key: 'game', Icon: Gamepad2, label: 'Gaming' },
  { key: 'dice', Icon: Dices, label: 'Dice' },
  { key: 'globe', Icon: Globe, label: 'Globe' },
  { key: 'pin', Icon: MapPin, label: 'Location' },
  { key: 'umbrella', Icon: Umbrella, label: 'Beach' },
  { key: 'snow', Icon: Snowflake, label: 'Winter' },
  { key: 'anchor', Icon: Anchor, label: 'Anchor' },
  { key: 'bike', Icon: Bike, label: 'Bike' },
  { key: 'pizza', Icon: Pizza, label: 'Pizza' },
  { key: 'sandwich', Icon: Sandwich, label: 'Sandwich' },
  { key: 'drum', Icon: Drum, label: 'Drum' },
  { key: 'guitar', Icon: Guitar, label: 'Guitar' },
  { key: 'mic', Icon: Mic, label: 'Mic' },
  { key: 'headphones', Icon: Headphones, label: 'Headphones' },
  { key: 'car', Icon: Car, label: 'Car' },
  { key: 'plane', Icon: Plane, label: 'Plane' },
  { key: 'train', Icon: Train, label: 'Train' },
  { key: 'bus', Icon: Bus, label: 'Bus' },
  { key: 'compass', Icon: Compass, label: 'Compass' },
  { key: 'sunrise', Icon: Sunrise, label: 'Sunrise' },
  { key: 'sunset', Icon: Sunset, label: 'Sunset' },
  { key: 'cloud', Icon: Cloud, label: 'Cloud' },
  { key: 'rain', Icon: CloudRain, label: 'Rain' },
];

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-md-on-surface tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

export default function GeneralSettings() {
  const { settings, updateSettings } = useSettings();
  const { general } = settings;
  const activePair = FONT_PAIRS.find(p => p.id === general.fontPair) ?? FONT_PAIRS[0];

  // Logo upload - MOVED TO HOME SCREEN SETTINGS
  /*
  function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      updateSettings('general.logoBase64', ev.target.result);
      updateSettings('general.brandingIcon', null); // logo takes precedence
    };
    reader.readAsDataURL(file);
  }
  */

  // Background image upload - MOVED TO HOME SCREEN SETTINGS
  /*
  function handleBackgroundImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      updateSettings('general.backgroundImage', ev.target.result);
    };
    reader.readAsDataURL(file);
  }
  */

  useEffect(() => {
    // Fonts are now loaded locally via @font-face in index.html
  }, []);

  return (
    <div className="space-y-8 max-w-lg mx-auto">

      {/* ── Live Preview Card ── */}
      <div className="rounded-2xl border border-md-outline-variant bg-md-surface-container overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-md-surface-container-high border-b border-md-outline-variant">
          <span className="text-[10px] font-medium tracking-widest uppercase text-md-outline">Receipt Preview</span>
        </div>
        <div className="px-5 py-6 text-center">
          {/* Logo display - MOVED TO HOME SCREEN SETTINGS */}
          {/* {general.logoBase64 ? (
            <img src={general.logoBase64} alt="Logo" className="h-10 mx-auto mb-3 object-contain" />
          ) : general.brandingIcon ? (
            (() => {
              const found = BRANDING_ICONS.find(i => i.key === general.brandingIcon);
              const IconComp = found?.Icon;
              return IconComp ? <IconComp size={40} className="mx-auto mb-3 text-md-primary" /> : null;
            })()
          ) : null} */}
          <p
            className="text-xl font-bold text-md-on-surface"
            style={{ fontFamily: `'${activePair.heading}', sans-serif` }}
          >
            {general.boothName || 'Snap & Roll'}
          </p>
          {general.eventName && (
            <p
              className="text-sm mt-1 text-md-on-surface-variant"
              style={{ fontFamily: `'${activePair.body}', sans-serif` }}
            >
              {general.eventName}
            </p>
          )}
          <div className="mt-4 mx-auto w-16 h-1 rounded-full" style={{ backgroundColor: ACCENT_PALETTES[general.accent]?.swatch ?? '#6750A4' }} />
        </div>
      </div>

      {/* ── Identity ── MOVED TO HOME SCREEN SETTINGS */}
      {/* <Section title="Identity">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-1.5">Title</label>
            <input
              type="text"
              value={general.boothName}
              onChange={e => updateSettings('general.boothName', e.target.value)}
              className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-4 py-2.5 text-md-on-surface text-base focus:outline-none focus:border-md-primary transition-colors"
              placeholder="Snap & Roll"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-1.5">Subtitle</label>
            <input
              type="text"
              value={general.eventName}
              onChange={e => updateSettings('general.eventName', e.target.value)}
              className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-4 py-2.5 text-md-on-surface text-base focus:outline-none focus:border-md-primary transition-colors"
              placeholder="Receipt Photobooth"
            />
          </div>
          <button
            onClick={() => {
              const titles = [
                'Mia Turns 18', 'Miguel & Sofia', 'Lilibeth @ 80', 'Grad Night 2026',
                'Barkada Reunion', 'Team Offsite', 'Holiday Party', 'Baby Reveal',
                'Engagement Bash', 'New Year Countdown', 'Summer Luau', 'Retro Prom',
                'Wedding of Sarah & John', '50th Anniversary', 'Corporate Gala',
                'Birthday Bash', 'Sweet Sixteen', 'Quinceañera', 'Golden Jubilee',
                'Family Reunion', 'Class of 2025', 'Christmas Party', 'Halloween Spooktacular',
                'Valentine\'s Dance', 'Spring Fling', 'Beach Party', 'Winter Wonderland',
                'Karaoke Night', 'Game Night', 'Movie Marathon', 'Potluck Dinner',
                'Bridal Shower', 'Baby Shower', 'Bachelor Party', 'Bachelorette Party',
                'Retirement Party', 'Prom Night', 'Homecoming', 'Farewell Party',
              ];
              const subtitles = [
                'A celebration of life', 'Best day ever', 'Forever & always',
                'Cheers to many more', 'Making memories', 'Strike a pose',
                'Smile for the camera', 'Tonight we party', 'Love, laughter, photos',
                'Capture the moment', 'One for the books', 'Say cheese!',
                'Love is in the air', 'Together forever', 'Happily ever after',
                'Picture perfect moments', 'Memories to last a lifetime', 'Smile big!',
                'Snap, click, smile!', 'Freeze the moment', 'Time flies when having fun',
                'Life is beautiful', 'Enjoy the little things', 'Cherish every moment',
                'Laugh often, love much', 'Good times, great memories', 'Party like it\'s 1999',
                'Dance like nobody\'s watching', 'Live, love, laugh', 'Making history',
                'The best is yet to come', 'Adventure awaits', 'Dream big, smile often',
                'Celebrate good times', 'Joy to the world', 'Peace, love, and happiness',
                'Shine bright', 'Be your own kind of beautiful', 'You only live once',
                'Carpe diem', 'Seize the day', 'Make it count', 'No regrets',
              ];
              updateSettings('general.boothName', titles[Math.floor(Math.random() * titles.length)]);
              updateSettings('general.eventName', subtitles[Math.floor(Math.random() * subtitles.length)]);
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-medium text-md-primary bg-md-primary/8 border border-md-primary/20 hover:bg-md-primary/15 hover:scale-[1.02] active:scale-[0.98] transition-all"
            title="Generate random test text for both fields"
          >
            <Shuffle size={14} />
            Generate Test Text
          </button>
        </div>
      </Section> */}

      {/* ── Appearance ── */}
      <Section title="Appearance">
        {/* Theme */}
        <div className="flex gap-3">
          {[
            { key: 'dark',  label: 'Dark',  icon: Moon },
            { key: 'light', label: 'Light', icon: Sun },
          ].map(({ key, label, icon: Icon }) => {
            const isActive = general.theme === key;
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
        <div>
          <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Accent Color</label>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {Object.entries(ACCENT_PALETTES).map(([key, { label, swatch }]) => {
              const isActive = (general.accent ?? 'purple') === key;
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
                    backgroundColor: swatch + '14', // 8% opacity hex
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

        {/* Standby Background - MOVED TO HOME SCREEN SETTINGS */}
        {/* <div>
          <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Standby Background</label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Object.values(PAPERBACKGROUNDS).map((bg) => {
              const isActive = (general.standbyBackground ?? 'plain') === bg.id;
              return (
                <button
                  key={bg.id}
                  onClick={() => updateSettings('general.standbyBackground', bg.id)}
                  title={bg.label}
                  className={`relative flex-shrink-0 w-24 h-24 rounded-xl border-2 overflow-hidden transition-all duration-150 ${bg.className} ${
                    isActive
                      ? 'border-md-primary shadow-sm'
                      : 'border-md-outline-variant bg-md-surface-container hover:bg-md-surface-container-high'
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-md-surface/80">
                    <span className={`text-xs font-semibold ${isActive ? 'text-md-primary' : 'text-md-on-surface-variant'}`}>
                      {bg.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div> */}

        {/* Background Image Upload - MOVED TO HOME SCREEN SETTINGS */}
        {/* <div>
          <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Custom Background Image</label>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-md-surface-container-high border border-md-outline-variant mb-3">
            <Info size={16} className="text-md-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-md-on-surface-variant leading-relaxed">
              Upload a high-resolution image (1920×1080px recommended, under 5MB). Image will be cropped to fit the screen.
            </p>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-2xl border border-md-outline-variant bg-md-surface-container">
            {general.backgroundImage ? (
              <>
                <img src={general.backgroundImage} alt="Background" className="h-16 w-24 object-cover rounded-xl bg-md-surface" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-md-on-surface truncate">Background uploaded</p>
                  <p className="text-xs text-md-on-surface-variant">Replaces standby background</p>
                </div>
                <div className="flex gap-2">
                  <label className="cursor-pointer p-2 rounded-full hover:bg-md-surface-container-high text-md-on-surface-variant transition-colors" title="Change">
                    <Upload size={18} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundImageUpload} />
                  </label>
                  <button
                    onClick={() => updateSettings('general.backgroundImage', null)}
                    className="p-2 rounded-full hover:bg-md-error-container/30 text-md-error transition-colors"
                    title="Remove"
                  >
                    <X size={18} />
                  </button>
                </div>
              </>
            ) : (
              <label className="flex-1 flex flex-col items-center gap-2 py-6 cursor-pointer rounded-xl border border-dashed border-md-outline-variant hover:border-md-outline hover:bg-md-surface-container-high transition-colors">
                <Upload size={24} className="text-md-outline" />
                <span className="text-sm text-md-on-surface-variant">Upload background image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundImageUpload} />
              </label>
            )}
          </div>
        </div> */}
      </Section>

      {/* ── Typography ── */}
      <Section title="Typography">
        <div className="grid grid-cols-2 gap-2">
          {FONT_PAIRS.map((pair) => {
            const isActive = (general.fontPair ?? 'modern') === pair.id;
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
      </Section>

      {/* ── Branding ── */}
      <Section title="Branding">
        <div className="space-y-3">
          {/* Upload guide note */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-md-surface-container-high border border-md-outline-variant">
            <Info size={16} className="text-md-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-md-on-surface-variant leading-relaxed">
              Upload a square PNG/JPG (512×512px ideal, under 2MB). Transparent backgrounds look best on receipts.
            </p>
          </div>

          {/* Logo upload area */}
          <div className="flex items-center gap-3 p-3 rounded-2xl border border-md-outline-variant bg-md-surface-container">
            {general.logoBase64 ? (
              <>
                <img src={general.logoBase64} alt="Logo" className="h-16 w-16 object-contain rounded-xl bg-md-surface" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-md-on-surface truncate">Logo uploaded</p>
                  <p className="text-xs text-md-on-surface-variant">Replaces header text on receipts</p>
                </div>
                <div className="flex gap-2">
                  <label className="cursor-pointer p-2 rounded-full hover:bg-md-surface-container-high text-md-on-surface-variant transition-colors" title="Change">
                    <Upload size={18} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  <button
                    onClick={() => updateSettings('general.logoBase64', null)}
                    className="p-2 rounded-full hover:bg-md-error-container/30 text-md-error transition-colors"
                    title="Remove"
                  >
                    <X size={18} />
                  </button>
                </div>
              </>
            ) : (
              <label className="flex-1 flex flex-col items-center gap-2 py-6 cursor-pointer rounded-xl border border-dashed border-md-outline-variant hover:border-md-outline hover:bg-md-surface-container-high transition-colors">
                <Upload size={24} className="text-md-outline" />
                <span className="text-sm text-md-on-surface-variant">Upload logo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            )}
          </div>

          {/* Logo scaling for standby screen */}
          {general.logoBase64 && (
            <div>
              <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Logo Scale (Standby Screen)</label>
              <div className="flex gap-2">
                {[1.0, 1.1, 1.2, 1.3, 1.5].map(scale => (
                  <button
                    key={scale}
                    onClick={() => updateSettings('general.logoScale', scale)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      general.logoScale === scale
                        ? 'bg-md-primary text-md-on-primary'
                        : 'bg-md-surface-container text-md-on-surface-variant hover:bg-md-surface-container-high'
                    }`}
                  >
                    {scale === 1.0 ? '100%' : `+${Math.round((scale - 1) * 100)}%`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Icon picker — shown when no logo uploaded */}
          {!general.logoBase64 && (
            <div>
              <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Or choose an icon</label>
              <div className="grid grid-cols-6 gap-2">
                {BRANDING_ICONS.map(({ key, Icon, label }) => {
                  const isActive = general.brandingIcon === key;
                  return (
                    <button
                      key={key}
                      onClick={() => updateSettings('general.brandingIcon', isActive ? null : key)}
                      title={label}
                      className={`flex items-center justify-center aspect-square rounded-xl transition-all duration-150 ${
                        isActive
                          ? 'bg-md-primary-container text-md-on-primary-container shadow-sm'
                          : 'bg-md-surface-container text-md-on-surface-variant hover:bg-md-surface-container-high'
                      }`}
                    >
                      <Icon size={20} />
                    </button>
                  );
                })}
              </div>
              {general.brandingIcon && (
                <button
                  onClick={() => updateSettings('general.brandingIcon', null)}
                  className="mt-2 text-xs text-md-error hover:underline"
                >
                  Clear icon
                </button>
              )}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
