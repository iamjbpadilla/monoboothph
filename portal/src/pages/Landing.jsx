import { useEffect, useState } from 'react';
import {
  MessageCircle, ArrowRight, ArrowLeft, Camera, Printer,
  Download, Palette, LayoutGrid, QrCode, ChevronDown, Touchpad,
  Heart, Cake, Sparkles, Briefcase, GraduationCap, Users, HandHeart, CalendarHeart,
  Coffee, UtensilsCrossed, Hotel, Megaphone, Zap, Store, Building2, ShoppingBag, Rocket,
} from 'lucide-react';
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

function StepCard({ index, icon, number, title, description }) {
  const { ref, isInView } = useInView({ threshold: 0.2 });
  return (
    <div
      ref={ref}
      className={`border-2 border-gray-200 rounded-lg p-6 flex flex-col items-center text-center transition-all duration-700 ease-out ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mb-4">
        {icon}
      </div>
      <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold mb-3">
        {number}
      </div>
      <h3 className="font-bold text-black mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

const ITEM_NAMES = ['Good Vibes', 'Bad Decisions', 'Y2K Energy', 'Main Character', 'Plot Twist', 'CEO of Fun', 'No Cap', 'Zero Chill', 'Vibe Check', 'Slay', 'Receipts', 'Best Day Ever', 'Glow Up', 'Rizz', 'Small Talk', 'Photo Finish', 'Frame It', 'Strike A Pose', 'Memory Lane', 'Laugh Track'];
const PRICES = [0, 100, 500, 777, 999, 1000];
const TITLES = ['Good Vibes Co.', 'Main Character Inc.', 'Best Day Ever', 'Receipts Only', 'Zero Chill Lounge', 'Plot Twist Events', 'The Vibe Check', 'Memory Makers', 'Laugh Track Studio', 'Photo Finish', 'Glow Up Booth', 'Strike A Pose'];
const SUBTITLES = ["Show 'em the receipts!", 'No proof without receipts', 'The Wedding', 'The Birthday', 'Best Moments', 'Captured', 'Forever Young', 'Big Day', 'Official Receipt', 'Certified Fun', 'One for the books', 'Making memories', 'Picture perfect', 'The main event', 'Cheers to us'];
const FOOTERS = ['Thank you for the memories!', 'See you next time!', 'Best day ever!', 'Making memories since 2025', 'Keep the receipt!', 'Good vibes only', 'Until next time!', 'Thanks for stopping by!', 'Smile always!', 'Moments over everything'];
const CUSTOM_TEXTS = ['Good Vibes Only', 'Best Day Ever', 'No Cap', 'Main Character Energy', 'Zero Chill', 'Plot Twist', 'Receipts Only', 'One for the books', 'Picture perfect', 'Certified fun', 'Glow up season', 'Strike a pose'];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateItems() {
  const count = Math.floor(Math.random() * 3) + 1;
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push({ name: pick(ITEM_NAMES), price: pick(PRICES) });
  }
  return items;
}

function generateState() {
  return {
    showDate: Math.random() > 0.3,
    showDividerBefore: Math.random() > 0.3,
    showDividerAfter: Math.random() > 0.3,
    showCustomText: Math.random() > 0.4,
    showItems: Math.random() > 0.3,
    showFooter: Math.random() > 0.3,
    title: pick(TITLES),
    subtitle: pick(SUBTITLES),
    footerText: pick(FOOTERS),
    customText: pick(CUSTOM_TEXTS),
    items: generateItems(),
  };
}

function AnimatedBlock({ show, children, maxH = 'max-h-10' }) {
  return (
    <div
      className={`overflow-hidden transition-all duration-1000 ease-out ${show ? `${maxH} opacity-100 mt-0` : 'max-h-0 opacity-0 mt-0'}`}
    >
      {children}
    </div>
  );
}

function PrintLayoutCard({ index, name, shots, children }) {
  const { ref, isInView } = useInView({ threshold: 0.15 });
  const [cardState, setCardState] = useState(generateState);

  useEffect(() => {
    if (!isInView) return;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setCardState(generateState());
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [isInView]);

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center mb-4 transition-all duration-700 ease-out ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="break-inside-avoid">
        <div className="w-full bg-white border-2 border-gray-200 rounded-lg p-3 flex flex-col text-center text-black overflow-hidden transition-all duration-700 ease-out">
        <AnimatedBlock show={cardState.showDate}>
          <p className="text-xs text-black/50">JUN 03, 2026  14:30</p>
        </AnimatedBlock>
        <p className="text-sm font-bold leading-tight transition-opacity duration-1000">{cardState.title}</p>
        <p className="text-xs text-black mb-1 transition-opacity duration-1000">{cardState.subtitle}</p>
        <AnimatedBlock show={cardState.showDividerBefore}>
          <div className="w-full border-t-2 border-dashed border-black my-1.5" />
        </AnimatedBlock>
        {children}
        <AnimatedBlock show={cardState.showDividerAfter}>
          <div className="w-full border-t-2 border-dashed border-black my-1.5" />
        </AnimatedBlock>
        <AnimatedBlock show={cardState.showCustomText} maxH="max-h-8">
          <p className="text-xs text-black font-medium tracking-wide">{cardState.customText}</p>
        </AnimatedBlock>
        <AnimatedBlock show={cardState.showItems} maxH="max-h-32">
          <div className="text-xs text-black space-y-0.5 text-left px-1">
            {cardState.items.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span>{item.name}</span>
                <span>{item.price}</span>
              </div>
            ))}
          </div>
        </AnimatedBlock>
        <AnimatedBlock show={cardState.showFooter}>
          <p className="text-xs text-black mt-1">{cardState.footerText}</p>
        </AnimatedBlock>
        </div>
        <p className="text-xs font-semibold text-black mt-2">{name}</p>
        <p className="text-xs text-black">{shots}</p>
      </div>
    </div>
  );
}

function FeatureGrid() {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const features = [
    { icon: <Printer className="w-6 h-6 text-black mb-2" strokeWidth={2} />, title: 'Unlimited Prints', desc: 'Print as many as you want' },
    { icon: <Download className="w-6 h-6 text-black mb-2" strokeWidth={2} />, title: 'Instant Digital', desc: 'Download via QR code' },
    { icon: <Palette className="w-6 h-6 text-black mb-2" strokeWidth={2} />, title: 'Custom Branding', desc: 'Your logo, your colors' },
    { icon: <LayoutGrid className="w-6 h-6 text-black mb-2" strokeWidth={2} />, title: '6 Layouts', desc: 'Pick your style' },
    { icon: <Camera className="w-6 h-6 text-black mb-2" strokeWidth={2} />, title: 'Live Preview', desc: 'See before you shoot' },
    { icon: <QrCode className="w-6 h-6 text-black mb-2" strokeWidth={2} />, title: 'QR Access', desc: 'Scan to download' },
  ];
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-black mb-6 text-center">The Full Receipt</h2>
      <div ref={ref} className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {features.map((f, i) => (
          <div
            key={i}
            className={`flex flex-col items-center text-center p-4 border-2 border-gray-100 rounded-lg transition-all duration-700 ease-out ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            {f.icon}
            <p className="text-sm font-semibold text-black">{f.title}</p>
            <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryGrid() {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const items = [
    'Booth Setup', 'Event Moment', 'Group Shot',
    'Printed Strips', 'Setup Detail', 'Fun Moment',
  ];
  return (
    <div ref={ref} className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-6 px-6">
      <div className="flex gap-4 w-max">
        {items.map((label, i) => (
          <div
            key={i}
            className={`w-72 flex-shrink-0 transition-all duration-700 ease-out ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <div className="w-full bg-gray-200 rounded aspect-[16/10]" />
            <p className="text-xs text-black mt-2 text-center">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PackageCard({ index, pkg }) {
  const { ref, isInView } = useInView({ threshold: 0.2 });
  return (
    <div
      ref={ref}
      className={`border-2 border-gray-200 p-8 hover:border-black transition-all duration-300 group transform hover:-translate-y-1 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <h3 className="font-bold text-black text-xl mb-2">{pkg.name}</h3>
      <p className="text-gray-500 text-sm">{pkg.duration}</p>
    </div>
  );
}

function StickyBookButton() {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  return (
    <>
      <div ref={ref} className="absolute top-[60vh] left-0 w-px h-px" />
      <a
        href="https://m.me/monoboothph?text=Hi!%20I%27m%20interested%20in%20booking%20MONO%20BOOTH%20PH%20for%20an%20event.%20Can%20you%20share%20the%20packages%20and%20availability%3F"
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 bg-black text-white px-5 py-3 font-bold text-sm shadow-xl hover:opacity-90 transition-all duration-500 border-2 border-black ${
          isInView ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
      >
        <MessageCircle className="w-4 h-4" />
        Book Now
      </a>
    </>
  );
}

function EventTypePills() {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const events = [
    { label: 'Weddings', icon: <Heart className="w-3.5 h-3.5" /> },
    { label: 'Birthdays', icon: <Cake className="w-3.5 h-3.5" /> },
    { label: 'Debuts', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { label: 'School Events', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { label: 'Reunions', icon: <Users className="w-3.5 h-3.5" /> },
    { label: 'Fundraisers', icon: <HandHeart className="w-3.5 h-3.5" /> },
    { label: 'Graduations', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { label: 'Anniversaries', icon: <CalendarHeart className="w-3.5 h-3.5" /> },
  ];
  const businesses = [
    { label: 'Cafes', icon: <Coffee className="w-3.5 h-3.5" /> },
    { label: 'Restaurants', icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
    { label: 'Hotels', icon: <Hotel className="w-3.5 h-3.5" /> },
    { label: 'Marketing', icon: <Megaphone className="w-3.5 h-3.5" /> },
    { label: 'Brand Activations', icon: <Zap className="w-3.5 h-3.5" /> },
    { label: 'Pop-up Stores', icon: <Store className="w-3.5 h-3.5" /> },
    { label: 'Offices', icon: <Building2 className="w-3.5 h-3.5" /> },
    { label: 'Malls', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { label: 'Product Launches', icon: <Rocket className="w-3.5 h-3.5" /> },
    { label: 'Team Buildings', icon: <Users className="w-3.5 h-3.5" /> },
  ];

  const renderPills = (items, baseDelay) =>
    items.map((tag, i) => (
      <span
        key={tag.label}
        className={`inline-flex items-center gap-1.5 bg-gray-100 text-black rounded-full px-4 py-1.5 text-sm font-medium cursor-default transition-all duration-300 ease-out hover:bg-gray-200 hover:scale-105 hover:shadow-sm ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: `${(baseDelay + i) * 40}ms` }}
      >
        {tag.icon}
        {tag.label}
      </span>
    ));

  return (
    <RevealSection>
      <div ref={ref} className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-black mb-8">For Every Moment & Every Brand</h2>
        <p className="text-black mb-4 text-sm font-medium uppercase tracking-wider">Events</p>
        <div className="flex flex-wrap gap-2 mb-8">
          {renderPills(events, 0)}
        </div>
        <p className="text-black mb-4 text-sm font-medium uppercase tracking-wider">Businesses & Campaigns</p>
        <div className="flex flex-wrap gap-2">
          {renderPills(businesses, events.length)}
        </div>
      </div>
    </RevealSection>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="font-semibold text-black text-sm">{question}</span>
        <ChevronDown className={`w-4 h-4 text-black transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-out ${open ? 'max-h-40 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
        <p className="text-sm text-black leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function Landing() {
  useEffect(() => {
    const block = (e) => e.preventDefault();
    document.addEventListener('contextmenu', block);
    document.body.style.userSelect = 'none';
    return () => {
      document.removeEventListener('contextmenu', block);
      document.body.style.userSelect = '';
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-white select-none">
      {/* Module A: Hero Header */}
      <RevealSection>
        <div className="max-w-4xl mx-auto px-6 min-h-screen flex flex-col justify-center text-center">
          <img
            src="/mono-booth-ph.svg"
            alt="MONO BOOTH PH"
            className="w-20 h-20 object-contain brightness-0 mx-auto mb-10"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 tracking-tight">
            MONO BOOTH PH
          </h1>
          <p className="text-2xl md:text-3xl text-black leading-relaxed mb-0 max-w-2xl mx-auto">
            No proof without @monoboothph.
          </p>
          <p className="text-2xl md:text-3xl text-black leading-relaxed mb-8 max-w-2xl mx-auto">
            Show 'em the receipts.
          </p>
          <div className="flex flex-col items-center">
            <a
              href="https://m.me/monoboothph?text=Hi!%20I%27m%20interested%20in%20booking%20MONO%20BOOTH%20PH%20for%20an%20event.%20Can%20you%20share%20the%20packages%20and%20availability%3F"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-black text-white px-10 py-5 font-bold hover:opacity-90 transition border-2 border-black shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <MessageCircle className="w-5 h-5" />
              Book via Messenger
              <ArrowRight className="w-5 h-5" />
            </a>
            <Link
              to="/timeline"
              className="mt-8 inline-flex items-center gap-1.5 text-sm text-black hover:opacity-70 transition underline underline-offset-2"
            >
              Where we are now
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="mt-12 animate-bounce">
            <ChevronDown className="w-6 h-6 text-black/50 mx-auto" />
          </div>
        </div>
      </RevealSection>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* What We Do */}
      <RevealSection>
        <div className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-black mb-6">We Bring the Booth</h2>
          <p className="text-black leading-relaxed mb-4">
            <strong className="font-bold text-black">MONO BOOTH PH</strong> is a custom-built photobooth service for weddings, birthdays, corporate events, and any occasion worth remembering. We bring the booth to your venue, capture the moments, and print them on the spot.
          </p>
          <p className="text-black leading-relaxed">
            Every print is instant, physical, and yours to keep. Every photo is also available for digital download through a private web portal — zero lag, zero hassle.
          </p>
        </div>
      </RevealSection>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* Event Types */}
      <EventTypePills />

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* Gallery — Events & Setups */}
      <RevealSection>
        <div className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-black mb-6">Show 'Em the Receipts</h2>
          <GalleryGrid />
        </div>
      </RevealSection>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* How It Works */}
      <RevealSection>
        <div className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-black mb-6">Three Steps, Zero Chill</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StepCard
              index={0}
              icon={<Touchpad className="w-6 h-6" />}
              number="1"
              title="Tap to Start"
              description="Guests tap the screen and strike a pose. The booth walks them through the shots."
            />
            <StepCard
              index={1}
              icon={<Camera className="w-6 h-6" />}
              number="2"
              title="Capture"
              description="Multiple shots per session with a live preview. Choose your best pose."
            />
            <StepCard
              index={2}
              icon={<Printer className="w-6 h-6" />}
              number="3"
              title="Print & Download"
              description="Physical print in seconds. Digital copy available instantly via QR code."
            />
          </div>
        </div>
      </RevealSection>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* Print Layouts */}
      <RevealSection>
        <div className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-black mb-6">Pick Your Vibe</h2>
          <div className="columns-2 md:columns-3 gap-4">
            {/* Tall Order — 6 shots, portrait grid */}
            <PrintLayoutCard index={0} name="Tall Order" shots="6 shots">
              <div className="grid grid-cols-2 gap-1">
                <div className="bg-gray-200 rounded" style={{ aspectRatio: '3/4' }} />
                <div className="bg-gray-200 rounded" style={{ aspectRatio: '3/4' }} />
                <div className="bg-gray-200 rounded" style={{ aspectRatio: '3/4' }} />
                <div className="bg-gray-200 rounded" style={{ aspectRatio: '3/4' }} />
                <div className="bg-gray-200 rounded" style={{ aspectRatio: '3/4' }} />
                <div className="bg-gray-200 rounded" style={{ aspectRatio: '3/4' }} />
              </div>
            </PrintLayoutCard>
            {/* Solo Star — 1 shot, portrait */}
            <PrintLayoutCard index={1} name="Solo Star" shots="1 shot">
              <div className="w-full bg-gray-200 rounded" style={{ aspectRatio: '3/4' }} />
            </PrintLayoutCard>
            {/* Double Take — 2 shots, landscape */}
            <PrintLayoutCard index={2} name="Double Take" shots="2 shots">
              <div className="w-full bg-gray-200 rounded" style={{ aspectRatio: '4/3' }} />
              <div className="w-full bg-gray-200 rounded mt-1" style={{ aspectRatio: '4/3' }} />
            </PrintLayoutCard>
            {/* Triple Threat — 3 shots, landscape */}
            <PrintLayoutCard index={3} name="Triple Threat" shots="3 shots">
              <div className="w-full bg-gray-200 rounded" style={{ aspectRatio: '4/3' }} />
              <div className="w-full bg-gray-200 rounded mt-0.5" style={{ aspectRatio: '4/3' }} />
              <div className="w-full bg-gray-200 rounded mt-0.5" style={{ aspectRatio: '4/3' }} />
            </PrintLayoutCard>
            {/* Wide Load — 6 shots, landscape grid */}
            <PrintLayoutCard index={4} name="Wide Load" shots="6 shots">
              <div className="grid grid-cols-2 gap-1">
                <div className="bg-gray-200 rounded" style={{ aspectRatio: '4/3' }} />
                <div className="bg-gray-200 rounded" style={{ aspectRatio: '4/3' }} />
                <div className="bg-gray-200 rounded" style={{ aspectRatio: '4/3' }} />
                <div className="bg-gray-200 rounded" style={{ aspectRatio: '4/3' }} />
                <div className="bg-gray-200 rounded" style={{ aspectRatio: '4/3' }} />
                <div className="bg-gray-200 rounded" style={{ aspectRatio: '4/3' }} />
              </div>
            </PrintLayoutCard>
            {/* Quad Squad — 4 shots, portrait grid */}
            <PrintLayoutCard index={5} name="Quad Squad" shots="4 shots">
              <div className="grid grid-cols-2 gap-1">
                <div className="bg-gray-200 rounded" style={{ aspectRatio: '3/4' }} />
                <div className="bg-gray-200 rounded" style={{ aspectRatio: '3/4' }} />
                <div className="bg-gray-200 rounded" style={{ aspectRatio: '3/4' }} />
                <div className="bg-gray-200 rounded" style={{ aspectRatio: '3/4' }} />
              </div>
            </PrintLayoutCard>
          </div>
        </div>
      </RevealSection>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* What You Get */}
      <RevealSection>
        <FeatureGrid />
      </RevealSection>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* Service Packages */}
      <RevealSection>
        <div className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-black mb-12 text-center">Book Your Hours</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {PACKAGES.map((pkg, index) => (
              <PackageCard key={index} index={index} pkg={pkg} />
            ))}
          </div>
        </div>
      </RevealSection>

      {/* Book CTA — right after pricing */}
      <RevealSection>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-black text-white p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Ready to make memories?</h3>
            <p className="text-white/70 text-sm mb-6">Message us and we will check availability for your date.</p>
            <a
              href="https://m.me/monoboothph?text=Hi!%20I%27m%20interested%20in%20booking%20MONO%20BOOTH%20PH%20for%20an%20event.%20Can%20you%20share%20the%20packages%20and%20availability%3F"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-bold text-sm hover:bg-gray-100 transition border-2 border-white"
            >
              <MessageCircle className="w-4 h-4" />
              Book via Messenger
            </a>
          </div>
        </div>
      </RevealSection>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* FAQ */}
      <RevealSection>
        <div className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-black mb-6">Still Got Questions?</h2>
          <div>
            <FAQItem
              question="How many prints do we get?"
              answer="Unlimited physical prints for the duration of your booking. Guests can print as many copies as they want."
            />
            <FAQItem
              question="Can we customize the print design?"
              answer="Yes. We can add your event name, date, logo, or custom message to every print."
            />
            <FAQItem
              question="How long does setup take?"
              answer="About 15–20 minutes before your event starts. We handle everything."
            />
            <FAQItem
              question="Do guests get digital copies?"
              answer="Yes. Every photo is available for instant download via a private web portal and QR code."
            />
            <FAQItem
              question="What areas do you serve?"
              answer="Based in Kabankalan City, Negros Occidental. Available for events across the province and beyond."
            />
          </div>
        </div>
      </RevealSection>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* The Build */}
      <RevealSection>
        <div className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-black mb-6">Built From Scratch</h2>
          <p className="text-black leading-relaxed mb-4">
            This is not rented software. The kiosk app, the print pipeline, the camera logic, and the web portal were all written from scratch. The hardware enclosure is fabricated locally too.
          </p>
          <p className="text-black leading-relaxed">
            When something needs fixing, we open the code and handle it ourselves. No overseas support tickets. No generic templates.
          </p>
          <div className="mt-6">
            <Link
              to="/timeline"
              className="inline-flex items-center gap-1.5 text-sm text-black hover:opacity-70 transition underline underline-offset-2"
            >
              See the project timeline
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </div>
        </div>
      </RevealSection>

      <hr className="border-gray-200 max-w-4xl mx-auto" />

      {/* Contact */}
      <RevealSection>
        <div className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-black mb-6">Let's Make It Happen</h2>
          <p className="text-black leading-relaxed mb-4">
            Questions? Want to check availability? Message us directly and we will get back to you as soon as we can.
          </p>
          <a
            href="https://m.me/monoboothph?text=Hi!%20I%20have%20a%20question%20about%20MONO%20BOOTH%20PH."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm bg-black text-white px-6 py-3 font-semibold hover:opacity-90 transition border-2 border-black"
          >
            <MessageCircle className="w-4 h-4" />
            Message us on Messenger
          </a>
        </div>
      </RevealSection>

      {/* Footer */}
      <RevealSection>
        <div className="max-w-4xl mx-auto px-6 py-16 text-center border-t-2 border-gray-200">
          <p className="text-sm font-bold text-black tracking-wider mb-2">MONO BOOTH PH</p>
          <p className="text-xs text-black tracking-widest uppercase">No proof without @monoboothph</p>
        </div>
      </RevealSection>
      <StickyBookButton />
    </div>
  );
}
