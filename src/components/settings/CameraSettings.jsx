import { useState, useRef, useEffect, useCallback } from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';

const RES_MAP = {
  hd:  { width: 1280, height: 720 },
  fhd: { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 },
};

const RESOLUTIONS = [
  { label: 'HD (720p)', value: 'hd' },
  { label: 'Full HD (1080p)', value: 'fhd' },
  { label: '4K (2160p)', value: '4k' },
];

export default function CameraSettings() {
  const { settings, updateSettings } = useSettings();
  const { camera } = settings;

  const [devices, setDevices] = useState([]);
  const [previewStatus, setPreviewStatus] = useState('starting'); // starting | active | error
  const [previewError, setPreviewError] = useState(null);
  const [actualRes, setActualRes] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

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
    <div className="space-y-5">
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
            <span className="text-2xl">📷</span>
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
        <label className="block text-xs font-medium text-md-on-surface-variant mb-1">Camera Device</label>
        <select
          value={camera.deviceId}
          onChange={e => updateSettings('camera.deviceId', e.target.value)}
          className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-3.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary"
        >
          <option value="">Default / Auto</option>
          {devices.map(d => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Camera ${d.deviceId.slice(0, 8)}`}
            </option>
          ))}
        </select>
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
              className={`px-4 py-3.5 rounded-xl border text-sm text-left transition-colors ${
                camera.resolution === r.value
                  ? 'bg-md-primary text-md-on-primary border-md-primary'
                  : 'bg-md-surface-container text-md-on-surface-variant border-md-outline-variant hover:bg-md-surface-container-high'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
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
          className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
            camera.mirror ? 'bg-md-primary' : 'bg-md-surface-container-highest ring-1 ring-inset ring-md-outline'
          }`}
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full shadow-sm transition-all duration-200 ${
            camera.mirror ? 'translate-x-6 bg-md-on-primary' : 'translate-x-1 bg-md-outline'
          }`} />
        </button>
      </div>
    </div>
  );
}
