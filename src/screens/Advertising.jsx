import { useEffect, useState, useRef } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';
import QRCode from 'qrcode';

let fullScreenIndex = 0; // round-robin across all ad screen appearances

const BACKGROUND_STYLES = {
  'solid-slate': 'bg-slate-600',
  'gradient-slate': 'bg-gradient-to-br from-slate-600 to-slate-700',
  'gradient-purple-pink': 'bg-gradient-to-br from-purple-600 to-pink-500',
  'gradient-blue-cyan': 'bg-gradient-to-br from-blue-600 to-cyan-500',
  'gradient-orange-red': 'bg-gradient-to-br from-orange-600 to-red-500',
  'gradient-green-teal': 'bg-gradient-to-br from-green-600 to-teal-500',
  'solid-purple': 'bg-purple-600',
  'solid-blue': 'bg-blue-600',
  'solid-dark': 'bg-gray-900',
};

export default function Advertising({ onComplete }) {
  const { settings } = useSettings();
  const adConfig = settings.general.advertising || {};
  const display = adConfig.display || {}
  const adDuration = settings.general.adDuration || 5;
  const useVideoLength = adDuration === 0;
  const [timeLeft, setTimeLeft] = useState(useVideoLength ? null : adDuration);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoDuration, setVideoDuration] = useState(null);
  const videoRef = useRef(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (useVideoLength && !videoDuration) return; // Wait for video duration if in video-length mode
    
    const duration = useVideoLength ? Math.ceil(videoDuration) : adDuration;
    setTimeLeft(duration);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [adDuration, onComplete, useVideoLength, videoDuration]);

  useEffect(() => {
    if (display.showQR && adConfig.facebookUrl) {
      QRCode.toDataURL(adConfig.facebookUrl, { width: 120, margin: 1 })
        .then(setQrCodeUrl)
        .catch(console.error);
    }
  }, [display.showQR, adConfig.facebookUrl]);

  // Media carousel auto-rotation
  useEffect(() => {
    if (!display.showCarousel || !adConfig.media || adConfig.media.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentMediaIndex(prev => (prev + 1) % adConfig.media.length);
    }, 4000); // Rotate every 4 seconds

    return () => clearInterval(interval);
  }, [display.showCarousel, adConfig.media]);

  const backgroundClass = BACKGROUND_STYLES[display.backgroundStyle] || BACKGROUND_STYLES['solid-slate'];
  const title = adConfig.title || 'MONO BOOTH PH';
  const subtitle = adConfig.subtitle || 'Capture Your Best Moments';
  const message = adConfig.message || 'Professional photobooth services for all your special occasions. Weddings, birthdays, corporate events, and more!';

  // ── Full Screen Image Mode ──
  const fsImages = adConfig.fullScreenImages || []
  const fsVideos = adConfig.fullScreenVideos || []
  
  // Prioritize video over image if both are enabled
  if (adConfig.showFullScreenVideo && fsVideos.length > 0 && !videoError) {
    const idx = fullScreenIndex % fsVideos.length;
    fullScreenIndex = (fullScreenIndex + 1) % fsVideos.length;
    
    return (
      <div className="w-full h-full relative bg-black page-content-enter">
        <video
          ref={videoRef}
          src={fsVideos[idx].value}
          preload="auto"
          autoPlay
          muted
          loop={false}
          playsInline
          controls={false}
          className={`w-full h-full object-cover transition-opacity duration-300 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
          onError={() => {
            console.warn('[Advertising] Video failed to load, falling back');
            setVideoError(true);
          }}
          onCanPlay={() => {
            setVideoReady(true);
            // Capture video duration
            if (videoRef.current && videoRef.current.duration) {
              setVideoDuration(videoRef.current.duration);
              console.log('[Advertising] Video duration:', videoRef.current.duration);
            }
            // Ensure video plays when ready
            if (videoRef.current) {
              videoRef.current.play().catch(err => console.warn('[Advertising] Auto-play failed:', err));
            }
          }}
          onLoadedData={() => setVideoReady(true)}
          onPlay={() => {
            console.log('[Advertising] Video started playing');
            completedRef.current = false;
          }}
          onEnded={() => {
            console.log('[Advertising] Video ended');
            if (useVideoLength && !completedRef.current) {
              completedRef.current = true;
              onComplete();
            }
          }}
        />
        {/* Loading fallback - black background while video loads */}
        {!videoReady && (
          <div className="absolute inset-0 bg-black z-10" />
        )}
        {/* Timer overlay - only show if not using video length */}
        {!useVideoLength && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm z-20">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-sm font-semibold text-white">{timeLeft}s</span>
          </div>
        )}
      </div>
    );
  }
  
  if (adConfig.showFullScreen && fsImages.length > 0) {
    const idx = fullScreenIndex % fsImages.length;
    fullScreenIndex = (fullScreenIndex + 1) % fsImages.length;
    const mode = adConfig.fullScreenImageMode || 'scale';
    const objFit = mode === 'fit' ? 'contain' : mode === 'stretch' ? 'fill' : 'cover';
    return (
      <div className="w-full h-full relative bg-black page-content-enter">
        <img
          src={fsImages[idx].value}
          alt=""
          className="w-full h-full"
          style={{ objectFit: objFit }}
        />
        {/* Timer overlay */}
        <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm z-10">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-sm font-semibold text-white">{timeLeft}s</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center ${backgroundClass} page-content-enter relative`}>
      {/* Timer display - only show if not using video length */}
      {!useVideoLength && (
        <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-sm font-semibold text-white">
            {timeLeft}s
          </span>
        </div>
      )}

      <div className="flex flex-col items-center gap-6 p-6 text-center max-w-md">
        {/* Logo/Icon - Material Design 8dp grid spacing */}
        <div className="flex flex-col items-center gap-4">
          {display.showLogo && settings.general.logoBase64 ? (
            <img 
              src={settings.general.logoBase64} 
              alt="Logo" 
              className="w-24 h-24 object-contain rounded-full bg-white/20 backdrop-blur-sm p-2"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          )}
          <h1 className="text-4xl font-bold text-white">{title}</h1>
          <p className="text-xl text-white/90 font-medium">{subtitle}</p>
        </div>

        {/* Media Carousel - 16dp spacing */}
        {display.showCarousel && adConfig.media && adConfig.media.length > 0 && (
          <div className="w-full max-w-xs">
            {adConfig.media[currentMediaIndex]?.type === 'image' ? (
              <img 
                src={adConfig.media[currentMediaIndex].url} 
                alt="Carousel" 
                className="w-full h-48 object-cover rounded-2xl bg-white/20 backdrop-blur-sm animate-in fade-in duration-500"
              />
            ) : adConfig.media[currentMediaIndex]?.type === 'video' ? (
              <video 
                src={adConfig.media[currentMediaIndex].url}
                preload="auto"
                autoPlay
                muted
                loop
                playsInline
                controls={false}
                className="w-full h-48 object-cover rounded-2xl bg-white/20 backdrop-blur-sm animate-in fade-in duration-500"
              />
            ) : null}
            {adConfig.media.length > 1 && (
              <div className="flex justify-center gap-1 mt-2">
                {adConfig.media.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentMediaIndex ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Event Promotion - 16dp spacing */}
        {adConfig.eventPromotion && (
          <div className="px-4 py-2 rounded-full bg-white/30 backdrop-blur-sm">
            <p className="text-sm font-semibold text-white">{adConfig.eventPromotion}</p>
          </div>
        )}

        {/* Marketing message - 16dp spacing */}
        <div>
          <p className="text-lg text-white/95 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Social media links - 16dp spacing */}
        {display.showSocial && (
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {adConfig.facebookUrl && (
              <a
                href={adConfig.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-base font-semibold text-white">Facebook</span>
              </a>
            )}
            {adConfig.instagramUrl && (
              <a
                href={adConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="text-base font-semibold text-white">Instagram</span>
              </a>
            )}
            {adConfig.tiktokUrl && (
              <a
                href={adConfig.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <span className="text-base font-semibold text-white">TikTok</span>
              </a>
            )}
          </div>
        )}

        {/* Contact Info - 16dp spacing */}
        {display.showContact && (adConfig.phone || adConfig.email) && (
          <div className="space-y-2">
            {adConfig.phone && (
              <a
                href={`tel:${adConfig.phone}`}
                className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm">{adConfig.phone}</span>
              </a>
            )}
            {adConfig.email && (
              <a
                href={`mailto:${adConfig.email}`}
                className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">{adConfig.email}</span>
              </a>
            )}
          </div>
        )}

        {/* QR Code - 16dp spacing */}
        {display.showQR && qrCodeUrl && (
          <div>
            <div className="inline-block p-3 bg-white rounded-lg">
              <img src={qrCodeUrl} alt="QR Code" className="w-30 h-30" />
            </div>
            <p className="text-xs text-white/70 mt-2">Scan to visit</p>
          </div>
        )}

        {/* Tagline - 24dp spacing */}
        <div className="flex flex-col gap-1">
          <p className="text-sm text-white/70 tracking-widest uppercase">NO PROOFS? SHOW 'EM THE RECEIPTS!</p>
          <p className="text-sm text-white/70">📍 Kabankalan City & Beyond</p>
        </div>
      </div>
    </div>
  );
}
