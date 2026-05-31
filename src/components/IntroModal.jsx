import { useState, useEffect } from 'react';
import { Camera, Sparkles, ChevronRight } from 'lucide-react';
import { Preferences } from '@capacitor/preferences';
import { playClick } from '../hooks/useSound.js';

const INTRO_COMPLETED_KEY = 'snaproll_intro_completed';

const STEPS = [
  {
    icon: Camera,
    title: 'Welcome to MONO BOOTH PH',
    description: 'Your modern photobooth experience. Capture memories, print receipts, and share moments instantly.',
  },
  {
    icon: Sparkles,
    title: 'Customize Your Experience',
    description: 'Choose from beautiful templates, fonts, and colors to match your event style.',
  },
  {
    icon: ChevronRight,
    title: 'Ready to Start',
    description: 'We need camera access to capture your photos. Let\'s get you set up!',
  },
];

export default function IntroModal({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    async function checkIntro() {
      const { value } = await Preferences.get({ key: INTRO_COMPLETED_KEY });
      if (value === 'true') {
        onComplete();
      } else {
        setLoading(false);
      }
    }
    checkIntro();
  }, [onComplete]);

  function handleNext() {
    playClick();
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  }

  async function handleComplete() {
    setIsExiting(true);
    await Preferences.set({ key: INTRO_COMPLETED_KEY, value: 'true' });
    setTimeout(() => {
      setCompleted(true);
      onComplete();
    }, 300);
  }

  if (loading || completed) return null;

  const step = STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className={`fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 transition-all duration-300 ${
      isExiting ? 'animate-out fade-out' : 'animate-in fade-in'
    }`}>
      <div className={`bg-md-surface rounded-3xl max-w-md w-full p-8 shadow-2xl transition-all duration-300 ${
        isExiting ? 'animate-out slide-out-to-bottom-8 scale-95 opacity-0' : 'animate-in slide-in-from-bottom-8'
      }`}>
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-md-primary-container rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Icon className="w-10 h-10 text-md-primary" />
          </div>
          <h2 className="text-3xl font-semibold text-md-on-surface mb-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">{step.title}</h2>
          <p className="text-md-on-surface-variant text-lg animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">{step.description}</p>
        </div>

        <div className="flex justify-center gap-2 mb-8 animate-in fade-in duration-500 delay-300">
          {STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'w-8 bg-md-primary'
                  : index < currentStep
                  ? 'w-2 bg-md-primary/50'
                  : 'w-2 bg-md-outline'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full py-4 rounded-xl font-semibold bg-md-primary text-md-on-primary hover:brightness-110 transition-all duration-200 active:scale-95 text-lg animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400"
        >
          {currentStep < STEPS.length - 1 ? 'Next' : 'Get Started'}
        </button>
      </div>
    </div>
  );
}
