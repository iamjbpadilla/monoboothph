import { MessageCircle, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import useInView from '../hooks/useInView';

const PACKAGES = [
  {
    name: "The Minimalist",
    duration: "2 Hours",
  },
  {
    name: "The Signature",
    duration: "3 Hours",
  },
  {
    name: "The Studio Pro",
    duration: "4 Hours",
  },
  {
    name: "The All-Day",
    duration: "8 Hours",
  },
];

const INCLUSIONS = [
  "Unlimited Physical Prints",
  "Dual-Output Experience",
  "Zero-Lag Digital Portal",
  "Bespoke Branding",
  "Studio-Grade Execution",
];

function RevealSection({ children, className = '' }) {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={`reveal ${isInView ? 'visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* Module A: Hero Header */}
      <RevealSection>
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <img
            src="/mono-booth-ph.svg"
            alt="MONO BOOTH PH"
            className="w-20 h-20 object-contain invert mx-auto mb-10"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            MONO BOOTH PH
          </h1>
          <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed mb-0 max-w-2xl mx-auto">
            No proof without @monoboothph.
          </p>
          <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed mb-6 max-w-2xl mx-auto">
            Show 'em the receipts.
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
          <Link
            to="/timeline"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition underline underline-offset-2"
          >
            See how we're building it
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </RevealSection>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* Module B: Service Packages */}
      <RevealSection>
        <div className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Service Packages</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {PACKAGES.map((pkg, index) => (
              <div
                key={index}
                className="border-2 border-gray-200 p-8 hover:border-gray-900 transition-all duration-300 group transform hover:-translate-y-1"
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <h3 className="font-bold text-gray-900 text-xl mb-2">{pkg.name}</h3>
                <p className="text-gray-600 text-sm">{pkg.duration}</p>
              </div>
            ))}
          </div>

          {/* Feature Highlights */}
          <div className="max-w-2xl mx-auto">
            <p className="text-xs text-gray-500 font-semibold mb-4 uppercase tracking-wider text-center">What you get</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {INCLUSIONS.map((item, index) => (
                <div key={index} className="flex items-center justify-center gap-2 text-gray-800">
                  <Check className="w-4 h-4 text-gray-900 shrink-0" strokeWidth={2.5} />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>

      {/* Footer */}
      <RevealSection>
        <div className="max-w-4xl mx-auto px-6 py-16 text-center border-t-2 border-gray-200">
          <p className="text-sm font-bold text-gray-900 tracking-wider mb-2">MONO BOOTH PH</p>
          <p className="text-xs text-gray-600 tracking-widest uppercase mb-4">No proof without @monoboothph</p>
          <Link
            to="/timeline"
            className="text-xs text-gray-500 hover:text-gray-900 transition underline underline-offset-2"
          >
            Project Timeline
          </Link>
        </div>
      </RevealSection>
    </div>
  );
}
