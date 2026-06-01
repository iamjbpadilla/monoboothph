import { MessageCircle, Zap, Smartphone, Palette, Layout, Users, Check } from 'lucide-react';
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

const PACKAGES = [
  {
    name: "The Minimalist",
    duration: "2 Hours",
    price: "₱2,000",
    description: "Intimate celebrations, basic template branding"
  },
  {
    name: "The Signature",
    duration: "3 Hours",
    price: "₱3,000",
    description: "Standard weddings, full digital gallery"
  },
  {
    name: "The Studio Pro",
    duration: "4 Hours",
    price: "₱4,000",
    description: "High-volume corporate activations, custom layouts"
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
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <img 
            src="/mono-booth-ph.svg" 
            alt="MONO BOOTH PH" 
            className="w-32 h-32 object-contain invert mx-auto mb-8"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            No proof without @monoboothph — show 'em the receipts! 🧾✨
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            TAP. POSE. RIP. SHARE. — A completely custom, locally built photobooth experience.
          </p>
          <a
            href="https://m.me/monoboothph"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#1877F2] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#166FE5] transition text-lg shadow-lg hover:shadow-xl"
          >
            <MessageCircle className="w-5 h-5" />
            Book via Messenger
          </a>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose MONO BOOTH PH?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Pricing Packages</h2>
          <p className="text-gray-600 text-center mb-12">Private Events & Celebrations (Hourly Packages)</p>
          <div className="grid md:grid-cols-3 gap-6">
            {PACKAGES.map((pkg, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                <p className="text-purple-600 font-semibold mb-1">{pkg.duration}</p>
                <p className="text-3xl font-bold text-gray-900 mb-4">{pkg.price}</p>
                <p className="text-gray-600 text-sm mb-6">{pkg.description}</p>
                <a
                  href="https://m.me/monoboothph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  Book Now
                </a>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 mt-6">+₱1,000 for additional hours</p>
        </div>
      </div>

      {/* Inclusions Section */}
      <div className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What Every Package Includes</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {INCLUSIONS.map((inclusion, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700">{inclusion}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 bg-gradient-to-br from-purple-600 to-purple-700">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Capture Your Memories?</h2>
          <p className="text-purple-100 mb-8">Book your event today and let us make it unforgettable.</p>
          <a
            href="https://m.me/monoboothph"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition text-lg shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            Book via Messenger
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 px-4 bg-gray-900 text-center">
        <p className="text-white font-semibold tracking-wider mb-2">MONO BOOTH PH</p>
        <p className="text-gray-400 text-sm">📍 Kabankalan City & Beyond | 📩 DM to book</p>
      </div>
    </div>
  );
}
