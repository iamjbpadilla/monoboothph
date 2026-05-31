import { useSettings } from '../../context/SettingsContext.jsx';

const COUNTDOWN_OPTIONS = [3, 5, 10];

export default function CaptureSettings() {
  const { settings, updateSettings } = useSettings();
  const { capture } = settings;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Countdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-md-on-surface tracking-wide">Countdown Timer</h3>
        <div className="flex gap-3">
          {COUNTDOWN_OPTIONS.map(sec => {
            const isActive = capture.countdownSeconds === sec;
            return (
              <button
                key={sec}
                onClick={() => updateSettings('capture.countdownSeconds', sec)}
                className={`flex-1 py-4 rounded-2xl border text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-md-primary text-md-on-primary border-md-primary shadow-md'
                    : 'bg-md-surface-container text-md-on-surface-variant border-md-outline-variant hover:bg-md-surface-container-high'
                }`}
              >
                {sec}s
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
