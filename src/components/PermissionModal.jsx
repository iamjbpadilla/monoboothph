import { useState, useEffect } from 'react';
import { Camera } from '@capacitor/camera';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { Preferences } from '@capacitor/preferences';
import { playClick } from '../hooks/useSound.js';

const CAMERA_PERMISSION_KEY = 'snaproll-camera-granted';
const BLUETOOTH_PERMISSION_KEY = 'snaproll-bluetooth-granted';

export default function PermissionModal({ onPermissionGranted, onPermissionDenied }) {
  const [status, setStatus] = useState('checking'); // checking | requesting | granted | denied
  const [isExiting, setIsExiting] = useState(false);
  const [currentPermission, setCurrentPermission] = useState('camera'); // camera | bluetooth

  useEffect(() => {
    checkPermission();
  }, []);

  async function checkPermission() {
    try {
      // Check camera permission first
      const { value: cameraGranted } = await Preferences.get({ key: CAMERA_PERMISSION_KEY });
      if (cameraGranted !== 'true') {
        setStatus('requesting');
        setCurrentPermission('camera');
        return;
      }

      // Check Bluetooth permission
      const { value: bluetoothGranted } = await Preferences.get({ key: BLUETOOTH_PERMISSION_KEY });
      if (bluetoothGranted !== 'true') {
        setStatus('requesting');
        setCurrentPermission('bluetooth');
        return;
      }

      // Both permissions granted
      setStatus('granted');
      onPermissionGranted();
    } catch (err) {
      console.error('Permission check failed:', err);
      setStatus('requesting');
    }
  }

  async function handleAllow() {
    playClick();
    try {
      if (currentPermission === 'camera') {
        const result = await Camera.requestPermissions({ permissions: ['camera'] });
        console.log('Camera permission request result:', result);

        if (result.camera === 'granted') {
          await Preferences.set({ key: CAMERA_PERMISSION_KEY, value: 'true' });
          // Move to Bluetooth permission
          setCurrentPermission('bluetooth');
        } else {
          setIsExiting(true);
          setTimeout(() => {
            setStatus('denied');
            onPermissionDenied();
          }, 300);
        }
      } else if (currentPermission === 'bluetooth') {
        // Initialize Bluetooth to trigger permission request
        await BleClient.initialize();
        await Preferences.set({ key: BLUETOOTH_PERMISSION_KEY, value: 'true' });
        setIsExiting(true);
        setTimeout(() => {
          setStatus('granted');
          onPermissionGranted();
        }, 300);
      }
    } catch (err) {
      console.error('Permission request failed:', err);
      setIsExiting(true);
      setTimeout(() => {
        setStatus('denied');
        onPermissionDenied();
      }, 300);
    }
  }

  function handleDeny() {
    playClick();
    setIsExiting(true);
    setTimeout(() => {
      setStatus('denied');
      onPermissionDenied();
    }, 300);
  }

  if (status === 'granted') {
    return null;
  }

  const isCamera = currentPermission === 'camera';
  const title = isCamera ? 'Camera Permission Required' : 'Bluetooth Permission Required';
  const description = isCamera
    ? 'Snap&Roll needs access to your camera to capture photos. This permission is required for the app to function.'
    : 'Snap&Roll needs Bluetooth access to connect to printers. This permission is required for printing functionality.';

  return (
    <div className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 transition-all duration-300 ${
      isExiting ? 'animate-out fade-out' : 'animate-in fade-in'
    }`}>
      <div className={`bg-md-surface rounded-2xl max-w-md w-full p-6 shadow-2xl transition-all duration-300 ${
        isExiting ? 'animate-out slide-out-to-bottom-8 scale-95 opacity-0' : 'animate-in slide-in-from-bottom-8'
      }`}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-md-primary-container rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            {isCamera ? (
              <svg className="w-8 h-8 text-md-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-md-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <h2 className="text-2xl font-semibold text-md-on-surface mb-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">{title}</h2>
          <p className="text-md-on-surface-variant animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            {description}
          </p>
        </div>
        <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <button
            onClick={handleDeny}
            className="flex-1 py-3 rounded-lg font-medium text-md-on-surface-variant border border-md-outline hover:bg-md-surface-container-highest transition-all duration-200 active:scale-95"
          >
            Deny
          </button>
          <button
            onClick={handleAllow}
            className="flex-1 py-3 rounded-lg font-medium bg-md-primary text-md-on-primary hover:brightness-110 transition-all duration-200 active:scale-95"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
}
