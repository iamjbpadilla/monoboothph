import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { Device } from '@capacitor/device';
import { supabase } from '../lib/supabase';
import { Lock, AlertCircle } from 'lucide-react';

const PAIRING_EXPIRY_HOURS = 24;

export default function PairingModal({ onPaired }) {
  const [pairingCode, setPairingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    getDeviceId();
  }, []);

  async function getDeviceId() {
    try {
      const info = await Device.getId();
      setDeviceId(info.identifier);
    } catch (err) {
      console.error('Failed to get device ID:', err);
    }
  }

  async function handlePair() {
    if (!pairingCode.trim() || pairingCode.length !== 6) {
      setError('Please enter a valid 6-digit pairing code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate pairing code against Supabase
      const { data: app, error } = await supabase
        .from('apps')
        .select('*')
        .eq('pairing_code', pairingCode)
        .single();

      if (error || !app) {
        setError('Invalid pairing code');
        setLoading(false);
        return;
      }

      // Create or update device record
      const { data: device, error: deviceError } = await supabase
        .from('devices')
        .upsert({
          device_id: deviceId,
          app_id: app.id,
          device_name: `Device ${deviceId.slice(0, 8)}`,
          status: 'online',
          last_sync: new Date().toISOString(),
        })
        .select()
        .single();

      if (deviceError) throw deviceError;

      // Store pairing info locally
      const expiryTime = Date.now() + (PAIRING_EXPIRY_HOURS * 60 * 60 * 1000);
      await Preferences.set({
        key: 'snaproll_pairing',
        value: JSON.stringify({
          appId: app.id,
          deviceId: device.id,
          pairingCode: app.pairing_code,
          appName: app.name,
          pairedAt: new Date().toISOString(),
          expiresAt: new Date(expiryTime).toISOString(),
        }),
      });

      onPaired();
    } catch (err) {
      console.error('Pairing failed:', err);
      setError('Failed to pair device. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Pair Your Device</h2>
          <p className="text-gray-500 text-center mt-2">
            Enter the 6-digit pairing code from the admin portal
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={pairingCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setPairingCode(value);
                setError('');
              }}
              placeholder="000000"
              className="w-full text-center text-3xl font-mono tracking-widest px-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
              maxLength={6}
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            onClick={handlePair}
            disabled={loading || pairingCode.length !== 6}
            className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Pairing...' : 'Pair Device'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            Pairing expires after {PAIRING_EXPIRY_HOURS} hours for security
          </p>
        </div>
      </div>
    </div>
  );
}
