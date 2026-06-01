import { MessageCircle, Zap, Smartphone, Palette, Layout, Users, Check, ArrowRight, Sparkles, Camera, Share2 } from 'lucide-react';
import { useState } from 'react';

const FEATURES = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "TAP. POSE. RIP. SHARE.",
    description: "Lightning-fast photo capture with our custom tablet kiosk application engineered for flawless stability."
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: "Vibrant Color Memories",
    description: "Textured physical receipt keepsake + immediate access to stunning full-color digital downloads."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Zero-Lag Digital Portal",
    description: "Quick QR code scans deliver high-fidelity photos to guest smartphones in seconds."
  },
  {
    icon: <Palette className="w-6 h-6" />,
    title: "High-Contrast Aesthetics",
    description: "Modern monochrome thermal prints with a minimalist, standout look."
  },
  {
    icon: <Layout className="w-6 h-6" />,
    title: "Fully Branded Templates",
    description: "Custom headers, footers, monograms, logos printed on every receipt."
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Professional On-Site Crew",
    description: "Premium studio lighting, sleek setup, and seamless queue management."
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: <Camera className="w-8 h-8" />,
    title: "Capture",
    description: "Guests tap, pose, and snap photos at our custom kiosk"
  },
  {
    step: "02",
    icon: <Share2 className="w-8 h-8" />,
    title: "Print & Share",
    description: "Instant thermal receipt + QR code for digital download"
  },
  {
    step: "03",
    icon: <Sparkles className="w-8 h-8" />,
    title: "Memories",
    description: "Physical keepsake and digital gallery access"
  },
];

const PACKAGES = [
  {
    name: "The Minimalist",
    duration: "2 Hours",
    price: "₱2,000",
    description: "Intimate celebrations, basic template branding",
    popular: false
  },
  {
    name: "The Signature",
    duration: "3 Hours",
    price: "₱3,000",
    description: "Standard weddings, full digital gallery",
    popular: true
  },
  {
    name: "The Studio Pro",
    duration: "4 Hours",
    price: "₱4,000",
    description: "High-volume corporate activations, custom layouts",
    popular: false
  },
  {
    name: "The All-Day",
    duration: "8 Hours",
    price: "₱6,500",
    description: "Full-day events, maximum coverage",
    popular: false
  },
];

const INCLUSIONS = [
  "Unlimited Physical Prints",
  "Custom Receipt Branding",
  "Instant Full-Color Digital Downloads",
  "Live Event Gallery Access",
  "Professional On-Site Operators",
];

export default function Landing() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 py-24 px-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTItMiAyLTQgMi00IDQgMiA0IDItMiAyLTQgMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-white/90 text-sm font-medium">Receipt to Memories</span>
          </div>
          <img 
            src="/mono-booth-ph.svg" 
            alt="MONO BOOTH PH" 
            className="w-24 h-24 object-contain invert mx-auto mb-8"
          />
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            No proof without @monoboothph
            <br />
            <span className="text-purple-200">— show 'em the receipts! 🧾✨</span>
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
            TAP. POSE. RIP. SHARE. — A completely custom, locally built photobooth experience engineered for lightning-fast capture and flawless stability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://m.me/monoboothph"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition text-lg shadow-xl hover:shadow-2xl"
            >
              <MessageCircle className="w-5 h-5" />
              Book via Messenger
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition text-lg border border-white/20"
            >
              View Pricing
            </a>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to unforgettable memories</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, index) => (
              <div key={index} className="relative group">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="text-6xl font-bold text-purple-200 mb-4">{step.step}</div>
                  <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-purple-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose MONO BOOTH PH?</h2>
            <p className="text-xl text-gray-600">Premium features that set us apart</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Pricing Packages</h2>
            <p className="text-xl text-gray-600">Private Events & Celebrations (Hourly Packages)</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PACKAGES.map((pkg, index) => (
              <div key={index} className={`relative rounded-2xl p-8 border-2 transition-all duration-300 hover:-translate-y-1 ${
                pkg.popular 
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-600 border-purple-600 shadow-2xl' 
                  : 'bg-white border-gray-200 hover:shadow-xl'
              }`}>
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-xl font-bold mb-2 ${pkg.popular ? 'text-white' : 'text-gray-900'}`}>{pkg.name}</h3>
                <p className={pkg.popular ? 'text-purple-200 font-semibold mb-1' : 'text-purple-600 font-semibold mb-1'}>{pkg.duration}</p>
                <p className={`text-4xl font-bold mb-4 ${pkg.popular ? 'text-white' : 'text-gray-900'}`}>{pkg.price}</p>
                <p className={`text-sm mb-6 ${pkg.popular ? 'text-purple-100' : 'text-gray-600'}`}>{pkg.description}</p>
                <a
                  href="https://m.me/monoboothph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full text-center py-3 rounded-xl font-semibold transition ${
                    pkg.popular 
                      ? 'bg-white text-purple-600 hover:bg-gray-100' 
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  Book Now
                </a>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 mt-8 text-lg">+₱1,000 for additional hours</p>
        </div>
      </div>

      {/* Inclusions Section */}
      <div className="py-24 px-4 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Every Package Includes</h2>
            <p className="text-xl text-gray-600">Everything you need for a perfect event</p>
          </div>
          <div className="bg-white rounded-3xl p-12 shadow-xl">
            <div className="grid md:grid-cols-2 gap-6">
              {INCLUSIONS.map((inclusion, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-purple-50 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium text-lg">{inclusion}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-4 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTItMiAyLTQgMi00IDQgMiA0IDItMiAyLTQgMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Capture Your Memories?</h2>
          <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">Book your event today and let us make it unforgettable with our premium photobooth experience.</p>
          <a
            href="https://m.me/monoboothph"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-purple-600 px-10 py-5 rounded-full font-semibold hover:bg-gray-100 transition text-xl shadow-2xl hover:shadow-3xl"
          >
            <MessageCircle className="w-6 h-6" />
            Book via Messenger
            <ArrowRight className="w-6 h-6" />
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="py-12 px-4 bg-gray-900 text-center">
        <div className="max-w-4xl mx-auto">
          <img 
            src="/mono-booth-ph.svg" 
            alt="MONO BOOTH PH" 
            className="w-16 h-16 object-contain invert mx-auto mb-6"
          />
          <p className="text-white font-bold text-xl tracking-wider mb-3">MONO BOOTH PH</p>
          <p className="text-gray-400 text-lg mb-2">📍 Kabankalan City & Beyond</p>
          <p className="text-gray-400 text-lg">📩 DM to book</p>
          <p className="text-gray-500 text-sm mt-6">No proof without @monoboothph</p>
        </div>
      </div>
    </div>
  );
}
