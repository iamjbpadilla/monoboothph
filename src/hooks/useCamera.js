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
      
      // Start with ideal values
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
      
      // Try to apply actual supported resolution from track capabilities
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        try {
          const capabilities = videoTrack.getCapabilities();
          if (capabilities && capabilities.width && capabilities.height) {
            // Find the best supported resolution that matches or is close to requested
            const supportedWidth = capabilities.width;
            const supportedHeight = capabilities.height;
            
            // If the camera supports the exact resolution, use it
            if (supportedWidth.max >= res.width && supportedHeight.max >= res.height) {
              // Apply constraints with exact values if supported
              const exactConstraints = {
                video: {
                  ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'user' }),
                  width: { ideal: Math.min(res.width, supportedWidth.max) },
                  height: { ideal: Math.min(res.height, supportedHeight.max) },
                },
                audio: false,
              };
              const newStream = await navigator.mediaDevices.getUserMedia(exactConstraints);
              streamRef.current.getTracks().forEach(t => t.stop());
              streamRef.current = newStream;
            }
          }
        } catch (e) {
          // If capabilities fail, continue with the stream we have
          console.warn('Could not apply exact resolution constraints:', e);
        }
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
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

      // Downsample to max 1200px width for performance
      const MAX_WIDTH = 1200;
      let finalWidth = sw;
      let finalHeight = sh;
      
      if (sw > MAX_WIDTH) {
        finalWidth = MAX_WIDTH;
        finalHeight = Math.round(MAX_WIDTH * (sh / sw));
      }

      const canvas = document.createElement('canvas');
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      const ctx = canvas.getContext('2d');
      if (mirror) {
        ctx.translate(finalWidth, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, finalWidth, finalHeight);
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
