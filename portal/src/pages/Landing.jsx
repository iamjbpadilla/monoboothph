import { MessageCircle, ArrowRight, Zap } from 'lucide-react';

const WORKFLOW = [
  {
    step: "01",
    title: "Capture",
    description: "Tap the kiosk and snap your photo."
  },
  {
    step: "02",
    title: "Print",
    description: "Rip your instant, high-contrast monochrome receipt print."
  },
  {
    step: "03",
    title: "Share",
    description: "Scan the on-print QR code to download the vibrant, full-color digital original."
  },
];

const FEATURES = [
  {
    title: "Unlimited Physical Prints",
    description: "No caps, no limits. Continuous printing for the duration of your booking."
  },
  {
    title: "Dual-Output Experience",
    description: "Get a textured, black-and-white print in your hands, plus a full-color digital copy on your phone."
  },
  {
    title: "Zero-Lag Digital Portal",
    description: "Optimized asset delivery serves high-res files to guest smartphones in seconds."
  },
  {
    title: "Bespoke Branding",
    description: "Custom headers, footers, logos, or event monograms styled directly onto every receipt template."
  },
  {
    title: "Studio-Grade Execution",
    description: "Professional on-site operators, premium studio lighting, and a minimalist physical setup."
  },
];

const TECHNOLOGY = [
  {
    title: "The MONO Engine",
    description: "Powered by a 100% locally built, custom-engineered application running natively on our hardware."
  },
  {
    title: "Network Independent",
    description: "Built locally to ensure flawless field stability, lightning-fast processing speeds, and zero reliance on spotty venue Wi-Fi."
  },
];

const PACKAGES = [
  {
    name: "The Minimalist",
    duration: "2 Hours",
    price: "₱2,000",
    bestFor: "Intimate parties and small family gatherings."
  },
  {
    name: "The Signature",
    duration: "3 Hours",
    price: "₱3,000",
    bestFor: "Standard weddings, debuts, and milestones."
  },
  {
    name: "The Studio Pro",
    duration: "4 Hours",
    price: "₱4,000",
    bestFor: "High-volume corporate activations and public launches."
  },
  {
    name: "The All-Day",
    duration: "8 Hours",
    price: "₱6,500",
    bestFor: "Festivals, large conferences, and full-day coverage."
  },
];

export default function Landing() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <img 
          src="/mono-booth-ph.svg" 
          alt="MONO BOOTH PH" 
          className="w-20 h-20 object-contain invert mx-auto mb-10"
        />
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
          MONO BOOTH PH
        </h1>
        <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed mb-8 max-w-2xl mx-auto">
          No proof without @monoboothph. Show 'em the receipts.
        </p>
        <a
          href="https://m.me/monoboothph"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-gray-900 text-white px-10 py-5 font-bold hover:bg-gray-800 transition border-2 border-gray-900 shadow-lg hover:shadow-xl"
        >
          <MessageCircle className="w-5 h-5" />
          Book Your Event Now
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* The Workflow */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-10">The Workflow</h2>
        <div className="space-y-8">
          {WORKFLOW.map((item, index) => (
            <div key={index} className="flex gap-6 group">
              <span className="text-gray-300 font-mono text-lg w-16 flex-shrink-0 group-hover:text-gray-900 transition-colors">{item.step}</span>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-lg mb-1">{item.title}</p>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* Why MONO BOOTH PH */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-10">Why MONO BOOTH PH?</h2>
        <ul className="space-y-8">
          {FEATURES.map((feature, index) => (
            <li key={index} className="flex gap-6 group">
              <span className="text-gray-300 text-2xl group-hover:text-gray-900 transition-colors">•</span>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-lg mb-1">{feature.title}</p>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* Proprietary Technology */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-10">Proprietary Technology</h2>
        <ul className="space-y-8">
          {TECHNOLOGY.map((tech, index) => (
            <li key={index} className="flex gap-6 group">
              <span className="text-gray-300 text-2xl group-hover:text-gray-900 transition-colors">•</span>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-lg mb-1">{tech.title}</p>
                <p className="text-gray-600 leading-relaxed">{tech.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* Hourly Packages */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Hourly Packages</h2>
        <p className="text-gray-600 mb-10 text-lg leading-relaxed">
          All packages include unlimited physical prints, custom receipt branding, instant full-color digital downloads, live event gallery access, and professional operators.
        </p>
        
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="text-left py-4 px-4 font-bold text-gray-900">Package</th>
                <th className="text-left py-4 px-4 font-bold text-gray-900">Duration</th>
                <th className="text-left py-4 px-4 font-bold text-gray-900">Rate</th>
                <th className="text-left py-4 px-4 font-bold text-gray-900">Best For</th>
              </tr>
            </thead>
            <tbody>
              {PACKAGES.map((pkg, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-bold text-gray-900">{pkg.name}</td>
                  <td className="py-4 px-4 text-gray-600">{pkg.duration}</td>
                  <td className="py-4 px-4 text-gray-900 font-semibold">{pkg.price}</td>
                  <td className="py-4 px-4 text-gray-600">{pkg.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className="text-gray-600 mb-8">
          <span className="text-gray-400">•</span> <span className="font-bold text-gray-900">Extra Time:</span> ₱1,000 per additional hour.
        </p>

        <a
          href="https://m.me/monoboothph"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-gray-900 text-white px-10 py-5 font-bold hover:bg-gray-800 transition border-2 border-gray-900 shadow-lg hover:shadow-xl"
        >
          <MessageCircle className="w-5 h-5" />
          Book Your Package
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* Booking & Location */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-10">Booking & Location</h2>
        <ul className="space-y-6 mb-10">
          <li className="flex gap-6">
            <span className="text-gray-300 text-2xl">•</span>
            <div>
              <p className="font-bold text-gray-900 text-lg mb-1">Coverage</p>
              <p className="text-gray-600">Kabankalan City and beyond</p>
            </div>
          </li>
          <li className="flex gap-6">
            <span className="text-gray-300 text-2xl">•</span>
            <div>
              <p className="font-bold text-gray-900 text-lg mb-1">Inquiries</p>
              <p className="text-gray-600">DM via Messenger to check date availability and lock in your schedule.</p>
            </div>
          </li>
        </ul>
        
        <a
          href="https://m.me/monoboothph"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-gray-900 text-white px-10 py-5 font-bold hover:bg-gray-800 transition border-2 border-gray-900 shadow-lg hover:shadow-xl"
        >
          <MessageCircle className="w-5 h-5" />
          Check Availability
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-6 py-16 text-center border-t-2 border-gray-200">
        <p className="text-sm font-bold text-gray-900 tracking-wider mb-2">MONO BOOTH PH</p>
        <p className="text-xs text-gray-500 tracking-widest uppercase">No proof without @monoboothph</p>
      </div>
    </div>
  );
}
