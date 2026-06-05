import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Preferences } from '@capacitor/preferences';
import { getSupabaseClient, checkSupabaseConnection } from '../lib/supabase';

export default function PairingModal({ onPaired, onClose }) {
  const [pairingCode, setPairingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('checking'); // checking, connected, error
  const [pairingSuccess, setPairingSuccess] = useState(false);

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

      // Show success loading screen
      setPairingSuccess(true);
      setTimeout(() => {
        onPaired(pairingData);
      }, 2000);
    } catch (err) {
      console.error('Pairing failed:', err);
      setError(err.message || 'Pairing failed. Please try again.');
      setPairingCode(''); // Clear input on error
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
    <div className="fixed inset-0 z-[60] bg-gray-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
      {/* Branding Header - Outside card */}
      {!pairingSuccess && (
        <div className="mb-4 text-center">
          <h1 className="text-lg font-bold text-black tracking-widest uppercase">MONO BOOTH PH</h1>
        </div>
      )}

      <div className="w-full max-w-sm bg-white border-2 border-gray-200 rounded-xl p-8 shadow transition-all duration-700 ease-out">
        {pairingSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-6" />
            <p className="text-lg font-medium text-black">Pairing successful!</p>
            <p className="text-sm text-gray-500 mt-2">Setting up your device...</p>
          </div>
        ) : connectionStatus === 'checking' ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-6" />
            <p className="text-lg font-medium text-black">Connecting to Portal...</p>
          </div>
        ) : connectionStatus === 'error' ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <RefreshCw className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-lg font-medium text-black mb-2">Portal unavailable</p>
            <p className="text-sm text-gray-500 mb-6 text-center">Please check your internet connection and try again</p>
            <button
              type="button"
              onClick={checkConnection}
              className="px-6 py-3 text-black font-medium text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300 ease-out flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Connect to Portal
            </button>
          </div>
        ) : (
          <>
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <h2 className="text-2xl font-bold text-black">Connect Your Device</h2>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <p className="text-gray-500 mb-4 text-sm text-center">
          Enter the 6-digit pairing code from the portal
        </p>

        {/* Pairing Code Display */}
        <div className="flex justify-center gap-2 mb-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                i < pairingCode.length
                  ? 'bg-black border-black'
                  : 'border-gray-300 bg-transparent'
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
              className="h-14 rounded-lg text-xl font-medium transition-all duration-300 ease-out active:scale-95 bg-gray-100 text-black hover:bg-gray-200 border-2 border-gray-200"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-lg text-xl font-medium transition-all duration-300 ease-out active:scale-95 bg-gray-200 text-black hover:bg-gray-300 border-2 border-gray-300"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => handleNumberPad('0')}
            className="h-14 rounded-lg text-xl font-medium transition-all duration-300 ease-out active:scale-95 bg-gray-100 text-black hover:bg-gray-200 border-2 border-gray-200"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || pairingCode.length !== 6}
            className="h-14 rounded-lg text-xl font-medium transition-all duration-300 ease-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-black text-white hover:opacity-90 border-2 border-black"
          >
            {loading ? '...' : '✓'}
          </button>
        </div>
        </>
        )}
      </div>

      {/* Branding Footer - Outside card */}
      {!pairingSuccess && (
        <div className="mt-4 flex flex-col items-center gap-0.5">
          <p className="text-sm font-semibold text-gray-500 tracking-wider">MONO BOOTH PH</p>
          <p className="text-[10px] text-gray-400 tracking-widest uppercase">NO PROOFS? SHOW 'EM THE RECEIPTS!</p>
          <p className="text-[10px] text-gray-400">📍 Kabankalan City & Beyond</p>
        </div>
      )}
    </div>
  );
}
