import { useState, useEffect, useRef, useCallback } from 'react';
import { SettingsProvider, useSettings } from './context/SettingsContext.jsx';
import { SnackbarProvider, useSnackbar } from './context/SnackbarContext.jsx';
import { Preferences } from '@capacitor/preferences';
import { Camera } from '@capacitor/camera';
import { applyAccent, resolveFontPair } from './lib/theme.js';
import { playTransition } from './hooks/useSound.js';
import { useDeviceHeartbeat } from './hooks/useDeviceHeartbeat.js';
import { useDeviceStatusSync } from './hooks/useDeviceStatusSync.js';
import { logError, logInfo, logStep } from './lib/errorLogger.js';
import './lib/logger.js';
import SettingsPanel from './components/SettingsPanel.jsx';
import PermissionModal from './components/PermissionModal.jsx';
import IntroModal from './components/IntroModal.jsx';
import PairingModal from './components/PairingModal.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Standby from './screens/Standby.jsx';
import TemplateSelect from './screens/TemplateSelect.jsx';
import Capture from './screens/Capture.jsx';
import PrintPreview from './screens/PrintPreview.jsx';
import PrintStatus from './screens/PrintStatus.jsx';
import Advertising from './screens/Advertising.jsx';

const RETAKE_MESSAGES = [
  'Cleaning the lens…',
  'Wiping off fingerprints…',
  'Adjusting the mirrors…',
  'Polishing the glass…',
  'Calibrating flash…',
  'Smiling storage check…',
  'Recharging photons…',
  'Straightening the backdrop…',
];

function CleaningScreen({ onDone }) {
  const { settings } = useSettings();
  const { boothName, eventName } = settings.general;
  const [msgIndex, setMsgIndex] = useState(Math.floor(Math.random() * RETAKE_MESSAGES.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(i => (i + 1) % RETAKE_MESSAGES.length);
    }, 600);
    const timeout = setTimeout(onDone, 3000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onDone]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-8 bg-md-surface relative overlay-fade-in">
      {/* Branding header — large */}
      <div className="absolute top-10 flex flex-col items-center gap-1">
        <p className="text-2xl font-bold text-md-on-surface tracking-wide">
          {boothName || 'MONO BOOTH PH'}
        </p>
        {eventName && (
          <p className="text-base text-md-on-surface-variant tracking-widest uppercase">{eventName}</p>
        )}
      </div>

      <div className="w-16 h-16 border-[5px] border-md-primary/20 border-t-md-primary rounded-full animate-spin" />
      <p key={msgIndex} className="text-2xl font-semibold text-md-on-surface text-center px-8 message-fade">
        {RETAKE_MESSAGES[msgIndex]}
      </p>

      {/* Branding footer */}
      <div className="absolute bottom-8 flex flex-col items-center gap-0.5 animate-in fade-in duration-700 delay-400">
        <p className="text-sm font-semibold text-md-on-surface-variant tracking-wider">MONO BOOTH PH</p>
        <p className="text-[10px] text-md-outline tracking-widest uppercase">No proof without @monoboothph</p>
        <p className="text-[10px] text-md-on-surface-variant">📍 Kabankalan City & Beyond</p>
      </div>
    </div>
  );
}

function ComposingScreen({ onDone }) {
  const { settings } = useSettings();
  const { boothName, eventName } = settings.general;

  useEffect(() => {
    const t = setTimeout(onDone, 1600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-10 bg-md-surface relative overflow-hidden">
      {/* Large branded title */}
      <div className="flex flex-col items-center gap-3 z-10 composing-text">
        <p className="text-4xl font-bold text-md-on-surface tracking-tight">
          {boothName || 'MONO BOOTH PH'}
        </p>
        {eventName && (
          <p className="text-xl text-md-on-surface-variant tracking-widest uppercase">{eventName}</p>
        )}
      </div>

      {/* Progress spinner + text */}
      <div className="flex flex-col items-center gap-5 z-10 composing-text" style={{ animationDelay: '400ms' }}>
        <div className="w-14 h-14 rounded-full border-[4px] border-md-primary/20 border-t-md-primary animate-spin" />
        <div className="text-center">
          <p className="text-2xl font-semibold text-md-on-surface">Composing your print…</p>
          <p className="text-lg text-md-on-surface-variant mt-2">Just a moment</p>
        </div>
      </div>

      {/* Branding footer */}
      <div className="absolute bottom-8 flex flex-col items-center gap-0.5 z-10 composing-text" style={{ animationDelay: '600ms' }}>
        <p className="text-sm font-semibold text-md-on-surface-variant tracking-wider">MONO BOOTH PH</p>
        <p className="text-[10px] text-md-outline tracking-widest uppercase">No proof without @monoboothph</p>
        <p className="text-[10px] text-md-on-surface-variant">📍 Kabankalan City & Beyond</p>
      </div>
    </div>
  );
}

function useScreenStack() {
  const [screens, setScreens] = useState([{ id: 'initial', name: 'standby', phase: 'idle' }]);
  const currentNameRef = useRef('standby');
  const isTransitioningRef = useRef(false);
  const nextIdRef = useRef(1);
  const timeoutRef = useRef(null);

  useEffect(() => {
    currentNameRef.current = screens[screens.length - 1]?.name;
  }, [screens]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const navigateTo = useCallback((name) => {
    if (isTransitioningRef.current) return;
    if (currentNameRef.current === name) return;

    isTransitioningRef.current = true;
    playTransition();

    setScreens(prev => [
      ...prev.map(s => ({ ...s, phase: 'exit' })),
      { id: `screen-${nextIdRef.current++}`, name, phase: 'enter' },
    ]);

    timeoutRef.current = setTimeout(() => {
      setScreens(prev => [prev[prev.length - 1]]);
      isTransitioningRef.current = false;
      timeoutRef.current = null;
    }, 300);
  }, []);

  return { screens, navigateTo };
}

function PhotoboothApp() {
  const { settings } = useSettings();
  const { showSnackbar } = useSnackbar();
  const theme = settings.general.theme || 'dark';
  const openSettingsRef = useRef(null);

  logStep('INIT', 'PhotoboothApp component mounting');

  const { screens, navigateTo } = useScreenStack();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [capturedFrames, setCapturedFrames] = useState([]);
  const [captureSession, setCaptureSession] = useState(0);
  const [printImageUrl, setPrintImageUrl] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const [isPaired, setIsPaired] = useState(false);
  const [showPairingModal, setShowPairingModal] = useState(false);

  logStep('INIT', 'State initialized');

  // Start device heartbeat when paired
  useDeviceHeartbeat(isPaired);

  // Sync device status changes from server
  useDeviceStatusSync();

  useEffect(() => {
    logStep('THEME', 'Setting theme to:', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const pair = resolveFontPair(settings.general.fontPair);
    document.documentElement.style.setProperty('--font-heading', `'${pair.heading}', system-ui, sans-serif`);
    document.documentElement.style.fontFamily = `'${pair.body}', system-ui, sans-serif`;
  }, [settings.general.fontPair]);

  useEffect(() => {
    logStep('ACCENT', 'Setting accent color:', settings.general.accent);
    applyAccent(settings.general.accent || 'purple');
  }, [settings.general.accent]);

  // Check permissions and pairing status on mount
  useEffect(() => {
    logStep('PERM_CHECK', 'Starting permission check');
    async function checkPermissions() {
      try {
        // Increment local analytics sessions count on app start
        const analyticsValue = await Preferences.get({ key: 'snaproll_local_analytics' });
        const analytics = analyticsValue.value ? JSON.parse(analyticsValue.value) : { printCount: 0, imageUploads: 0, sessions: 0 };
        analytics.sessions += 1;
        await Preferences.set({ key: 'snaproll_local_analytics', value: JSON.stringify(analytics) });
        logStep('ANALYTICS', 'Local analytics sessions incremented:', analytics.sessions);
        
        logStep('PERM_CHECK', 'Fetching preferences');
        const [introValue, permValue, pairingValue] = await Promise.all([
          Preferences.get({ key: 'snaproll_intro_completed' }),
          Preferences.get({ key: 'snaproll-camera-granted' }),
          Preferences.get({ key: 'snaproll_pairing' }),
        ]);

        const introDone = introValue.value === 'true';
        const permDone = permValue.value === 'true';

        logStep('PERM_CHECK', `Intro done: ${introDone}, Perm done: ${permDone}`);
        setIntroCompleted(introDone);

        if (permDone) {
          logStep('PERM_CHECK', 'Permission already granted from prefs');
          setPermissionGranted(true);
        } else {
          // Check native permissions if not in preferences
          logStep('PERM_CHECK', 'Checking native camera permissions');
          const result = await Camera.checkPermissions();
          logStep('PERM_CHECK', `Camera permission: ${result.camera}`);
          if (result.camera === 'granted') {
            setPermissionGranted(true);
          }
        }

        // Check pairing status
        logStep('PAIRING', 'Checking pairing status');
        if (pairingValue.value) {
          const pairing = JSON.parse(pairingValue.value);
          const expiryTime = new Date(pairing.expiresAt).getTime();
          const now = Date.now();
          
          logStep('PAIRING', `Pairing expires at: ${new Date(expiryTime).toISOString()}`);
          if (now < expiryTime) {
            logStep('PAIRING', 'Pairing is valid');
            setIsPaired(true);
          } else {
            // Pairing expired, clear it
            await Preferences.remove({ key: 'snaproll_pairing' });
            setIsPaired(false);
          }
        }

        logStep('PERM_CHECK', 'Permission check complete, setting app ready');
        setAppReady(true);
      } catch (err) {
        console.error('Permission check failed:', err);
        await logError(err, 'PERM_CHECK');
        showSnackbar(`Error: ${err.message}`, 20000);
        setAppReady(true);
      }
    }
    checkPermissions();
  }, [showSnackbar]);

  // Periodic check for pairing expiry
  useEffect(() => {
    logStep('PAIRING_EXPIRY', 'Starting pairing expiry check interval');
    const interval = setInterval(async () => {
      try {
        const pairingValue = await Preferences.get({ key: 'snaproll_pairing' });
        if (pairingValue.value) {
          const pairing = JSON.parse(pairingValue.value);
          const expiryTime = new Date(pairing.expiresAt).getTime();
          const now = Date.now();
          
          if (now >= expiryTime) {
            // Pairing expired, clear it
            logStep('PAIRING_EXPIRY', 'Pairing expired, clearing');
            await Preferences.remove({ key: 'snaproll_pairing' });
            setIsPaired(false);
          }
        }
      } catch (err) {
        console.error('Pairing expiry check failed:', err);
        await logError(err, 'PAIRING_EXPIRY');
        showSnackbar(`Pairing check error: ${err.message}`, 20000);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [showSnackbar]);

  // Show pairing modal when on standby and not paired
  useEffect(() => {
    if (!appReady || !introCompleted || !permissionGranted) return;
    if (isPaired) return;
    
    const currentScreen = screens[screens.length - 1]?.name;
    if (currentScreen === 'standby') {
      setShowPairingModal(true);
    }
  }, [appReady, introCompleted, permissionGranted, isPaired, screens]);

  function goStandby() {
    setSelectedTemplate(null);
    setCapturedFrames([]);
    setPrintImageUrl(null);
    navigateTo('standby');
  }

  function handleTemplateSelect(templateKey) {
    setSelectedTemplate(templateKey);
    setCapturedFrames([]);
    setCaptureSession(s => s + 1);
    navigateTo('capture');
  }

  function handleCaptureComplete(frames) {
    setCapturedFrames(frames);
    navigateTo('composing');
  }

  function handleRetake() {
    setCapturedFrames([]);
    setCaptureSession(s => s + 1);
    navigateTo('cleaning');
  }

  function handlePrint(dataUrl) {
    // Increment local analytics print count
    Preferences.get({ key: 'snaproll_local_analytics' }).then(({ value }) => {
      const analytics = value ? JSON.parse(value) : { printCount: 0, imageUploads: 0, sessions: 0 };
      analytics.printCount += 1;
      Preferences.set({ key: 'snaproll_local_analytics', value: JSON.stringify(analytics) });
    }).catch(console.error);
    
    setPrintImageUrl(dataUrl);
    navigateTo('printStatus');
  }

  function handlePrintComplete() {
    if (settings.general.showAdvertising !== false) {
      navigateTo('advertising');
    } else {
      goStandby();
    }
  }

  function handlePaired(pairingData) {
    setIsPaired(true);
    setShowPairingModal(false);
  }

  function handlePairingClose() {
    setShowPairingModal(false);
  }

  function renderScreen(name) {
    switch (name) {
      case 'standby':
        return <Standby onStart={() => navigateTo('templateSelect')} onOpenSettings={(fn) => { openSettingsRef.current = fn; }} />;
      case 'templateSelect':
        return <TemplateSelect onSelect={handleTemplateSelect} onBack={() => navigateTo('standby')} />;
      case 'capture':
        return selectedTemplate ? (
          <Capture
            key={`${selectedTemplate}-${captureSession}`}
            templateKey={selectedTemplate}
            onComplete={handleCaptureComplete}
            onBack={() => navigateTo('templateSelect')}
          />
        ) : null;
      case 'printPreview':
        return selectedTemplate ? (
          <PrintPreview
            templateKey={selectedTemplate}
            frames={capturedFrames}
            onPrint={handlePrint}
            onRetake={handleRetake}
          />
        ) : null;
      case 'printStatus':
        return <PrintStatus imageDataUrl={printImageUrl} onHome={handlePrintComplete} />;
      case 'advertising':
        return <Advertising onComplete={goStandby} />;
      case 'composing':
        return <ComposingScreen frames={capturedFrames} onDone={() => navigateTo('printPreview')} />;
      case 'cleaning':
        return <CleaningScreen onDone={() => navigateTo('capture')} />;
      default:
        return null;
    }
  }

  // Branded loading screen
  if (!appReady) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-md-surface" data-theme={theme}>
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-[4px] border-md-primary/20 border-t-md-primary rounded-full animate-spin" />
          <p className="text-lg font-medium text-md-on-surface-variant">Loading MONO BOOTH PH…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden" data-theme={theme}>
      {screens.map(({ id, name, phase }) => (
        <div
          key={id}
          className={`absolute inset-0 w-full h-full ${phase === 'idle' ? '' : `md3-screen-${phase}`}`}
        >
          {renderScreen(name)}
        </div>
      ))}

      <SettingsPanel currentScreen={screens[screens.length - 1]?.name} onOpen={(fn) => { openSettingsRef.current = fn; }} />
      <IntroModal onComplete={() => setIntroCompleted(true)} />
      {introCompleted && !permissionGranted && (
        <PermissionModal
          onPermissionGranted={() => setPermissionGranted(true)}
          onPermissionDenied={() => setPermissionGranted(false)}
        />
      )}
      {introCompleted && permissionGranted && !isPaired && screens[screens.length - 1]?.name === 'standby' && showPairingModal && (
        <PairingModal onPaired={handlePaired} onClose={handlePairingClose} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <SnackbarProvider>
        <ErrorBoundary>
          <PhotoboothApp />
        </ErrorBoundary>
      </SnackbarProvider>
    </SettingsProvider>
  );
}
