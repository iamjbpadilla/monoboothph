import { ExternalLink, Camera, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';

const HEADLINES = [
  'Your photos are ready!',
  'Memories captured!',
  'Your moments await!',
  'Photos are here!',
  'Your session photos!',
  'Smiles saved!',
  'Your photobooth shots!',
  'Moments preserved!',
];

export default function Landing() {
  const [headline, setHeadline] = useState('');

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * HEADLINES.length);
    setHeadline(HEADLINES[randomIndex]);
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center select-none bg-white page-content-enter">
      <div className="flex flex-col items-center gap-8 p-6 text-center max-w-2xl">
        {/* Logo */}
        <img 
          src="/mono-booth-ph.svg" 
          alt="MONO BOOTH PH" 
          className="w-40 h-40 object-contain invert"
        />

        {/* Instructions */}
        <div className="space-y-4">
          <p className="text-4xl text-gray-900 font-semibold">
            {headline}
          </p>
          <p className="text-lg text-gray-600">
            Please enter your session ID or visit our Facebook page to view and download your photos
          </p>
        </div>

        {/* Facebook CTA */}
        <a
          href="https://facebook.com/monoboothph"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#1877F2] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#166FE5] transition text-lg portal-button"
        >
          <ExternalLink className="w-5 h-5" />
          Visit @monoboothph on Facebook
        </a>

        {/* Session ID input hint */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Camera className="w-4 h-4" />
          <p>Have a session ID? Add it to the URL: <code className="bg-gray-100 px-2 py-1 rounded">/download/YOUR_SESSION_ID</code></p>
        </div>
      </div>

      {/* Branding footer */}
      <div className="absolute bottom-6 flex flex-col items-center gap-1">
        <p className="text-sm font-semibold text-gray-900 tracking-wider">MONO BOOTH PH</p>
        <p className="text-[10px] text-gray-500 tracking-widest uppercase">No proof without @monoboothph</p>
        <p className="text-[10px] text-gray-400">📍 Kabankalan City & Beyond</p>
      </div>
    </div>
  );
}
