import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, AlertTriangle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.jsx';
import StyledSelect from '../StyledSelect.jsx';
import ConfirmDialog from '../ConfirmDialog.jsx';

const RES_MAP = {
  hd:  { width: 1280, height: 720 },
  fhd: { width: 1920, height: 1080 },
  uhd: { width: 3840, height: 2160 },
};

const RESOLUTIONS = [
  { label: 'HD (720p)', value: 'hd' },
  { label: 'Full HD (1080p)', value: 'fhd' },
  { label: '4K UHD (2160p)', value: 'uhd', warning: true },
];

const COUNTDOWN_OPTIONS = [3, 5, 10];

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-md-on-surface tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

export default function PhotoSettings() {
  const { settings, updateSettings } = useSettings();
  const { camera, capture } = settings;

  const [devices, setDevices] = useState([]);
  const [previewStatus, setPreviewStatus] = useState('starting'); // starting | active | error
  const [previewError, setPreviewError] = useState(null);
  const [actualRes, setActualRes] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', onConfirm: null });

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  function showConfirm(title, description, onConfirm) {
    setConfirmDialog({ open: true, title, description, onConfirm });
  }

  const startStream = useCallback(async (deviceId, resolution, mirror) => {
    setPreviewStatus('starting');
    setPreviewError(null);
    setActualRes(null);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    try {
      const res = RES_MAP[resolution] || RES_MAP.hd;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'user' }),
          width: { ideal: res.width },
          height: { ideal: res.height },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.style.transform = mirror ? 'scaleX(-1)' : 'none';
        videoRef.current.onloadedmetadata = () => {
          const vt = stream.getVideoTracks()[0];
          const s = vt?.getSettings?.();
          if (s) setActualRes(`${s.width}×${s.height}`);
          setPreviewStatus('active');
        };
      }

      // Enumerate devices now that we have permission
      const all = await navigator.mediaDevices.enumerateDevices();
      setDevices(all.filter(d => d.kind === 'videoinput'));
    } catch (err) {
      setPreviewError(err.message);
      setPreviewStatus('error');
    }
  }, []);

  // Restart stream when device or resolution changes
  useEffect(() => {
    startStream(camera.deviceId, camera.resolution, camera.mirror);
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, [camera.deviceId, camera.resolution, startStream]);

  // Mirror toggle without restarting
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.style.transform = camera.mirror ? 'scaleX(-1)' : 'none';
    }
  }, [camera.mirror]);

  return (
    <div className="space-y-6">
      {/* Camera Section */}
      <Section title="Camera">
        {/* Live preview */}
        <div className="rounded-xl overflow-hidden border border-md-outline-variant bg-black relative" style={{ aspectRatio: '4/3' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {previewStatus === 'starting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="w-6 h-6 border-2 border-md-outline border-t-md-primary rounded-full animate-spin" />
            </div>
          )}
          {previewStatus === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 text-center px-4">
              <Camera size={32} className="text-red-400" />
              <p className="text-red-400 text-xs">{previewError}</p>
              <button
                onClick={() => startStream(camera.deviceId, camera.resolution, camera.mirror)}
                className="mt-1 text-xs text-md-primary underline"
              >
                Retry
              </button>
            </div>
          )}
          {previewStatus === 'active' && actualRes && (
            <div className="absolute bottom-2 right-2 bg-md-surface-container/80 text-md-on-surface-variant text-[10px] px-1.5 py-0.5 rounded">
              {actualRes}
            </div>
          )}
        </div>

        {/* Device selector */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-md-on-surface-variant">Camera Device</label>
            <button
              onClick={() => showConfirm(
                'Reset Camera Settings',
                'Reset camera device, resolution, and mirror to defaults?',
                () => {
                  updateSettings('camera.deviceId', '');
                  updateSettings('camera.resolution', 'fhd');
                  updateSettings('camera.mirror', false);
                }
              )}
              className="text-xs text-md-primary hover:text-md-on-primary transition-colors"
            >
              Reset
            </button>
          </div>
          <StyledSelect
            value={camera.deviceId || 'auto'}
            onValueChange={v => updateSettings('camera.deviceId', v === 'auto' ? '' : v)}
            options={[{ value: 'auto', label: 'Default / Auto' }, ...devices.map(d => ({ value: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 8)}` }))]}
            placeholder="Select camera"
          />
          {devices.length === 0 && previewStatus !== 'error' && (
            <p className="text-md-outline text-xs mt-1">Waiting for permission to list devices…</p>
          )}
        </div>

        {/* Resolution */}
        <div>
          <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Resolution</label>
          <div className="flex flex-col gap-2">
            {RESOLUTIONS.map(r => (
              <button
                key={r.value}
                onClick={() => updateSettings('camera.resolution', r.value)}
                className={`px-4 py-2.5 rounded-xl border text-sm text-left transition-colors ${
                  camera.resolution === r.value
                    ? 'bg-md-primary text-md-on-primary border-md-primary'
                    : 'bg-md-surface-container text-md-on-surface-variant border-md-outline-variant hover:bg-md-surface-container-high'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{r.label}</span>
                  {r.warning && (
                    <AlertTriangle size={14} className="text-md-warning" />
                  )}
                </div>
              </button>
            ))}
          </div>
          {camera.resolution === 'uhd' && (
            <div className="mt-2 flex items-start gap-2 px-3 py-2 bg-md-warning-container/10 border border-md-warning rounded-lg">
              <AlertTriangle size={14} className="text-md-warning flex-shrink-0 mt-0.5" />
              <p className="text-xs text-md-warning">
                4K requires a camera that supports 3840×2160 resolution. Using this on unsupported cameras may cause performance issues or fail to start.
              </p>
            </div>
          )}
        </div>

        {/* Mirror toggle */}
        <div className="flex items-center justify-between py-4 px-4 rounded-xl bg-md-surface-container border border-md-outline-variant">
          <div>
            <div className="text-sm font-medium text-md-on-surface">Mirror Preview</div>
            <div className="text-xs text-md-on-surface-variant">Horizontal flip for selfie camera</div>
          </div>
          <button
            role="switch"
            aria-checked={camera.mirror}
            onClick={() => updateSettings('camera.mirror', !camera.mirror)}
            className={`relative inline-flex flex-shrink-0 w-[52px] h-[32px] rounded-full transition-colors duration-200 ${
              camera.mirror
                ? 'bg-md-primary'
                : 'bg-md-surface-container-highest ring-2 ring-inset ring-md-outline'
            }`}
          >
            <span
              className={`pointer-events-none absolute top-[4px] left-[4px] w-[24px] h-[24px] rounded-full shadow-md transition-all duration-200 ease-out ${
                camera.mirror ? 'translate-x-[20px] bg-md-on-primary' : 'translate-x-0 bg-md-on-surface-variant'
              }`}
            />
          </button>
        </div>
      </Section>

      {/* Capture Section */}
      <Section title="Capture">
        {/* Countdown Timer */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Countdown Timer</label>
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

        {/* Pose Suggestions */}
        <div className="flex items-center justify-between py-4 px-4 bg-md-surface-container border border-md-outline-variant rounded-lg mb-4">
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

        {/* Retake Messages */}
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

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={() => {
          if (confirmDialog.onConfirm) confirmDialog.onConfirm();
          setConfirmDialog({ ...confirmDialog, open: false });
        }}
      />
    </div>
  );
}
