import { MessageCircle, ArrowRight } from 'lucide-react';

const PACKAGES = [
  {
    name: "The Minimalist",
    duration: "2 Hours",
    price: "₱2,000",
  },
  {
    name: "The Signature",
    duration: "3 Hours",
    price: "₱3,000",
  },
  {
    name: "The Studio Pro",
    duration: "4 Hours",
    price: "₱4,000",
  },
  {
    name: "The All-Day",
    duration: "8 Hours",
    price: "₱6,500",
  },
];

const INCLUSIONS = [
  "Unlimited Physical Prints",
  "Dual-Output Experience",
  "Zero-Lag Digital Portal",
  "Bespoke Branding",
  "Studio-Grade Execution",
];

export default function Landing() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* Module A: Hero Header */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <img 
          src="/mono-booth-ph.svg" 
          alt="MONO BOOTH PH" 
          className="w-20 h-20 object-contain invert mx-auto mb-10"
        />
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
          MONO BOOTH PH
        </h1>
        <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed mb-2 max-w-2xl mx-auto">
          No proof without @monoboothph.
        </p>
        <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed mb-8 max-w-2xl mx-auto">
          Show 'em the receipts.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto">
          Powered by our custom, locally-engineered digital camera architecture.
        </p>
        <a
          href="https://m.me/monoboothph"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-gray-900 text-white px-10 py-5 font-bold hover:bg-gray-800 transition border-2 border-gray-900 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <MessageCircle className="w-5 h-5" />
          Book via Messenger
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* Module B: Hourly Rate Matrix */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Hourly Rates</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {PACKAGES.map((pkg, index) => (
            <div 
              key={index}
              className="border-2 border-gray-200 p-8 hover:border-gray-900 transition-all duration-300 group transform hover:-translate-y-1"
            >
              <h3 className="font-bold text-gray-900 text-xl mb-2">{pkg.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{pkg.duration}</p>
              <p className="text-3xl font-bold text-gray-900">{pkg.price}</p>
            </div>
          ))}
        </div>

        <div className="border-2 border-gray-200 p-8">
          <h3 className="font-bold text-gray-900 text-lg mb-6">Package Inclusions</h3>
          <div className="flex flex-wrap gap-3">
            {INCLUSIONS.map((inclusion, index) => (
              <span key={index} className="border-2 border-gray-200 bg-white px-4 py-2 rounded-lg text-gray-700 text-sm">
                {inclusion}
              </span>
            ))}
          </div>
        </div>
      </div>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* Module C: Proprietary Technology Callout */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="border-2 border-gray-900 p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">THE MONO ENGINE</h2>
          <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
            100% locally built. Completely network independent. Our custom-engineered kiosk framework guarantees flawless field stability, lightning-fast processing, and zero reliance on spotty venue Wi-Fi.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-6 py-16 text-center border-t-2 border-gray-200">
        <p className="text-sm font-bold text-gray-900 tracking-wider mb-2">MONO BOOTH PH</p>
        <p className="text-xs text-gray-600 tracking-widest uppercase">No proof without @monoboothph</p>
      </div>
    </div>
  );
}
