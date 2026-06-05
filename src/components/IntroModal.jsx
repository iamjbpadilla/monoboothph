import { useState, useEffect, useRef } from 'react';
import { Camera, Sparkles, ChevronRight, X, AlertCircle, RefreshCw } from 'lucide-react';
import { Preferences } from '@capacitor/preferences';
import { Camera as CapacitorCamera } from '@capacitor/camera';
import { playClick } from '../hooks/useSound.js';

const INTRO_COMPLETED_KEY = 'snaproll_intro_completed';

const STEPS = [
  {
    icon: Sparkles,
    title: 'Welcome to MONO BOOTH PH',
    subtitle: 'NO PROOFS? SHOW \'EM THE RECEIPTS!',
    description: 'Your modern photobooth experience. Capture memories, print receipts, and share moments instantly.',
  },
  {
    icon: Camera,
    title: 'Capture Your Best Moments',
    subtitle: 'Professional Photobooth Services',
    description: 'Choose from beautiful templates, customize your receipts, and create memories that last forever.',
  },
  {
    icon: ChevronRight,
    title: 'Let\'s Get Started',
    subtitle: 'Camera Permission Required',
    description: 'We need camera access to capture your photos. This is essential for the photobooth experience.',
  },
];

export default function IntroModal({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('pending'); // pending, granted, denied
  const [permissionError, setPermissionError] = useState(null);
  const [requestingPermission, setRequestingPermission] = useState(false);
  const stepRef = useRef(null);

  useEffect(() => {
    async function checkIntro() {
      const { value } = await Preferences.get({ key: INTRO_COMPLETED_KEY });
      if (value === 'true') {
        onComplete();
      } else {
        setLoading(false);
      }
    }
    checkIntro();
  }, [onComplete]);

  function handleNext() {
    playClick();
    if (currentStep < STEPS.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      }, 600);
    } else {
      handleComplete();
    }
  }

  async function requestCameraPermission() {
    setRequestingPermission(true);
    setPermissionError(null);
    
    try {
      const result = await CapacitorCamera.requestPermissions({ permissions: ['camera'] });
      
      if (result.camera === 'granted' || result.camera === 'limited') {
        setPermissionStatus('granted');
        setTimeout(() => handleComplete(), 800);
      } else {
        setPermissionStatus('denied');
        setPermissionError('Camera permission is required to use the photobooth. Please grant access to continue.');
      }
    } catch (error) {
      console.error('Permission request error:', error);
      setPermissionStatus('denied');
      setPermissionError('Failed to request camera permission. Please try again.');
    } finally {
      setRequestingPermission(false);
    }
  }

  async function handleComplete() {
    setIsExiting(true);
    await Preferences.set({ key: INTRO_COMPLETED_KEY, value: 'true' });
    setTimeout(() => {
      setCompleted(true);
      onComplete();
    }, 500);
  }

  if (loading || completed) return null;

  const step = STEPS[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className={`fixed inset-0 bg-gray-50 flex items-center justify-center z-50 p-4 transition-all duration-700 ${
      isExiting ? 'animate-out fade-out' : 'animate-in fade-in'
    }`}>
      {/* Close button (only show on first step) */}
      {currentStep === 0 && (
        <button
          onClick={() => {
            playClick();
            handleComplete();
          }}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={24} />
        </button>
      )}

      <div 
        ref={stepRef}
        className={`relative bg-white border-2 border-gray-200 rounded-xl max-w-lg w-full p-8 shadow transition-all duration-700 ease-out ${
          isExiting ? 'animate-out slide-out-to-bottom-8 scale-95 opacity-0' : isTransitioning ? 'opacity-0 scale-95' : 'animate-in slide-in-from-bottom-8'
        }`}>
        {/* Icon */}
        <div className="text-center mb-8">
          <div className={`w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-700 ease-out ${
            isTransitioning ? 'scale-0' : 'scale-100'
          }`}>
            <Icon className={`w-6 h-6 text-white transition-all duration-700 ease-out ${
              isTransitioning ? 'scale-0' : 'scale-100'
            }`} />
          </div>
          
          {/* Title */}
          <h2 className={`text-3xl font-bold text-black mb-2 transition-all duration-700 ease-out ${
            isTransitioning ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'
          }`}>
            {step.title}
          </h2>
          
          {/* Subtitle */}
          {step.subtitle && (
            <p className={`text-sm text-black font-medium uppercase tracking-wider mb-4 transition-all duration-700 ease-out delay-100 ${
              isTransitioning ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'
            }`}>
              {step.subtitle}
            </p>
          )}
          
          {/* Description */}
          <p className={`text-gray-500 text-sm leading-relaxed transition-all duration-700 ease-out delay-200 ${
            isTransitioning ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'
          }`}>
            {step.description}
          </p>
        </div>

        {/* Permission Error */}
        {permissionStatus === 'denied' && permissionError && (
          <div className={`mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl transition-all duration-500 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{permissionError}</p>
            </div>
          </div>
        )}

        {/* Progress dots */}
        <div className={`flex justify-center gap-2 mb-8 transition-all duration-700 ease-out delay-300 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}>
          {STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-500 ease-out ${
                index === currentStep
                  ? 'w-12 bg-black'
                  : index < currentStep
                  ? 'w-2 bg-gray-400'
                  : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        {isLastStep ? (
          <div className={`space-y-3 transition-all duration-700 ease-out delay-400 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}>
            {permissionStatus === 'denied' ? (
              <button
                onClick={requestCameraPermission}
                disabled={requestingPermission}
                className="w-full py-3 rounded-lg font-bold text-sm bg-black text-white hover:opacity-90 transition-all duration-300 ease-out flex items-center justify-center gap-2 border-2 border-black"
              >
                {requestingPermission ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : null}
                {requestingPermission ? 'Requesting...' : 'Try Again'}
              </button>
            ) : permissionStatus === 'granted' ? (
              <div className="w-full py-3 rounded-lg font-bold text-sm bg-green-500 text-white flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Permission Granted!
              </div>
            ) : (
              <button
                onClick={requestCameraPermission}
                disabled={requestingPermission}
                className="w-full py-3 rounded-lg font-bold text-sm bg-black text-white hover:opacity-90 transition-all duration-300 ease-out flex items-center justify-center gap-2 border-2 border-black"
              >
                {requestingPermission ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : <Camera className="w-4 h-4" />}
                {requestingPermission ? 'Requesting...' : 'Allow Camera Access'}
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={handleNext}
            disabled={isTransitioning}
            className={`w-full py-3 rounded-lg font-bold text-sm bg-black text-white hover:opacity-90 transition-all duration-300 ease-out flex items-center justify-center gap-2 border-2 border-black ${
              isTransitioning ? 'opacity-50' : 'opacity-100'
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Footer branding */}
        <div className={`mt-6 text-center transition-all duration-700 ease-out delay-500 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}>
          <p className="text-xs text-gray-400 tracking-widest uppercase">MONO BOOTH PH</p>
        </div>
      </div>
    </div>
  );
}
