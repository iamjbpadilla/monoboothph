import { useState, useEffect, useRef, useCallback } from 'react';
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

const GRADIENT_PRESETS = {
  'gradient-purple-pink': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'gradient-blue-cyan': 'linear-gradient(135deg, #667eea 0%, #00d2ff 100%)',
  'gradient-orange-red': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'gradient-green-teal': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'gradient-sunset': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
};

const BUTTON_SHAPES = {
  pill: 'rounded-full',
  rectangle: 'rounded-lg',
  square: 'rounded-none',
};

const BUTTON_ANIMATIONS = {
  'none': '',
  'pulse': 'standby-cta-pulse',
  'pulse-slow': 'standby-cta-pulse-slow',
  'pulse-fast': 'standby-cta-pulse-fast',
  'pulse-glow': 'standby-cta-pulse-glow',
  'pulse-ring': 'standby-cta-pulse-ring',
  'bounce': 'standby-cta-bounce',
  'bounce-subtle': 'standby-cta-bounce-subtle',
  'bounce-elastic': 'standby-cta-bounce-elastic',
  'shake': 'standby-cta-shake',
  'wiggle': 'standby-cta-wiggle',
  'jiggle': 'standby-cta-jiggle',
  'glow': 'standby-cta-glow',
  'glow-pulse': 'standby-cta-glow-pulse',
  'glow-border': 'standby-cta-glow-border',
  'breathe': 'standby-cta-breathe',
  'pulse-scale': 'standby-cta-pulse-scale',
};

function BrandingIcon({ iconKey, size = 52 }) {
  const IconComp = ICON_MAP[iconKey];
  if (!IconComp) return null;
  return <IconComp size={size} className="text-md-on-primary-container" />;
}

// Dual-read helper: check new path first, fallback to old path
function getSetting(settings, newPath, oldPath, defaultValue) {
  const newParts = newPath.split('.');
  const oldParts = oldPath?.split('.');
  
  // Try new path
  let newVal = settings;
  for (const part of newParts) {
    if (newVal && newVal[part] !== undefined) {
      newVal = newVal[part];
    } else {
      newVal = undefined;
      break;
    }
  }
  
  if (newVal !== undefined) return newVal;
  
  // Fallback to old path
  if (oldPath) {
    let oldVal = settings;
    for (const part of oldParts) {
      if (oldVal && oldVal[part] !== undefined) {
        oldVal = oldVal[part];
      } else {
        oldVal = undefined;
        break;
      }
    }
    if (oldVal !== undefined) return oldVal;
  }
  
  return defaultValue;
}

export default function Standby({ onStart, onOpenSettings }) {
  const { settings } = useSettings();
  const [videoError, setVideoError] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const longPressTimerRef = useRef(null);
  const longPressDuration = settings.general.longPressDuration || 3000;
  
  // Long press handler - dispatch custom event to open settings
  const handleMouseDown = useCallback(() => {
    longPressTimerRef.current = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('openSettings'));
    }, longPressDuration);
  }, [longPressDuration]);
  
  const handleMouseUp = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);
  
  // Dual-read settings
  const homeScreen = settings.homeScreen || {};
  const general = settings.general || {};
  
  // Background settings with dual-read
  const bgType = getSetting(settings, 'homeScreen.background.type', null, 'preset');
  const bgPresetId = getSetting(settings, 'homeScreen.background.presetId', 'general.standbyBackground', 'plain');
  const bgColor = getSetting(settings, 'homeScreen.background.color', null, '#ffffff');
  const bgGradientId = getSetting(settings, 'homeScreen.background.gradientId', null, 'gradient-purple-pink');
  const bgImageBase64 = getSetting(settings, 'homeScreen.background.imageBase64', 'general.backgroundImage', null);
  const bgVideoBase64 = getSetting(settings, 'homeScreen.background.videoBase64', null, null);
  
  // Title/subtitle with dual-read
  const titleEnabled = getSetting(settings, 'homeScreen.title.enabled', null, true);
  const titleText = getSetting(settings, 'homeScreen.title.text', 'general.boothName', 'MONO BOOTH PH');
  const titleFont = getSetting(settings, 'homeScreen.title.font', null, 'Inter');
  const titleSize = getSetting(settings, 'homeScreen.title.size', null, 56);
  
  const subtitleEnabled = getSetting(settings, 'homeScreen.subtitle.enabled', null, true);
  const subtitleText = getSetting(settings, 'homeScreen.subtitle.text', 'general.eventName', 'Receipt Photobooth');
  const subtitleFont = getSetting(settings, 'homeScreen.subtitle.font', null, 'Inter');
  const subtitleSize = getSetting(settings, 'homeScreen.subtitle.size', null, 24);
  
  // Button with dual-read
  const buttonShape = getSetting(settings, 'homeScreen.button.shape', null, 'pill');
  const buttonScale = getSetting(settings, 'homeScreen.button.scale', null, 1.0);
  const buttonText = getSetting(settings, 'homeScreen.button.text', null, 'Tap to Start');
  const buttonImageBase64 = getSetting(settings, 'homeScreen.button.imageBase64', null, null);
  const buttonVerticalOffset = getSetting(settings, 'homeScreen.button.verticalOffset', null, 0);
  const buttonAnimation = getSetting(settings, 'homeScreen.button.animation', null, 'pulse');
  
  // Logo with dual-read
  const logoEnabled = getSetting(settings, 'homeScreen.logo.enabled', null, true);
  const logoImageBase64 = getSetting(settings, 'homeScreen.logo.imageBase64', 'general.logoBase64', null);
  const logoScale = getSetting(settings, 'homeScreen.logo.scale', 'general.logoScale', 1.0);
  const logoIconKey = getSetting(settings, 'homeScreen.logo.iconKey', 'general.brandingIcon', null);
  
  // Get background style
  const background = PAPERBACKGROUNDS[bgPresetId] ?? PAPERBACKGROUNDS.plain;
  
  function handleStart() {
    playClick();
    onStart();
  }
  
  function handleVideoError() {
    console.warn('[Standby] Video background failed, falling back to preset');
    setVideoError(true);
    setVideoReady(false);
  }

  function handleVideoReady() {
    setVideoReady(true);
  }
  
  // Get background style based on type
  function getBackgroundStyle() {
    if (bgType === 'video' && bgVideoBase64 && !videoError) {
      return {
        backgroundColor: '#000',
      };
    }
    if (bgType === 'image' && bgImageBase64) {
      return {
        backgroundImage: `url(${bgImageBase64})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    if (bgType === 'color') {
      return {
        backgroundColor: bgColor,
      };
    }
    if (bgType === 'gradient' && GRADIENT_PRESETS[bgGradientId]) {
      return {
        background: GRADIENT_PRESETS[bgGradientId],
      };
    }
    // Default to preset
    return {};
  }
  
  function getBackgroundClassName() {
    if (bgType === 'video' && bgVideoBase64 && !videoError) {
      return 'bg-black';
    }
    if (bgType === 'image' && bgImageBase64) {
      return 'bg-md-surface';
    }
    if (bgType === 'color' || bgType === 'gradient') {
      return 'bg-md-surface';
    }
    // Default to preset
    return background.className || 'bg-md-surface';
  }

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center select-none cursor-pointer active:scale-[0.99] page-content-enter ${getBackgroundClassName()}`}
      onClick={handleStart}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      style={{
        transition: 'transform 100ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        ...getBackgroundStyle(),
      }}
    >
      {/* Video background */}
      {bgType === 'video' && bgVideoBase64 && !videoError && (
        <>
          <video
            src={bgVideoBase64}
            preload="auto"
            autoPlay
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
            onError={handleVideoError}
            onCanPlay={handleVideoReady}
            onLoadedData={handleVideoReady}
          />
          {/* Loading fallback - black background while video loads */}
          {!videoReady && (
            <div className="absolute inset-0 bg-black" />
          )}
        </>
      )}
      
      <div className="relative flex flex-col items-center gap-6 p-6 text-center">
        {/* Logo / Icon */}
        {logoEnabled && (logoImageBase64 ? (
          <img 
            src={logoImageBase64} 
            alt="Logo" 
            className="object-contain rounded-3xl standby-icon-float animate-in fade-in slide-in-from-bottom-8 duration-700"
            style={{ width: `${112 * logoScale}px`, height: `${112 * logoScale}px` }}
          />
        ) : logoIconKey ? (
          <div 
            className="rounded-[28px] flex items-center justify-center bg-md-primary-container standby-icon-float animate-in fade-in slide-in-from-bottom-8 duration-700"
            style={{ width: `${112 * logoScale}px`, height: `${112 * logoScale}px` }}
          >
            <BrandingIcon iconKey={logoIconKey} size={52 * logoScale} />
          </div>
        ) : (
          <div 
            className="rounded-[28px] flex items-center justify-center bg-md-primary-container standby-icon-float animate-in fade-in slide-in-from-bottom-8 duration-700"
            style={{ width: `${112 * logoScale}px`, height: `${112 * logoScale}px` }}
          >
            <Camera size={52 * logoScale} className="text-md-on-primary-container" />
          </div>
        ))}

        {/* Title block */}
        {titleEnabled && (
          <div className="flex flex-col gap-2">
            <h1 
              className="font-normal tracking-tight text-md-on-surface standby-title-glow animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100"
              style={{ 
                fontSize: `${titleSize}px`,
                lineHeight: `${titleSize * 1.14}px`,
                fontFamily: titleFont,
              }}
            >
              {titleText}
            </h1>
            {subtitleEnabled && subtitleText && (
              <p 
                className="font-normal text-md-on-surface-variant animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
                style={{ 
                  fontSize: `${subtitleSize}px`,
                  fontFamily: subtitleFont,
                }}
              >
                {subtitleText}
              </p>
            )}
          </div>
        )}

        {/* Button - Always below title */}
        {buttonImageBase64 ? (
          <img 
            src={buttonImageBase64} 
            alt="Button" 
            className="object-contain animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
            style={{ 
              width: `${200 * buttonScale}px`,
              height: `${64 * buttonScale}px`,
              transform: `translateY(${buttonVerticalOffset}px)`,
            }}
          />
        ) : (
          <div
            className={`flex items-center justify-center min-h-[64px] px-10 bg-md-primary text-md-on-primary text-lg font-semibold tracking-wide shadow-lg hover:shadow-xl active:shadow-md active:scale-[0.97] ${BUTTON_ANIMATIONS[buttonAnimation] || BUTTON_ANIMATIONS.pulse} animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 ${BUTTON_SHAPES[buttonShape] || BUTTON_SHAPES.pill}`}
            style={{ 
              transition: 'box-shadow 150ms cubic-bezier(0.4, 0.0, 0.2, 1), transform 100ms cubic-bezier(0.4, 0.0, 0.2, 1)',
              transform: `scale(${buttonScale}) translateY(${buttonVerticalOffset}px)`,
            }}
          >
            {buttonText}
          </div>
        )}
      </div>

      {/* Branding footer */}
      <div className="absolute bottom-6 flex flex-col items-center gap-1 animate-in fade-in duration-700 delay-400">
        <p className="text-sm font-semibold text-md-on-surface-variant tracking-wider">MONO BOOTH PH</p>
        <p className="text-[10px] text-md-outline tracking-widest uppercase">NO PROOFS? SHOW 'EM THE RECEIPTS!</p>
        <p className="text-[10px] text-md-on-surface-variant">📍 Kabankalan City & Beyond</p>
      </div>
    </div>
  );
}
