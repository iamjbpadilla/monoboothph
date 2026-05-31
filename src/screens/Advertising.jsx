import { useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';

export default function Advertising({ onComplete }) {
  const { settings } = useSettings();
  const isDark = settings.general.theme === 'dark';
  const adDuration = settings.general.adDuration || 5;
  const [timeLeft, setTimeLeft] = useState(adDuration);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [adDuration, onComplete]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500 page-content-enter relative">
      {/* Timer display */}
      <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <span className="text-sm font-semibold text-white">
          {timeLeft}s
        </span>
      </div>

      <div className="text-center px-8 max-w-md">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">MONO STUDIO PH</h1>
          <p className="text-xl text-white/90 font-medium">Capture Your Best Moments</p>
        </div>

        {/* Marketing message */}
        <div className="mb-8">
          <p className="text-lg text-white/95 leading-relaxed">
            Professional photobooth services for all your special occasions. 
            Weddings, birthdays, corporate events, and more!
          </p>
        </div>

        {/* Social media link */}
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span className="text-base font-semibold text-white">facebook.com/monoboothph</span>
        </div>

        {/* Tagline */}
        <div className="mt-8">
          <p className="text-sm text-white/70 tracking-widest uppercase">No proof without @monoboothph</p>
          <p className="text-sm text-white/70 mt-1">📍 Kabankalan City & Beyond</p>
        </div>
      </div>
    </div>
  );
}
