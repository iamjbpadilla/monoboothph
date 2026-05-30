import { useState, useEffect } from 'react';
import { Camera } from '@capacitor/camera';
import { playClick } from '../hooks/useSound.js';

export default function PermissionModal({ onPermissionGranted, onPermissionDenied }) {
  const [status, setStatus] = useState('checking'); // checking | requesting | granted | denied

  useEffect(() => {
    checkPermission();
  }, []);

  async function checkPermission() {
    try {
      const result = await Camera.checkPermissions();
      if (result.camera === 'granted') {
        setStatus('granted');
        onPermissionGranted();
      } else {
        setStatus('requesting');
      }
    } catch (err) {
      console.error('Permission check failed:', err);
      setStatus('requesting');
    }
  }

  async function handleAllow() {
    playClick();
    try {
      const result = await Camera.requestPermissions({ permissions: ['camera'] });
      if (result.camera === 'granted') {
        setStatus('granted');
        onPermissionGranted();
      } else {
        setStatus('denied');
        onPermissionDenied();
      }
    } catch (err) {
      console.error('Permission request failed:', err);
      setStatus('denied');
      onPermissionDenied();
    }
  }

  function handleDeny() {
    playClick();
    setStatus('denied');
    onPermissionDenied();
  }

  if (status === 'granted') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-md-surface rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-md-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-md-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-md-on-surface mb-2">Camera Permission Required</h2>
          <p className="text-md-on-surface-variant">
            Snap&Roll needs access to your camera to capture photos. This permission is required for the app to function.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDeny}
            className="flex-1 py-3 rounded-lg font-medium text-md-on-surface-variant border border-md-outline hover:bg-md-surface-container-highest transition-colors"
          >
            Deny
          </button>
          <button
            onClick={handleAllow}
            className="flex-1 py-3 rounded-lg font-medium bg-md-primary text-md-on-primary hover:brightness-110 transition-colors"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
}
