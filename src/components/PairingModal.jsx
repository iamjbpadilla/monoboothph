import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-md-surface rounded-3xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-md-on-surface">Pair with Portal</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-md-surface-container-high transition-colors">
            <X size={20} className="text-md-on-surface-variant" />
          </button>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {connectionStatus === 'checking' && (
            <>
              <div className="w-3 h-3 rounded-full bg-md-outline animate-pulse" />
              <span className="text-sm text-md-on-surface-variant">Checking connection...</span>
            </>
          )}
          {connectionStatus === 'connected' && (
            <>
              <div className="w-3 h-3 rounded-full bg-md-primary" />
              <span className="text-sm text-md-primary">Connected to database</span>
            </>
          )}
          {connectionStatus === 'error' && (
            <>
              <div className="w-3 h-3 rounded-full bg-md-error" />
              <span className="text-sm text-md-error">Database unavailable</span>
            </>
          )}
        </div>
        
        {error && (
          <div className="bg-md-error-container border border-md-error text-md-on-error-container px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <p className="text-md-on-surface-variant mb-4 text-sm text-center">
          Enter the 6-digit pairing code from the portal
        </p>

        {/* Pairing Code Display */}
        <div className="flex justify-center gap-2 mb-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                i < pairingCode.length
                  ? 'bg-md-primary border-md-primary'
                  : 'border-md-outline bg-transparent'
              }`}
            >
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
              className="h-14 rounded-2xl text-xl font-medium transition-all active:scale-95 bg-md-surface-container text-md-on-surface hover:bg-md-surface-container-high"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-2xl text-xl font-medium transition-all active:scale-95 bg-md-surface-container-high text-md-on-surface hover:bg-md-surface-container-highest"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => handleNumberPad('0')}
            className="h-14 rounded-2xl text-xl font-medium transition-all active:scale-95 bg-md-surface-container text-md-on-surface hover:bg-md-surface-container-high"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || pairingCode.length !== 6}
            className="h-14 rounded-2xl text-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-md-primary text-md-on-primary hover:brightness-110"
          >
            {loading ? '...' : '✓'}
          </button>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 text-md-on-surface-variant hover:bg-md-surface-container-high rounded-lg transition text-sm font-medium"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={checkConnection}
            className="flex-1 px-4 py-3 text-md-primary hover:bg-md-primary-container rounded-lg transition text-sm font-medium"
          >
            Retry Connection
          </button>
        </div>

        <p className="text-xs text-md-outline mt-4 text-center">
          You can pair later from Settings if you skip now.
        </p>
      </div>
    </div>
  );
}
