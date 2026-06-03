import { useEffect } from 'react';
import { ArrowLeft, CircleDot, CheckCircle2, Lightbulb, Monitor, Box, Rocket, PartyPopper } from 'lucide-react';
import { Link } from 'react-router-dom';
import useInView from '../hooks/useInView';

const ICON_MAP = {
  Lightbulb,
  Monitor,
  Box,
  Rocket,
  PartyPopper,
};

const PHASES = [
  {
    title: 'Idea & Architecture',
    status: 'completed',
    date: 'Q4 2025',
    description: 'The booth concept, print workflow, and data structure designed from scratch.',
    icon: 'Lightbulb',
  },
  {
    title: 'App Development',
    status: 'in-progress',
    date: 'Q1 2026',
    description: 'The photo capture, print output, and web portal are in active testing. Core features are stable, final polish underway.',
    icon: 'Monitor',
    lastUpdated: 'June 2026',
    statusNote: 'Testing on real hardware',
  },
  {
    title: 'Hardware Enclosure',
    status: 'in-progress',
    date: 'Q2 2026',
    description: 'Thermal printer housing, camera mount, and transport-ready enclosure being fabricated.',
    icon: 'Box',
    lastUpdated: 'June 2026',
    statusNote: 'Enclosure fabrication started',
  },
  {
    title: 'Beta Launch',
    status: 'upcoming',
    date: 'Q2 2026',
    description: 'Field testing at select events. Verifying print reliability and photo download speed under real conditions.',
    icon: 'Rocket',
  },
  {
    title: 'Public Launch',
    status: 'upcoming',
    date: 'Q3 2026',
    description: 'Open for bookings. Full event coverage with unlimited prints and instant digital downloads.',
    icon: 'PartyPopper',
  },
];

const ACTIVITY_LOG = [
  { date: 'June 2026', description: 'Photo print quality dialed in for thermal paper' },
  { date: 'May 2026', description: 'Camera capture stable across indoor and outdoor lighting' },
  { date: 'May 2026', description: 'First clean physical print from the test booth' },
  { date: 'April 2026', description: 'Multiple photo layout templates ready for any event' },
  { date: 'March 2026', description: 'Custom branding and advertising screen working smoothly' },
];

function TimelineItem({ phase, index }) {
  const { ref, isInView } = useInView({ threshold: 0.2 });
  const completed = phase.status === 'completed';
  const inProgress = phase.status === 'in-progress';

  const Icon = ICON_MAP[phase.icon];

  return (
    <div
      ref={ref}
      className={`flex gap-6 transition-all duration-700 ease-out ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Left column: dot + line */}
      <div className="flex flex-col items-center shrink-0 w-8">
        <div className="relative">
          {completed ? (
            <CheckCircle2 className="w-6 h-6 text-gray-900" strokeWidth={2} />
          ) : inProgress ? (
            <span className="relative flex h-6 w-6">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-40"></span>
              <CircleDot className="relative inline-flex rounded-full w-6 h-6 text-gray-900" strokeWidth={2} />
            </span>
          ) : (
            <CircleDot className="w-6 h-6 text-gray-300" strokeWidth={2} />
          )}
        </div>
        {index < PHASES.length - 1 && (
          <div className="w-px flex-1 bg-gray-200 mt-2 min-h-[40px]"></div>
        )}
      </div>

      {/* Right column: content */}
      <div className="pb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{phase.date}</span>
          {inProgress && (
            <span className="text-[10px] font-bold bg-gray-900 text-white px-2 py-0.5 uppercase tracking-wider">
              In Progress
            </span>
          )}
        </div>
        <h3 className="font-bold text-lg text-gray-900 mb-1 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-400" strokeWidth={2} />}
          {phase.title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed max-w-lg">{phase.description}</p>
        {phase.statusNote && (
          <p className="text-xs text-gray-400 mt-1.5 italic">
            {phase.statusNote} — {phase.lastUpdated}
          </p>
        )}
      </div>
    </div>
  );
}

function ActivityLog() {
  return (
    <div className="mt-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Recent Updates</h2>
      <div className="max-w-xl mx-auto">
        {ACTIVITY_LOG.map((entry, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center shrink-0 w-6">
              <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5"></div>
              {index < ACTIVITY_LOG.length - 1 && (
                <div className="w-px flex-1 bg-gray-100 mt-1 min-h-[24px]"></div>
              )}
            </div>
            <div className="pb-6">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{entry.date}</span>
              <p className="text-sm text-gray-600 leading-relaxed">{entry.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Timeline() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const heroRef = useInView({ threshold: 0.1 });

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Back link */}
        <div className="text-center mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>

        {/* Hero */}
        <div
          ref={heroRef.ref}
          className={`mb-16 transition-all duration-700 ease-out ${
            heroRef.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight text-center">
            Project Timeline
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto text-center">
            Where we are now and where we are headed. Building MONO BOOTH PH from the ground up.
          </p>
        </div>

        {/* Timeline */}
        <div>
          {PHASES.map((phase, index) => (
            <TimelineItem key={index} phase={phase} index={index} />
          ))}
        </div>

        {/* Activity Log */}
        <ActivityLog />
      </div>
    </div>
  );
}
