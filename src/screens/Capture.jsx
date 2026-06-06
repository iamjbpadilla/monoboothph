import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, Camera } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';
import { useCamera } from '../hooks/useCamera.js';
import { SLOT_RATIOS } from '../lib/canvasCompositor.js';
import { playShutter, playBeep, playClick } from '../hooks/useSound.js';
import CountdownOverlay from '../components/CountdownOverlay.jsx';
import ThumbnailStrip from '../components/ThumbnailStrip.jsx';

const SHOT_COUNTS = { '1strip': 1, '2strip': 2, '3strip': 3, '4grid': 4, '2x3-landscape': 6, '2x3-portrait': 6 };

const RETAKE_MESSAGES = [
  'Cleaning the lens…',
  'Wiping off fingerprints…',
  'Adjusting the mirrors…',
  'Polishing the glass…',
  'Calibrating flash…',
  'Smiling storage check…',
  'Recharging photons…',
  'Straightening the backdrop…',
  // --- NEW FUN & WITTY ADDITIONS ---
  'Searching for the perfect lighting…',
  'Un-blinking the pixels…',
  'Booting up the smile-o-meter…',
  'Tuning the laughter engine…',
  'Checking if your hair looks awesome (it does!)…',
  'Shaking up the digital confetti…',
  'Polishing the sparkle pixels…',
  'Loading maximum photogenic energy…',
  'Double-checking the awesome levels…',
  'Inflating the digital balloons…',
  'Ironing out the background wrinkles…',
  'Waking up the camera sensor…',
  'Calculating the perfect camera angle…',
  'Sprinkling extra magic on the lens…',
  'Sending the bad photo to the recycle bin…',
  'Asking the camera nicely to take another one…',
  'Preparing the hype-machine…',
  'Gearing up for round two…',
  'Scanning for epic poses…',
  'Dusting off the lens caps…',
  'Adding a pinch of awesome…',
  'Upgrading your smile resolution…',
  'Checking the vibe levels… 100%!',
  'Resetting the countdown timer…',
];

const POSE_SUGGESTIONS = [
  'Strike a pose!',
  'Make a funny face!',
  'Look at the camera!',
  'Smile big!',
  'Do a silly hand sign!',
  'Wink at the camera!',
  'Throw a peace sign!',
  'Look surprised!',
  'Act dramatic!',
  'Be yourself!',
  'Cross your arms!',
  'Lean in close!',
  'Tilt your head!',
  'Make a heart shape!',
  'Give a thumbs up!',
  'Look away dreamily!',
  'Pout your lips!',
  'Raise your eyebrows!',
  'Put hands on hips!',
  'Make a goofy expression!',
  // --- NEW FUN & WITTY ADDITIONS ---
  'Pretend you just won a gold medal!',
  'Do your best secret agent look!',
  'Freeze! Like a statue!',
  'High five the person next to you!',
  'Show off your invisible muscles!',
  'Pretend you are walking against the wind!',
  'The floor is lava! Look terrified!',
  'Point at your friend like they just won a prize!',
  'Look like you just heard the best joke ever!',
  'Do the robot dance pose!',
  'Pretend you are a runway supermodel!',
  'Hide half your face behind your hands!',
  'Do a rock star air guitar solo!',
  'Look like you are thinking really hard!',
  'Give the camera a cool secret agent nod!',
  'Pretend you are holding a giant invisible sandwich!',
  'Make a cute puppy-dog face!',
  'Act like you just opened the coolest birthday gift!',
  'Do the classic superhero landing pose!',
  'Wave like you are on a parade float!',
  'Salute the captain!',
  'Pretend you are a ninja hiding in plain sight!',
  'Lean back and look ultra cool!',
  'Put your chin on your hand like a deep thinker!',
  'Do a double thumbs up!',
  'Make an explosion sign with your hands!',
  'Pretend you are an opera singer hitting a high note!',
  'Do a symmetrical mirror pose with a friend!',
  'Look like a cool detective solving a mystery!',
  'Give a big, enthusiastic high-five to the air!',
  'Act like you just discovered a new planet!',
  'Cup your face in your hands!',
  'Do a silly karate chop pose!',
  'Look over your shoulder with a mysterious grin!',
];

export default function Capture({ templateKey, onComplete, onBack }) {
  const { settings } = useSettings();
  const homeScreen = settings.homeScreen || {};
  const { camera, capture: capSettings } = settings;
  const isDark = settings.general.theme === 'dark';

  const ratio = SLOT_RATIOS[templateKey];
  const totalShots = SHOT_COUNTS[templateKey];

  const { videoRef, status, error, captureFrame, stopCamera } = useCamera({
    deviceId: camera.deviceId,
    resolution: camera.resolution,
    mirror: camera.mirror,
  });

  const [frames, setFrames] = useState([]);
  const [shotIndex, setShotIndex] = useState(0); // which shot we're on (0-based)
  const [phase, setPhase] = useState('get-ready'); // 'get-ready' | 'countdown' | 'captured' | 'cleaning'
  const [countdownKey, setCountdownKey] = useState(0);
  const [cleanMsgIndex, setCleanMsgIndex] = useState(0);
  const [poseIndex, setPoseIndex] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const getReadyTimerRef = useRef(null);
  const cleanTimerRef = useRef(null);
  const poseTimerRef = useRef(null);

  // Start first shot after camera is ready
  useEffect(() => {
    if (status === 'active' && phase === 'get-ready') {
      getReadyTimerRef.current = setTimeout(() => {
        setPhase('countdown');
      }, 1200);
    }
    return () => clearTimeout(getReadyTimerRef.current);
  }, [status, phase]);

  // Cycle pose suggestions during get-ready phase
  useEffect(() => {
    if (phase === 'get-ready' && status === 'active') {
      setPoseIndex(Math.floor(Math.random() * POSE_SUGGESTIONS.length));
      poseTimerRef.current = setInterval(() => {
        setPoseIndex(i => (i + 1) % POSE_SUGGESTIONS.length);
      }, 2000);
    }
    return () => clearInterval(poseTimerRef.current);
  }, [phase, status]);

  const handleCaptured = useCallback(() => {
    const dataUrl = captureFrame(ratio);
    if (!dataUrl) {
      // retry countdown
      setCountdownKey(k => k + 1);
      setPhase('countdown');
      return;
    }

    playShutter();
    const newFrames = [...frames, dataUrl];
    setFrames(newFrames);
    setPhase('captured');

    if (newFrames.length >= totalShots) {
      // All shots done — quick flash-only hand-off to Composing.
      setVideoReady(false);
      setTimeout(() => {
        stopCamera();
        onComplete(newFrames);
      }, 250);
    } else {
      // Next shot
      setTimeout(() => {
        setShotIndex(newFrames.length);
        setPhase('get-ready');
        setTimeout(() => {
          setCountdownKey(k => k + 1);
          setPhase('countdown');
        }, 1200);
      }, 400);
    }
  }, [captureFrame, ratio, frames, totalShots, stopCamera, onComplete]);

  function handleRetake() {
    setPhase('cleaning');
    setCleanMsgIndex(Math.floor(Math.random() * RETAKE_MESSAGES.length));

    // Rotate messages every 1200ms
    cleanTimerRef.current = setInterval(() => {
      setCleanMsgIndex(i => (i + 1) % RETAKE_MESSAGES.length);
    }, 1200);

    // After 3s of "cleaning", restart
    setTimeout(() => {
      clearInterval(cleanTimerRef.current);
      setFrames([]);
      setShotIndex(0);
      setPhase('get-ready');
      setCountdownKey(k => k + 1);
      setTimeout(() => {
        setCountdownKey(k => k + 1);
        setPhase('countdown');
      }, 1200);
    }, 3000);
  }

  function handleBack() {
    playClick();
    clearInterval(cleanTimerRef.current);
    stopCamera();
    onBack();
  }

  // ResizeObserver: compute exact frame pixel dimensions so video is never 0×0
  const cameraAreaRef = useRef(null);
  const [frameSize, setFrameSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = cameraAreaRef.current;
    if (!el) return;
    const PADDING = 32; // 16px each side (p-4)
    const obs = new ResizeObserver(([entry]) => {
      const aw = entry.contentRect.width - PADDING;
      const ah = entry.contentRect.height - PADDING;
      const targetAr = ratio.w / ratio.h;
      const containerAr = aw / ah;
      let fw, fh;
      if (containerAr > targetAr) {
        fh = ah;
        fw = Math.floor(ah * targetAr);
      } else {
        fw = aw;
        fh = Math.floor(aw / targetAr);
      }
      setFrameSize({ w: fw, h: fh });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ratio]);

  const FRAME_PAD = 12;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-md-surface">
      {/* Camera preview area — measured by ResizeObserver */}
      <div ref={cameraAreaRef} className="flex-1 flex items-center justify-center p-4 min-h-0 page-content-enter">
        {frameSize.w > 0 && (
          <div
            className="relative bg-white shadow-2xl flex-shrink-0"
            style={{ width: frameSize.w, height: frameSize.h, padding: FRAME_PAD }}
          >
            <div className="relative w-full h-full overflow-hidden rounded-sm">
              {/* Camera error state */}
              {(status === 'error' || error) && (
                <div className="absolute inset-0 bg-gray-200 flex flex-col items-center justify-center gap-2 z-10">
                  <Camera size={32} className="text-gray-500" />
                  <p className="text-gray-600 text-xs text-center px-4">{error || 'Camera unavailable'}</p>
                </div>
              )}

              {/* Video feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${!videoReady ? 'opacity-0' : 'opacity-100'}`}
                onLoadedMetadata={() => setVideoReady(true)}
                onCanPlay={() => setVideoReady(true)}
              />

              {/* Loading spinner while video is not ready */}
              {!videoReady && status !== 'error' && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                  <div className="w-12 h-12 border-4 border-gray-300 border-t-md-primary rounded-full animate-spin" />
                </div>
              )}

              {/* "Get Ready" overlay with pose suggestions */}
              {phase === 'get-ready' && status === 'active' && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-4 z-20 get-ready-overlay">
                  <div className="get-ready-text text-white font-black text-2xl drop-shadow-lg text-center">
                    {shotIndex === 0 ? 'Get Ready!' : `Shot ${shotIndex + 1}`}
                  </div>
                  {capSettings.poseSuggestionsEnabled && (
                    <div className="pose-text text-white font-bold text-3xl drop-shadow-lg animate-pulse text-center px-8">
                      {POSE_SUGGESTIONS[poseIndex]}
                    </div>
                  )}
                </div>
              )}

              {/* Retake "cleaning" overlay */}
              {phase === 'cleaning' && (
                <div className="absolute inset-0 bg-black/60 flex flex-col z-20 overlay-fade-in">
                  {/* Booth identity — top (follows PrintStatus format) */}
                  <div className="absolute top-8 flex flex-col items-center gap-0.5">
                    {homeScreen.title?.text && (
                      <p className="text-base font-semibold text-white tracking-wide">
                        {homeScreen.title.text}
                      </p>
                    )}
                    {homeScreen.subtitle?.text && (
                      <p className="text-xs text-white/80 tracking-widest uppercase">{homeScreen.subtitle.text}</p>
                    )}
                  </div>
                  
                  {/* Center content */}
                  <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    {capSettings.retakeMessagesEnabled && (
                      <p className="text-white font-medium text-lg drop-shadow-lg text-center px-6 transition-opacity duration-300">
                        {RETAKE_MESSAGES[cleanMsgIndex]}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Countdown */}
              {phase === 'countdown' && (
                <CountdownOverlay
                  key={countdownKey}
                  seconds={capSettings.countdownSeconds}
                  flashEffect={capSettings.flashEffect}
                  onComplete={handleCaptured}
                />
              )}

            </div>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      <div className="flex-shrink-0 pb-4 bg-md-surface">
        <ThumbnailStrip
          frames={frames}
          totalShots={totalShots}
          templateKey={templateKey}
          frameSize={frameSize}
        />
      </div>
    </div>
  );
}
