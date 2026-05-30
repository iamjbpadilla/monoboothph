import { useSettings } from '../../context/SettingsContext.jsx';

const COUNTDOWN_OPTIONS = [3, 5, 10];

function Toggle({ value, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative inline-flex flex-shrink-0 w-[52px] h-[32px] rounded-full transition-colors duration-200 ${
        value
          ? 'bg-md-primary'
          : 'bg-md-surface-container-highest ring-2 ring-inset ring-md-outline'
      }`}
    >
      <span
        className={`pointer-events-none absolute top-[4px] left-[4px] w-[24px] h-[24px] rounded-full shadow-md transition-all duration-200 ease-out ${
          value ? 'translate-x-[20px] bg-md-on-primary' : 'translate-x-0 bg-md-on-surface-variant'
        }`}
      />
    </button>
  );
}

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

      {/* Flash */}
      <div className="flex items-center justify-between py-4 px-4 rounded-xl bg-md-surface-container border border-md-outline-variant">
        <div>
          <div className="text-sm font-medium text-md-on-surface">Flash Effect</div>
          <div className="text-xs text-md-on-surface-variant">White flash on each capture</div>
        </div>
        <Toggle
          value={capture.flashEffect}
          onChange={v => updateSettings('capture.flashEffect', v)}
        />
      </div>
    </div>
  );
}
