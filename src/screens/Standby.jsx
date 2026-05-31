import {
  Camera, Sparkles, Heart, Star, PartyPopper, Gift, Music,
  Diamond, Crown, Flame, Zap, Smile, Palette, Flag, Trophy, Cake,
  Flower2, TreePine, Cherry, Coffee, Wine, Beer,
  Bird, PawPrint, Rocket, Swords, Gamepad2, Dices,
  Globe, MapPin, Umbrella, Snowflake, Anchor, Bike,
  Pizza, Sandwich, Drum, Guitar, Mic, Headphones,
  Car, Plane, Train, Bus, Compass, Sunrise, Sunset, Cloud, CloudRain,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';
import { playClick } from '../hooks/useSound.js';
import { PAPERBACKGROUNDS } from '../lib/theme.js';

const ICON_MAP = {
  camera: Camera, sparkles: Sparkles, heart: Heart, star: Star,
  party: PartyPopper, gift: Gift, music: Music, diamond: Diamond,
  crown: Crown, flame: Flame, zap: Zap, smile: Smile,
  palette: Palette, flag: Flag, trophy: Trophy, cake: Cake,
  flower: Flower2, pine: TreePine, cherry: Cherry, coffee: Coffee,
  wine: Wine, beer: Beer, bird: Bird, paw: PawPrint,
  rocket: Rocket, swords: Swords, game: Gamepad2, dice: Dices,
  globe: Globe, pin: MapPin, umbrella: Umbrella, snow: Snowflake,
  anchor: Anchor, bike: Bike, pizza: Pizza, sandwich: Sandwich,
  drum: Drum, guitar: Guitar, mic: Mic, headphones: Headphones,
  car: Car, plane: Plane, train: Train, bus: Bus, compass: Compass,
  sunrise: Sunrise, sunset: Sunset, cloud: Cloud, rain: CloudRain,
};

function BrandingIcon({ iconKey, size = 52 }) {
  const IconComp = ICON_MAP[iconKey];
  if (!IconComp) return null;
  return <IconComp size={size} className="text-md-on-primary-container" />;
}

export default function Standby({ onStart }) {
  const { settings } = useSettings();
  const { general } = settings;
  const background = PAPERBACKGROUNDS[general.standbyBackground ?? 'plain'] ?? PAPERBACKGROUNDS.plain;

  function handleStart() {
    playClick();
    onStart();
  }

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center select-none cursor-pointer bg-md-surface active:scale-[0.99] page-content-enter ${background.className}`}
      onClick={handleStart}
      style={{
        transition: 'transform 100ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      }}
    >
      <div className="flex flex-col items-center gap-8 px-8 text-center">
        {/* Logo / Icon */}
        {general.logoBase64 ? (
          <img src={general.logoBase64} alt="Logo" className="w-28 h-28 object-contain rounded-3xl standby-icon-float animate-in fade-in slide-in-from-bottom-8 duration-700" />
        ) : general.brandingIcon ? (
          <div className="w-28 h-28 rounded-[28px] flex items-center justify-center bg-md-primary-container standby-icon-float animate-in fade-in slide-in-from-bottom-8 duration-700">
            <BrandingIcon iconKey={general.brandingIcon} size={52} />
          </div>
        ) : (
          <div className="w-28 h-28 rounded-[28px] flex items-center justify-center bg-md-primary-container standby-icon-float animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Camera size={52} className="text-md-on-primary-container" />
          </div>
        )}

        {/* Title block */}
        <div className="flex flex-col gap-1">
          {/* MD3 Display Small */}
          <h1 className="text-[56px] leading-[64px] font-normal tracking-tight text-md-on-surface standby-title-glow animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            {general.boothName || 'Snap & Roll'}
          </h1>
          {/* MD3 Title Large */}
          {general.eventName && (
            <p className="text-2xl font-normal text-md-on-surface-variant animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              {general.eventName}
            </p>
          )}
        </div>

        {/* Big touch CTA */}
        <div
          className="mt-2 flex items-center justify-center min-h-[64px] px-10 rounded-full bg-md-primary text-md-on-primary text-lg font-semibold tracking-wide shadow-lg hover:shadow-xl active:shadow-md active:scale-[0.97] standby-cta-pulse animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
          style={{ transition: 'box-shadow 150ms cubic-bezier(0.4, 0.0, 0.2, 1), transform 100ms cubic-bezier(0.4, 0.0, 0.2, 1)' }}
        >
          Tap to Start
        </div>
      </div>

      {/* Branding footer */}
      <div className="absolute bottom-8 flex flex-col items-center gap-0.5 animate-in fade-in duration-700 delay-400">
        <p className="text-sm font-semibold text-md-on-surface-variant tracking-wider">MONO STUDIO PH</p>
        <p className="text-[10px] text-md-outline tracking-widest uppercase">No proof without @monoboothph</p>
        <p className="text-[10px] text-md-on-surface-variant">📍 Kabankalan City & Beyond</p>
      </div>
    </div>
  );
}
