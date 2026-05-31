import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { Link, Clock, CheckCircle, XCircle, AlertCircle, LogOut } from 'lucide-react';

const PAIRING_EXPIRY_HOURS = 24;

export default function PairingSettings() {
  const [pairing, setPairing] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    loadPairingStatus();
  }, []);

  useEffect(() => {
    if (!pairing) return;

    const updateCountdown = () => {
      const now = Date.now();
      const expiry = new Date(pairing.expiresAt).getTime();
      const remaining = expiry - now;

      if (remaining <= 0) {
        setTimeRemaining(null);
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [pairing]);

  async function loadPairingStatus() {
    try {
      const pairingValue = await Preferences.get({ key: 'snaproll_pairing' });
      if (pairingValue.value) {
        const parsed = JSON.parse(pairingValue.value);
        const now = Date.now();
        const expiry = new Date(parsed.expiresAt).getTime();

        if (now < expiry) {
          setPairing(parsed);
        } else {
          // Expired, clear it
          await Preferences.remove({ key: 'snaproll_pairing' });
          setPairing(null);
        }
      }
    } catch (err) {
      console.error('Failed to load pairing status:', err);
    }
  }

  async function handleUnpair() {
    if (!confirm('Are you sure you want to unpair this device? You will need to enter the pairing code again.')) {
      return;
    }

    try {
      await Preferences.remove({ key: 'snaproll_pairing' });
      setPairing(null);
      setTimeRemaining(null);
      // Reload the app to show pairing modal
      window.location.reload();
    } catch (err) {
      console.error('Failed to unpair:', err);
      alert('Failed to unpair device');
    }
  }

  if (!pairing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-900">Device Not Paired</p>
            <p className="text-sm text-yellow-700">Enter the pairing code from the admin portal to connect this device.</p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition"
        >
          <Link className="w-5 h-5" />
          Enter Pairing Code
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <div>
          <p className="font-medium text-green-900">Device Paired</p>
          <p className="text-sm text-green-700">Connected to: {pairing.appName}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 text-sm">
          <Link className="w-5 h-5 text-gray-500" />
          <span className="text-gray-600">App Name:</span>
          <span className="font-medium text-gray-900">{pairing.appName}</span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Clock className="w-5 h-5 text-gray-500" />
          <span className="text-gray-600">Paired at:</span>
          <span className="font-medium text-gray-900">
            {new Date(pairing.pairedAt).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Clock className="w-5 h-5 text-gray-500" />
          <span className="text-gray-600">Time remaining:</span>
          <span className="font-medium text-gray-900">
            {timeRemaining || 'Calculating...'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-gray-500" />
          <span className="text-gray-600">Pairing code:</span>
          <span className="font-mono font-medium text-gray-900">{pairing.pairingCode}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleUnpair}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium hover:bg-red-100 transition"
        >
          <LogOut className="w-5 h-5" />
          Unpair Device
        </button>
      </div>
    </div>
  );
}
