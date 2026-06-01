import { MessageCircle, ArrowRight, Camera, Printer, Share2, Zap, Smartphone, Palette, Layout, Users, Cpu, Wifi, Clock, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

const WORKFLOW = [
  {
    step: "01",
    title: "Capture",
    description: "Tap the kiosk and snap your photo.",
    icon: <Camera className="w-5 h-5" />
  },
  {
    step: "02",
    title: "Print",
    description: "Rip your instant, high-contrast monochrome receipt print.",
    icon: <Printer className="w-5 h-5" />
  },
  {
    step: "03",
    title: "Share",
    description: "Scan the on-print QR code to download the vibrant, full-color digital original.",
    icon: <Share2 className="w-5 h-5" />
  },
];

const FEATURES = [
  {
    title: "Unlimited Physical Prints",
    description: "No caps, no limits. Continuous printing for the duration of your booking.",
    icon: <Printer className="w-5 h-5" />
  },
  {
    title: "Dual-Output Experience",
    description: "Get a textured, black-and-white print in your hands, plus a full-color digital copy on your phone.",
    icon: <Smartphone className="w-5 h-5" />
  },
  {
    title: "Zero-Lag Digital Portal",
    description: "Optimized asset delivery serves high-res files to guest smartphones in seconds.",
    icon: <Zap className="w-5 h-5" />
  },
  {
    title: "Bespoke Branding",
    description: "Custom headers, footers, logos, or event monograms styled directly onto every receipt template.",
    icon: <Palette className="w-5 h-5" />
  },
  {
    title: "Studio-Grade Execution",
    description: "Professional on-site operators, premium studio lighting, and a minimalist physical setup.",
    icon: <Users className="w-5 h-5" />
  },
];

const TECHNOLOGY = [
  {
    title: "The MONO Engine",
    description: "Powered by a 100% locally built, custom-engineered application running natively on our hardware.",
    icon: <Cpu className="w-5 h-5" />
  },
  {
    title: "Network Independent",
    description: "Built locally to ensure flawless field stability, lightning-fast processing speeds, and zero reliance on spotty venue Wi-Fi.",
    icon: <Wifi className="w-5 h-5" />
  },
];

const TEMPLATES = [
  {
    key: '1strip',
    label: 'Solo Star',
    shots: 1,
    description: 'Your moment, your spotlight',
    preview: () => (
      <div className="w-full bg-white border-2 border-gray-200 p-4">
        <div className="text-center mb-3">
          <p className="font-bold text-sm text-gray-900">MONO BOOTH PH</p>
          <p className="text-xs text-gray-600">Your Event Name</p>
        </div>
        <div className="border-t border-gray-300 mb-3" />
        <div className="w-full rounded border-2 border-gray-200" style={{ aspectRatio: '3/4', background: '#f3f4f6' }} />
        <div className="border-t border-gray-300 my-3" />
        <p className="text-xs text-gray-600 text-center">Jun 01, 2026 20:30</p>
        <div className="mt-3 text-xs text-gray-600">
          <div className="flex justify-between mb-1">
            <span>Good Vibes</span>
            <span>₱999.00</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span>₱999.00</span>
          </div>
        </div>
        <div className="mt-3 flex justify-center">
          <div className="w-full h-8 bg-gray-900" />
        </div>
        <p className="text-xs text-gray-600 text-center mt-3">No proof without @monoboothph</p>
      </div>
    ),
  },
  {
    key: '2strip',
    label: 'Double Take',
    shots: 2,
    description: 'Double the fun, double the memories',
    preview: () => (
      <div className="w-full bg-white border-2 border-gray-200 p-4">
        <div className="text-center mb-3">
          <p className="font-bold text-sm text-gray-900">MONO BOOTH PH</p>
          <p className="text-xs text-gray-600">Your Event Name</p>
        </div>
        <div className="border-t border-gray-300 mb-3" />
        <div className="w-full rounded border-2 border-gray-200 mb-1" style={{ aspectRatio: '4/3', background: '#f3f4f6' }} />
        <div className="w-full rounded border-2 border-gray-200" style={{ aspectRatio: '4/3', background: '#e5e7eb' }} />
        <div className="border-t border-gray-300 my-3" />
        <p className="text-xs text-gray-600 text-center">Jun 01, 2026 20:30</p>
        <div className="mt-3 text-xs text-gray-600">
          <div className="flex justify-between mb-1">
            <span>Bad Decisions</span>
            <span>₱0.00</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span>₱0.00</span>
          </div>
        </div>
        <div className="mt-3 flex justify-center">
          <div className="w-full h-8 bg-gray-900" />
        </div>
        <p className="text-xs text-gray-600 text-center mt-3">No proof without @monoboothph</p>
      </div>
    ),
  },
  {
    key: '3strip',
    label: 'Triple Threat',
    shots: 3,
    description: 'Three perfect poses in a row',
    preview: () => (
      <div className="w-full bg-white border-2 border-gray-200 p-4">
        <div className="text-center mb-3">
          <p className="font-bold text-sm text-gray-900">MONO BOOTH PH</p>
          <p className="text-xs text-gray-600">Your Event Name</p>
        </div>
        <div className="border-t border-gray-300 mb-3" />
        <div className="w-full rounded border-2 border-gray-200 mb-1" style={{ aspectRatio: '4/3', background: '#f3f4f6' }} />
        <div className="w-full rounded border-2 border-gray-200 mb-1" style={{ aspectRatio: '4/3', background: '#e5e7eb' }} />
        <div className="w-full rounded border-2 border-gray-200" style={{ aspectRatio: '4/3', background: '#d1d5db' }} />
        <div className="border-t border-gray-300 my-3" />
        <p className="text-xs text-gray-600 text-center">Jun 01, 2026 20:30</p>
        <div className="mt-3 text-xs text-gray-600">
          <div className="flex justify-between mb-1">
            <span>Y2K Energy</span>
            <span>₱500.00</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span>₱500.00</span>
          </div>
        </div>
        <div className="mt-3 flex justify-center">
          <div className="w-full h-8 bg-gray-900" />
        </div>
        <p className="text-xs text-gray-600 text-center mt-3">No proof without @monoboothph</p>
      </div>
    ),
  },
  {
    key: '4grid',
    label: 'Quad Squad',
    shots: 4,
    description: 'A collage of your best moments',
    preview: () => (
      <div className="w-full bg-white border-2 border-gray-200 p-4">
        <div className="text-center mb-3">
          <p className="font-bold text-sm text-gray-900">MONO BOOTH PH</p>
          <p className="text-xs text-gray-600">Your Event Name</p>
        </div>
        <div className="border-t border-gray-300 mb-3" />
        <div className="grid grid-cols-2 gap-1 mb-3">
          <div className="rounded border-2 border-gray-200" style={{ aspectRatio: '3/4', background: '#f3f4f6' }} />
          <div className="rounded border-2 border-gray-200" style={{ aspectRatio: '3/4', background: '#e5e7eb' }} />
          <div className="rounded border-2 border-gray-200" style={{ aspectRatio: '3/4', background: '#d1d5db' }} />
          <div className="rounded border-2 border-gray-200" style={{ aspectRatio: '3/4', background: '#9ca3af' }} />
        </div>
        <div className="border-t border-gray-300 my-3" />
        <p className="text-xs text-gray-600 text-center">Jun 01, 2026 20:30</p>
        <div className="mt-3 text-xs text-gray-600">
          <div className="flex justify-between mb-1">
            <span>Main Character Energy</span>
            <span>₱750.00</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span>₱750.00</span>
          </div>
        </div>
        <div className="mt-3 flex justify-center">
          <div className="w-full h-8 bg-gray-900" />
        </div>
        <p className="text-xs text-gray-600 text-center mt-3">No proof without @monoboothph</p>
      </div>
    ),
  },
  {
    key: '2x3-landscape',
    label: 'Wide Load',
    shots: 6,
    description: 'Six photos in landscape layout',
    preview: () => (
      <div className="w-full bg-white border-2 border-gray-200 p-4">
        <div className="text-center mb-3">
          <p className="font-bold text-sm text-gray-900">MONO BOOTH PH</p>
          <p className="text-xs text-gray-600">Your Event Name</p>
        </div>
        <div className="border-t border-gray-300 mb-3" />
        <div className="grid grid-cols-2 gap-1 mb-3">
          <div className="rounded border-2 border-gray-200" style={{ aspectRatio: '4/3', background: '#f3f4f6' }} />
          <div className="rounded border-2 border-gray-200" style={{ aspectRatio: '4/3', background: '#e5e7eb' }} />
          <div className="rounded border-2 border-gray-200" style={{ aspectRatio: '4/3', background: '#d1d5db' }} />
          <div className="rounded border-2 border-gray-200" style={{ aspectRatio: '4/3', background: '#9ca3af' }} />
          <div className="rounded border-2 border-gray-200" style={{ aspectRatio: '4/3', background: '#6b7280' }} />
          <div className="rounded border-2 border-gray-200" style={{ aspectRatio: '4/3', background: '#4b5563' }} />
        </div>
        <div className="border-t border-gray-300 my-3" />
        <p className="text-xs text-gray-600 text-center">Jun 01, 2026 20:30</p>
        <div className="mt-3 text-xs text-gray-600">
          <div className="flex justify-between mb-1">
            <span>Side Quest</span>
            <span>₱150.00</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span>₱150.00</span>
          </div>
        </div>
        <div className="mt-3 flex justify-center">
          <div className="w-full h-8 bg-gray-900" />
        </div>
        <p className="text-xs text-gray-600 text-center mt-3">No proof without @monoboothph</p>
      </div>
    ),
  },
  {
    key: '2x3-portrait',
    label: 'Tall Order',
    shots: 6,
    description: 'Six photos in portrait layout',
    preview: () => (
      <div className="w-full bg-white border-2 border-gray-200 p-4">
        <div className="text-center mb-3">
          <p className="font-bold text-sm text-gray-900">MONO BOOTH PH</p>
          <p className="text-xs text-gray-600">Your Event Name</p>
        </div>
        <div className="border-t border-gray-300 mb-3" />
        <div className="grid grid-cols-2 gap-1 mb-3">
          <div className="rounded border-2 border-gray-200" style={{ aspectRatio: '3/4', background: '#f3f4f6' }} />
          <div className="rounded border-2 border-gray-200" style={{ aspectRatio: '3/4', background: '#e5e7eb' }} />
          <div className="rounded border-2 border-gray-200" style={{ aspectRatio: '3/4', background: '#d1d5db' }} />
          <div className="rounded border-2 border-gray-200" style={{ aspectRatio: '3/4', background: '#9ca3af' }} />
          <div className="rounded border-2 border-gray-200" style={{ aspectRatio: '3/4', background: '#6b7280' }} />
          <div className="rounded border-2 border-gray-200" style={{ aspectRatio: '3/4', background: '#4b5563' }} />
        </div>
        <div className="border-t border-gray-300 my-3" />
        <p className="text-xs text-gray-600 text-center">Jun 01, 2026 20:30</p>
        <div className="mt-3 text-xs text-gray-600">
          <div className="flex justify-between mb-1">
            <span>Plot Armor</span>
            <span>₱1,000.00</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span>₱1,000.00</span>
          </div>
        </div>
        <div className="mt-3 flex justify-center">
          <div className="w-full h-8 bg-gray-900" />
        </div>
        <p className="text-xs text-gray-600 text-center mt-3">No proof without @monoboothph</p>
      </div>
    ),
  },
];

const PACKAGES = [
  {
    name: "The Minimalist",
    duration: "2 Hours",
    price: "₱2,000",
    bestFor: "Intimate parties and small family gatherings.",
    icon: <Clock className="w-6 h-6" />
  },
  {
    name: "The Signature",
    duration: "3 Hours",
    price: "₱3,000",
    bestFor: "Standard weddings, debuts, and milestones.",
    icon: <Layout className="w-6 h-6" />
  },
  {
    name: "The Studio Pro",
    duration: "4 Hours",
    price: "₱4,000",
    bestFor: "High-volume corporate activations and public launches.",
    icon: <Users className="w-6 h-6" />
  },
  {
    name: "The All-Day",
    duration: "8 Hours",
    price: "₱6,500",
    bestFor: "Festivals, large conferences, and full-day coverage.",
    icon: <Zap className="w-6 h-6" />
  },
];

export default function Landing() {
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center animate-fade-in">
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
          className="inline-flex items-center gap-3 bg-gray-900 text-white px-10 py-5 font-bold hover:bg-gray-800 transition border-2 border-gray-900 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <MessageCircle className="w-5 h-5" />
          Book Your Event Now
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* The Workflow */}
      <div id="workflow" data-animate className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-10">The Workflow</h2>
        <div className="space-y-6">
          {WORKFLOW.map((item, index) => (
            <div 
              key={index} 
              className={`flex gap-6 group items-start transition-all duration-700 ease-out ${
                isVisible['workflow'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4 w-20 flex-shrink-0">
                <span className="text-gray-300 font-mono text-lg group-hover:text-gray-900 transition-colors">{item.step}</span>
                <div className="w-10 h-10 border-2 border-gray-200 flex items-center justify-center group-hover:border-gray-900 transition-colors">
                  <span className="text-gray-400 group-hover:text-gray-900 transition-colors">{item.icon}</span>
                </div>
              </div>
              <div className="flex-1 pt-1">
                <p className="font-bold text-gray-900 text-lg mb-1">{item.title}</p>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* Why MONO BOOTH PH */}
      <div id="features" data-animate className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-10">Why MONO BOOTH PH?</h2>
        <ul className="space-y-6">
          {FEATURES.map((feature, index) => (
            <li 
              key={index} 
              className={`flex gap-6 group items-start transition-all duration-700 ease-out ${
                isVisible['features'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 border-2 border-gray-200 flex items-center justify-center flex-shrink-0 group-hover:border-gray-900 transition-colors">
                <span className="text-gray-400 group-hover:text-gray-900 transition-colors">{feature.icon}</span>
              </div>
              <div className="flex-1 pt-1">
                <p className="font-bold text-gray-900 text-lg mb-1">{feature.title}</p>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* Proprietary Technology */}
      <div id="technology" data-animate className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-10">Proprietary Technology</h2>
        <ul className="space-y-6">
          {TECHNOLOGY.map((tech, index) => (
            <li 
              key={index} 
              className={`flex gap-6 group items-start transition-all duration-700 ease-out ${
                isVisible['technology'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 border-2 border-gray-200 flex items-center justify-center flex-shrink-0 group-hover:border-gray-900 transition-colors">
                <span className="text-gray-400 group-hover:text-gray-900 transition-colors">{tech.icon}</span>
              </div>
              <div className="flex-1 pt-1">
                <p className="font-bold text-gray-900 text-lg mb-1">{tech.title}</p>
                <p className="text-gray-600 leading-relaxed">{tech.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* Print Templates */}
      <div id="templates" data-animate className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Print Templates</h2>
        <p className="text-gray-600 mb-12 text-lg leading-relaxed">
          Choose from our collection of print layouts for your event.
        </p>
        
        <div className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide">
          {TEMPLATES.map(({ key, label, shots, description, preview: Preview }, index) => (
            <div 
              key={key}
              className={`flex-shrink-0 snap-center transition-all duration-500 ease-out ${
                isVisible['templates'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ 
                transitionDelay: `${index * 100}ms`,
                width: '280px'
              }}
            >
              <div className="bg-white transition-all group relative">
                <Preview />
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-gray-900 text-lg">{label}</h3>
                  <p className="text-gray-600 text-sm">{description}</p>
                  <p className="text-gray-500 text-xs font-medium">{shots} photo{shots > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* Hourly Packages */}
      <div id="packages" data-animate className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Hourly Packages</h2>
        <p className="text-gray-600 mb-12 text-lg leading-relaxed">
          Every package includes unlimited snap, print & rip, customized header and footer for your brand/event, and full-color downloads via QR code.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {PACKAGES.map((pkg, index) => (
            <div 
              key={index} 
              className={`border-2 border-gray-200 p-8 hover:border-gray-900 transition-all duration-300 group transform hover:-translate-y-1 ${
                isVisible['packages'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 border-2 border-gray-200 flex items-center justify-center flex-shrink-0 group-hover:border-gray-900 transition-colors">
                  <span className="text-gray-400 group-hover:text-gray-900 transition-colors">{pkg.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-xl mb-1">{pkg.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{pkg.duration}</p>
                  <p className="text-3xl font-bold text-gray-900">{pkg.price}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{pkg.bestFor}</p>
              <a
                href="https://m.me/monoboothph"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 font-semibold hover:bg-gray-800 transition border-2 border-gray-900 text-sm transform hover:scale-105"
              >
                Book Now
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
        
        <p className="text-gray-600 mb-8">
          <span className="text-gray-400">•</span> <span className="font-bold text-gray-900">Extra Time:</span> ₱1,000 per additional hour.
        </p>
      </div>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* Backup Copy Notice */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="border-2 border-gray-200 p-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Missed Your Download?</h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            All photos are uploaded daily to our Facebook page. Visit us to get your backup copy.
          </p>
          <a
            href="https://facebook.com/monoboothph"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-gray-900 text-white px-10 py-5 font-bold hover:bg-gray-800 transition border-2 border-gray-900 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Visit Our Facebook Page
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* Booking & Location */}
      <div id="booking" data-animate className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-10">Booking & Location</h2>
        <ul className="space-y-6 mb-10">
          <li className={`flex gap-6 items-start transition-all duration-700 ease-out ${
            isVisible['booking'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="w-12 h-12 border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-gray-400"><Check className="w-5 h-5" /></span>
            </div>
            <div className="pt-1">
              <p className="font-bold text-gray-900 text-lg mb-1">Coverage</p>
              <p className="text-gray-600">Kabankalan City and beyond</p>
            </div>
          </li>
          <li className={`flex gap-6 items-start transition-all duration-700 ease-out ${
            isVisible['booking'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '100ms' }}>
            <div className="w-12 h-12 border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-gray-400"><MessageCircle className="w-5 h-5" /></span>
            </div>
            <div className="pt-1">
              <p className="font-bold text-gray-900 text-lg mb-1">Inquiries</p>
              <p className="text-gray-600">DM via Messenger to check date availability and lock in your schedule.</p>
            </div>
          </li>
        </ul>
        
        <a
          href="https://m.me/monoboothph"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-gray-900 text-white px-10 py-5 font-bold hover:bg-gray-800 transition border-2 border-gray-900 shadow-lg hover:shadow-xl transform hover:scale-105"
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
