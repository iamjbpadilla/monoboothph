import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { getSupabaseClient, checkSupabaseConnection } from '../lib/supabase';

export default function PairingModal({ onPaired, onClose }) {
  const [pairingCode, setPairingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('checking'); // checking, connected, error

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    setConnectionStatus('checking');
    const connected = await checkSupabaseConnection();
    setConnectionStatus(connected ? 'connected' : 'error');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!pairingCode.trim()) return;

    setLoading(true);
    setError('');

    try {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase not available');
      }

      // Find app with this pairing code
      const { data: app, error: appError } = await supabase
        .from('apps')
        .select('*')
        .eq('pairing_code', pairingCode.trim())
        .single();

      if (appError || !app) {
        throw new Error('Invalid pairing code');
      }

      // Check for existing online devices for this app and unpair them
      const { data: existingDevices } = await supabase
        .from('devices')
        .select('*')
        .eq('app_id', app.id)
        .eq('status', 'online');

      if (existingDevices && existingDevices.length > 0) {
        console.log(`Unpairing ${existingDevices.length} existing device(s) for this app`);
        await supabase
          .from('devices')
          .update({ status: 'offline', last_sync: new Date().toISOString() })
          .eq('app_id', app.id)
          .eq('status', 'online');
      }

      // Create device record
      const deviceId = generateDeviceId();
      console.log('Registering device:', { app_id: app.id, device_id: deviceId });
      
      const { data: device, error: deviceError } = await supabase
        .from('devices')
        .insert({
          app_id: app.id,
          device_id: deviceId,
          device_name: `Device ${Date.now()}`,
          status: 'online',
          last_sync: new Date().toISOString(),
        })
        .select()
        .single();

      if (deviceError) {
        console.error('Device registration error:', deviceError);
        throw new Error(`Device registration failed: ${deviceError.message}`);
      }
      
      if (!device) {
        throw new Error('Device registration returned no data');
      }

      // Store pairing info locally
      const pairingData = {
        appId: app.id,
        deviceId: device.id,
        appName: app.name,
        pairingCode: app.pairing_code,
        pairedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };

      await Preferences.set({
        key: 'snaproll_pairing',
        value: JSON.stringify(pairingData),
      });

      onPaired(pairingData);
    } catch (err) {
      console.error('Pairing failed:', err);
      setError(err.message || 'Pairing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function generateDeviceId() {
    return `dev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  function handleNumberPad(num) {
    if (pairingCode.length < 6) {
      setPairingCode(pairingCode + num);
    }
  }

  function handleBackspace() {
    setPairingCode(pairingCode.slice(0, -1));
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">Pair with Portal</h2>
        
        {/* Connection Status */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {connectionStatus === 'checking' && (
            <>
              <div className="w-3 h-3 rounded-full bg-gray-400 animate-pulse" />
              <span className="text-sm text-gray-600">Checking connection...</span>
            </>
          )}
          {connectionStatus === 'connected' && (
            <>
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-green-600">Connected to database</span>
            </>
          )}
          {connectionStatus === 'error' && (
            <>
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-red-600">Database unavailable</span>
            </>
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <p className="text-gray-600 mb-4 text-sm text-center">
          Enter the 6-digit pairing code from the portal
        </p>

        {/* Pairing Code Display */}
        <div className="flex justify-center gap-2 mb-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-12 h-14 border-2 border-gray-300 rounded-lg flex items-center justify-center text-2xl font-bold bg-gray-50"
            >
              {pairingCode[i] || ''}
            </div>
          ))}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleNumberPad(num.toString())}
              className="h-16 text-2xl font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleBackspace}
            className="h-16 text-xl font-semibold bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition active:scale-95"
          >
            ⌫
          </button>
          <button
            type="button"
            onClick={() => handleNumberPad('0')}
            className="h-16 text-2xl font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || pairingCode.length !== 6}
            className="h-16 text-xl font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '...' : '✓'}
          </button>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition text-sm font-medium"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={checkConnection}
            className="flex-1 px-4 py-3 text-purple-600 hover:bg-purple-50 rounded-lg transition text-sm font-medium"
          >
            Retry Connection
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          You can pair later from Settings if you skip now.
        </p>
      </div>
    </div>
  );
}
