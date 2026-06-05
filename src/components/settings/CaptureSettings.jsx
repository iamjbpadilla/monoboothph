import { useSettings } from '../../context/SettingsContext.jsx';

const COUNTDOWN_OPTIONS = [3, 5, 10];
const RESOLUTIONS = [
  { label: 'HD (720p)', value: 'hd' },
  { label: 'Full HD (1080p)', value: 'fhd' },
];

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-md-on-surface tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

export default function CaptureSettings() {
  const { settings, updateSettings } = useSettings();
  const { capture } = settings;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Countdown Timer */}
      <Section title="Countdown Timer">
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
      </Section>

      {/* Pose Suggestions */}
      <Section title="Pose Suggestions">
        <div className="flex items-center justify-between py-4 px-4 bg-md-surface-container border border-md-outline-variant rounded-lg">
          <div>
            <div className="text-sm font-medium text-md-on-surface">Show Pose Suggestions</div>
            <div className="text-xs text-md-on-surface-variant">Display pose prompts during countdown</div>
          </div>
          <button
            role="switch"
            aria-checked={capture.poseSuggestionsEnabled}
            onClick={() => updateSettings('capture.poseSuggestionsEnabled', !capture.poseSuggestionsEnabled)}
            className={`relative inline-flex flex-shrink-0 w-[52px] h-[32px] rounded-full transition-colors duration-200 ${
              capture.poseSuggestionsEnabled
                ? 'bg-md-primary'
                : 'bg-md-surface-container-highest ring-2 ring-inset ring-md-outline'
            }`}
          >
            <span
              className={`pointer-events-none absolute top-[4px] left-[4px] w-[24px] h-[24px] rounded-full shadow-md transition-all duration-200 ease-out ${
                capture.poseSuggestionsEnabled ? 'translate-x-[20px] bg-md-on-primary' : 'translate-x-0 bg-md-on-surface-variant'
              }`}
            />
          </button>
        </div>
      </Section>

      {/* Retake Messages */}
      <Section title="Retake Messages">
        <div className="flex items-center justify-between py-4 px-4 bg-md-surface-container border border-md-outline-variant rounded-lg">
          <div>
            <div className="text-sm font-medium text-md-on-surface">Show Retake Messages</div>
            <div className="text-xs text-md-on-surface-variant">Display witty messages on retake screen</div>
          </div>
          <button
            role="switch"
            aria-checked={capture.retakeMessagesEnabled}
            onClick={() => updateSettings('capture.retakeMessagesEnabled', !capture.retakeMessagesEnabled)}
            className={`relative inline-flex flex-shrink-0 w-[52px] h-[32px] rounded-full transition-colors duration-200 ${
              capture.retakeMessagesEnabled
                ? 'bg-md-primary'
                : 'bg-md-surface-container-highest ring-2 ring-inset ring-md-outline'
            }`}
          >
            <span
              className={`pointer-events-none absolute top-[4px] left-[4px] w-[24px] h-[24px] rounded-full shadow-md transition-all duration-200 ease-out ${
                capture.retakeMessagesEnabled ? 'translate-x-[20px] bg-md-on-primary' : 'translate-x-0 bg-md-on-surface-variant'
              }`}
            />
          </button>
        </div>
      </Section>

      {/* Camera Mirror */}
      <Section title="Camera Mirror">
        <div className="flex items-center justify-between py-4 px-4 bg-md-surface-container border border-md-outline-variant rounded-lg">
          <div>
            <div className="text-sm font-medium text-md-on-surface">Mirror Preview</div>
            <div className="text-xs text-md-on-surface-variant">Horizontal flip for selfie camera</div>
          </div>
          <button
            role="switch"
            aria-checked={capture.mirror}
            onClick={() => updateSettings('capture.mirror', !capture.mirror)}
            className={`relative inline-flex flex-shrink-0 w-[52px] h-[32px] rounded-full transition-colors duration-200 ${
              capture.mirror
                ? 'bg-md-primary'
                : 'bg-md-surface-container-highest ring-2 ring-inset ring-md-outline'
            }`}
          >
            <span
              className={`pointer-events-none absolute top-[4px] left-[4px] w-[24px] h-[24px] rounded-full shadow-md transition-all duration-200 ease-out ${
                capture.mirror ? 'translate-x-[20px] bg-md-on-primary' : 'translate-x-0 bg-md-on-surface-variant'
              }`}
            />
          </button>
        </div>
      </Section>

      {/* Resolution */}
      <Section title="Resolution">
        <div className="flex flex-col gap-2">
          {RESOLUTIONS.map(res => (
            <button
              key={res.value}
              onClick={() => updateSettings('capture.resolution', res.value)}
              className={`px-4 py-2.5 rounded-xl border text-sm text-left transition-colors ${
                capture.resolution === res.value
                  ? 'bg-md-primary text-md-on-primary border-md-primary'
                  : 'bg-md-surface-container text-md-on-surface-variant border-md-outline-variant hover:bg-md-surface-container-high'
              }`}
            >
              {res.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Flash Effect */}
      <Section title="Flash Effect">
        <div className="flex items-center justify-between py-4 px-4 bg-md-surface-container border border-md-outline-variant rounded-lg">
          <div>
            <div className="text-sm font-medium text-md-on-surface">Flash Effect</div>
            <div className="text-xs text-md-on-surface-variant">Show flash animation on capture</div>
          </div>
          <button
            role="switch"
            aria-checked={capture.flashEffect}
            onClick={() => updateSettings('capture.flashEffect', !capture.flashEffect)}
            className={`relative inline-flex flex-shrink-0 w-[52px] h-[32px] rounded-full transition-colors duration-200 ${
              capture.flashEffect
                ? 'bg-md-primary'
                : 'bg-md-surface-container-highest ring-2 ring-inset ring-md-outline'
            }`}
          >
            <span
              className={`pointer-events-none absolute top-[4px] left-[4px] w-[24px] h-[24px] rounded-full shadow-md transition-all duration-200 ease-out ${
                capture.flashEffect ? 'translate-x-[20px] bg-md-on-primary' : 'translate-x-0 bg-md-on-surface-variant'
              }`}
            />
          </button>
        </div>
      </Section>
    </div>
  );
}
