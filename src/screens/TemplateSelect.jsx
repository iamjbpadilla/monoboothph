import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';
import { playClick } from '../hooks/useSound.js';

const TEMPLATES = [
  {
    key: '1strip',
    label: 'Solo Star',
    shots: 1,
    description: 'Your moment, your spotlight',
    preview: () => (
      <div className="w-full flex flex-col gap-1 p-2">
        <div className="w-full rounded" style={{ aspectRatio: '3/4', background: 'var(--color-md-primary)', opacity: 0.35 }} />
      </div>
    ),
  },
  {
    key: '2strip',
    label: 'Double Take',
    shots: 2,
    description: 'Double the fun, double the memories',
    preview: () => (
      <div className="w-full flex flex-col gap-1 p-2">
        <div className="w-full rounded" style={{ aspectRatio: '4/3', background: 'var(--color-md-primary)', opacity: 0.35 }} />
        <div className="w-full rounded" style={{ aspectRatio: '4/3', background: 'var(--color-md-primary)', opacity: 0.22 }} />
      </div>
    ),
  },
  {
    key: '3strip',
    label: 'Triple Threat',
    shots: 3,
    description: 'Three perfect poses in a row',
    preview: () => (
      <div className="w-full flex flex-col gap-1 p-2">
        <div className="w-full rounded" style={{ aspectRatio: '4/3', background: 'var(--color-md-primary)', opacity: 0.35 }} />
        <div className="w-full rounded" style={{ aspectRatio: '4/3', background: 'var(--color-md-primary)', opacity: 0.25 }} />
        <div className="w-full rounded" style={{ aspectRatio: '4/3', background: 'var(--color-md-primary)', opacity: 0.15 }} />
      </div>
    ),
  },
  {
    key: '4grid',
    label: 'Quad Squad',
    shots: 4,
    description: 'A collage of your best moments',
    preview: () => (
      <div className="w-full grid grid-cols-2 gap-1 p-2">
        <div className="w-full rounded" style={{ aspectRatio: '3/4', background: 'var(--color-md-primary)', opacity: 0.35 }} />
        <div className="w-full rounded" style={{ aspectRatio: '3/4', background: 'var(--color-md-primary)', opacity: 0.28 }} />
        <div className="w-full rounded" style={{ aspectRatio: '3/4', background: 'var(--color-md-primary)', opacity: 0.21 }} />
        <div className="w-full rounded" style={{ aspectRatio: '3/4', background: 'var(--color-md-primary)', opacity: 0.14 }} />
      </div>
    ),
  },
  {
    key: '2x3-landscape',
    label: 'Wide Load',
    shots: 6,
    description: 'Six photos in landscape layout',
    preview: () => (
      <div className="w-full grid grid-cols-2 gap-1 p-2">
        <div className="w-full rounded" style={{ aspectRatio: '4/3', background: 'var(--color-md-primary)', opacity: 0.35 }} />
        <div className="w-full rounded" style={{ aspectRatio: '4/3', background: 'var(--color-md-primary)', opacity: 0.30 }} />
        <div className="w-full rounded" style={{ aspectRatio: '4/3', background: 'var(--color-md-primary)', opacity: 0.25 }} />
        <div className="w-full rounded" style={{ aspectRatio: '4/3', background: 'var(--color-md-primary)', opacity: 0.20 }} />
        <div className="w-full rounded" style={{ aspectRatio: '4/3', background: 'var(--color-md-primary)', opacity: 0.15 }} />
        <div className="w-full rounded" style={{ aspectRatio: '4/3', background: 'var(--color-md-primary)', opacity: 0.10 }} />
      </div>
    ),
  },
  {
    key: '2x3-portrait',
    label: 'Tall Order',
    shots: 6,
    description: 'Six photos in portrait layout',
    preview: () => (
      <div className="w-full grid grid-cols-2 gap-1 p-2">
        <div className="w-full rounded" style={{ aspectRatio: '3/4', background: 'var(--color-md-primary)', opacity: 0.35 }} />
        <div className="w-full rounded" style={{ aspectRatio: '3/4', background: 'var(--color-md-primary)', opacity: 0.30 }} />
        <div className="w-full rounded" style={{ aspectRatio: '3/4', background: 'var(--color-md-primary)', opacity: 0.25 }} />
        <div className="w-full rounded" style={{ aspectRatio: '3/4', background: 'var(--color-md-primary)', opacity: 0.20 }} />
        <div className="w-full rounded" style={{ aspectRatio: '3/4', background: 'var(--color-md-primary)', opacity: 0.15 }} />
        <div className="w-full rounded" style={{ aspectRatio: '3/4', background: 'var(--color-md-primary)', opacity: 0.10 }} />
      </div>
    ),
  },
];

export default function TemplateSelect({ onSelect, onBack }) {
  const { settings } = useSettings();
  const homeScreen = settings.homeScreen || {};
  const isDark = settings.general.theme === 'dark';
  const [selected, setSelected] = useState(null);
  const timerRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(20);

  const selectedTemplate = TEMPLATES.find(t => t.key === selected);

  // Auto-return timer - 20 seconds if no interaction
  useEffect(() => {
    const resetTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setTimeLeft(20);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            onBack();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    resetTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [onBack]);

  // Reset timer on any interaction
  const handleInteraction = () => {
    setTimeLeft(20);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            onBack();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-md-surface">
      {/* Header with title/subtitle */}
      <div className="relative z-10 flex flex-col items-center px-2 pt-4 pb-2 flex-shrink-0 bg-md-surface">
        <h2 className="text-[22px] leading-7 font-normal text-md-on-surface text-center">
          CHOOSE YOUR SLIP
        </h2>
      </div>

      {/* MD3 Cards grid */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-6 page-content-enter">
        <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
          {TEMPLATES.map(({ key, label, shots, description, preview: Preview }) => {
            const isSelected = selected === key;
            return (
              <button
                key={key}
                onClick={() => { playClick(); setSelected(key); }}
                className={`flex flex-col rounded-[28px] overflow-hidden transition-all duration-150 active:scale-[0.97] relative min-h-[320px] max-h-[400px] ${
                  isSelected
                    ? 'bg-md-primary-container ring-2 ring-md-primary scale-[1.02] shadow-lg'
                    : 'bg-md-surface-container-high hover:bg-md-surface-container-highest hover:scale-[1.03] hover:shadow-xl'
                }`}
              >
                {/* Check badge */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-md-primary flex items-center justify-center z-10 badge-pop">
                    <Check size={13} className="text-md-on-primary" strokeWidth={3} />
                  </div>
                )}

                {/* Preview area */}
                <div className={`w-full flex-1 flex items-center justify-center py-4 ${isSelected ? 'bg-md-primary-container/60' : 'bg-md-surface-container'}`}>
                  <div className="w-full max-w-[96px] max-h-[200px]">
                    <Preview />
                  </div>
                </div>

                {/* Card text */}
                <div className="px-4 py-4 text-center flex-shrink-0">
                  <div className={`text-base font-semibold ${isSelected ? 'text-md-on-primary-container' : 'text-md-on-surface'}`}>
                    {label}
                  </div>
                  <div className={`text-sm mt-1 ${isSelected ? 'text-md-on-primary-container/70' : 'text-md-on-surface-variant'}`}>
                    {description}
                  </div>
                  <div className={`text-xs mt-2 font-medium ${isSelected ? 'text-md-on-primary-container/50' : 'text-md-outline'}`}>
                    {shots} photo{shots > 1 ? 's' : ''}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MD3 Bottom action — Extended FAB style */}
      <div className="flex-shrink-0 px-4 py-4 bg-md-surface">
        <button
          onClick={() => { if (selected) { playClick(); handleInteraction(); onSelect(selected); } }}
          disabled={!selected}
          className={`w-full flex items-center justify-center gap-3 min-h-[56px] rounded-[16px] font-semibold text-base tracking-wide transition-all duration-150 ${
            selected
              ? 'bg-md-primary text-md-on-primary hover:brightness-110 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] shadow-lg'
              : 'bg-md-surface-container text-md-on-surface-variant cursor-not-allowed'
          }`}
        >
          {selected ? (
            <>
              Start — {selectedTemplate.label}
              <ChevronRight size={18} />
            </>
          ) : (
            'Select a template above'
          )}
        </button>
      </div>
    </div>
  );
}
