import { useRef, useState, useEffect, useCallback } from 'react';

const RESOLUTIONS = {
  hd:  { width: 1280, height: 720 },
  fhd: { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 },
};

export function useCamera({ deviceId, resolution = 'hd', mirror = true } = {}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | starting | active | error | disconnected
  const [error, setError] = useState(null);

  const enumerateDevices = useCallback(async () => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      setDevices(all.filter(d => d.kind === 'videoinput'));
    } catch {
      setDevices([]);
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setStatus('starting');
      setError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const res = RESOLUTIONS[resolution] || RESOLUTIONS.hd;
      const constraints = {
        video: {
          ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'user' }),
          width: { ideal: res.width },
          height: { ideal: res.height },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.style.transform = mirror ? 'scaleX(-1)' : 'none';
        // Force video to play immediately to prevent placeholder
        videoRef.current.play().catch(err => {
          console.error('Video play failed:', err);
        });
      }
      await enumerateDevices();
      setStatus('active');
    } catch (err) {
      setError(err.message || 'Camera unavailable');
      setStatus('error');
    }
  }, [deviceId, resolution, mirror, enumerateDevices]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus('idle');
  }, []);

  // Capture frame — crops center to targetRatio {w, h}
  const captureFrame = useCallback((targetRatio) => {
    try {
      const video = videoRef.current;
      if (!video || status !== 'active') return null;

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const targetAspect = targetRatio.w / targetRatio.h;
      const videoAspect = vw / vh;

      let sx, sy, sw, sh;
      if (videoAspect > targetAspect) {
        sh = vh;
        sw = Math.round(vh * targetAspect);
        sx = Math.round((vw - sw) / 2);
        sy = 0;
      } else {
        sw = vw;
        sh = Math.round(vw / targetAspect);
        sx = 0;
        sy = Math.round((vh - sh) / 2);
      }

      const canvas = document.createElement('canvas');
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d');
      if (mirror) {
        ctx.translate(sw, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
      return canvas.toDataURL('image/jpeg', 0.92);
    } catch {
      return null;
    }
  }, [status, mirror]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return { videoRef, status, error, devices, startCamera, stopCamera, captureFrame };
}
