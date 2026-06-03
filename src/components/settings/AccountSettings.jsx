import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { User, Link2, Unlink, Clock, AlertTriangle, CheckCircle, XCircle, Trash2, ChevronDown, ChevronUp, Download, Upload, Loader2 } from 'lucide-react';
import { getLogs, clearLogs } from '../../lib/logger.js';
import { getSupabaseClient } from '../../lib/supabase';

export default function AccountSettings() {
  const [pairingData, setPairingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [retrieving, setRetrieving] = useState(false);

  useEffect(() => {
    loadPairingData();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, []);

  // Refresh logs every second
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(getLogs());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  async function loadPairingData() {
    try {
      const pairingValue = await Preferences.get({ key: 'snaproll_pairing' });
      if (pairingValue.value) {
        const pairing = JSON.parse(pairingValue.value);
        const expiryTime = new Date(pairing.expiresAt).getTime();
        const now = Date.now();
        
        if (now < expiryTime) {
          setPairingData(pairing);
          updateTimeRemaining();
        } else {
          // Pairing expired, clear it
          await Preferences.remove({ key: 'snaproll_pairing' });
          setPairingData(null);
        }
      }
    } catch (err) {
      console.error('Failed to load pairing data:', err);
    } finally {
      setLoading(false);
    }
  }

  function updateTimeRemaining() {
    if (!pairingData) return;
    
    const expiryTime = new Date(pairingData.expiresAt).getTime();
    const now = Date.now();
    const remaining = expiryTime - now;
    
    if (remaining <= 0) {
      setTimeRemaining(null);
      handleUnpair();
      return;
    }

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    setTimeRemaining({ hours, minutes, seconds });
  }

  async function handleUnpair() {
    try {
      await Preferences.remove({ key: 'snaproll_pairing' });
      setPairingData(null);
      setTimeRemaining(null);
    } catch (err) {
      console.error('Failed to unpair:', err);
    }
  }

  function handlePair() {
    // Trigger pairing modal - this will be handled by the parent component
    // For now, we'll dispatch a custom event
    window.dispatchEvent(new CustomEvent('open-pairing-modal'));
  }

  async function handleBackup() {
    if (!pairingData) {
      alert('Please pair your device first to backup settings to cloud');
      return;
    }

    setBackingUp(true);
    try {
      // Get all preferences keys
      const allKeys = [
        'snaproll_settings_general',
        'snaproll_settings_camera',
        'snaproll_settings_printer',
        'snaproll_settings_templates',
      ];

      const backupData = {};
      for (const key of allKeys) {
        const { value } = await Preferences.get({ key });
        if (value) {
          backupData[key] = value;
        }
      }

      // Save to Supabase
      const supabase = await getSupabaseClient();
      if (!supabase) {
        throw new Error('Failed to get Supabase client');
      }

      const { error } = await supabase
        .from('settings_backups')
        .upsert({
          device_id: pairingData.deviceId,
          app_id: pairingData.appId,
          settings: backupData,
        }, {
          onConflict: 'device_id'
        });

      if (error) throw error;

      console.log('Settings backed up to cloud successfully');
      alert('Settings backed up to cloud successfully');
    } catch (err) {
      console.error('Failed to backup settings:', err);
      alert('Failed to backup settings: ' + err.message);
    } finally {
      setBackingUp(false);
    }
  }

  async function handleRetrieve() {
    if (!pairingData) {
      alert('Please pair your device first to retrieve settings from cloud');
      return;
    }

    setRetrieving(true);
    try {
      // Fetch from Supabase
      const supabase = await getSupabaseClient();
      if (!supabase) {
        throw new Error('Failed to get Supabase client');
      }

      const { data, error } = await supabase
        .from('settings_backups')
        .select('settings')
        .eq('device_id', pairingData.deviceId)
        .single();

      if (error) throw error;

      if (!data || !data.settings) {
        alert('No backup found for this device');
        return;
      }

      // Restore all preferences
      for (const [key, value] of Object.entries(data.settings)) {
        await Preferences.set({ key, value });
      }

      console.log('Settings retrieved from cloud successfully');
      alert('Settings retrieved from cloud successfully. Reloading...');
      
      // Reload the page to apply changes
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error('Failed to retrieve settings:', err);
      alert('Failed to retrieve settings: ' + err.message);
    } finally {
      setRetrieving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-md-outline border-t-md-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Pairing Status Card */}
      <div className="rounded-2xl border border-md-outline-variant bg-md-surface-container overflow-hidden">
        <div className="px-4 py-3 bg-md-surface-container-high border-b border-md-outline-variant">
          <span className="text-[10px] font-medium tracking-widest uppercase text-md-outline">Account Status</span>
        </div>
        
        <div className="p-6">
          {pairingData ? (
            <div className="space-y-4">
              {/* Paired Status */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-md-primary-container flex items-center justify-center">
                  <CheckCircle size={20} className="text-md-on-primary-container" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-md-on-surface">Paired</p>
                  <p className="text-xs text-md-on-surface-variant">Connected</p>
                </div>
              </div>

              {/* Expiry Timer */}
              {timeRemaining && (
                <div className="bg-md-surface-container-high rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-md-primary" />
                    <p className="text-xs text-md-on-surface-variant">Auto-unpair in</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-md-surface rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-md-on-surface">{timeRemaining.hours}</p>
                      <p className="text-xs text-md-on-surface-variant">Hours</p>
                    </div>
                    <div className="flex-1 bg-md-surface rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-md-on-surface">{timeRemaining.minutes}</p>
                      <p className="text-xs text-md-on-surface-variant">Minutes</p>
                    </div>
                    <div className="flex-1 bg-md-surface rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-md-on-surface">{timeRemaining.seconds}</p>
                      <p className="text-xs text-md-on-surface-variant">Seconds</p>
                    </div>
                  </div>
                  {timeRemaining.hours < 1 && (
                    <div className="flex items-center gap-2 mt-3 text-md-error">
                      <AlertTriangle size={14} />
                      <p className="text-xs">Expiring soon!</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="space-y-4">
              {/* Unpaired Status */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-md-surface-container-high flex items-center justify-center">
                  <XCircle size={20} className="text-md-outline" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-md-on-surface">Not Paired</p>
                  <p className="text-xs text-md-on-surface-variant">Connect to enable cloud features</p>
                </div>
              </div>

              {/* Features List */}
              <div className="bg-md-surface-container-high rounded-xl p-4 space-y-2">
                <p className="text-xs text-md-on-surface-variant mb-3">Cloud features when paired:</p>
                <div className="flex items-center gap-2 text-sm text-md-on-surface">
                  <CheckCircle size={14} className="text-md-primary" />
                  <span>Photo upload to cloud</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-md-on-surface">
                  <CheckCircle size={14} className="text-md-primary" />
                  <span>Digital download QR codes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-md-on-surface">
                  <CheckCircle size={14} className="text-md-primary" />
                  <span>Device status tracking</span>
                </div>
              </div>

              {/* Pair Button */}
              <button
                onClick={handlePair}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-md-primary text-md-on-primary hover:brightness-110 transition-colors shadow"
              >
                <Link2 size={18} />
                Pair Device
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-2xl border border-md-outline-variant bg-md-surface-container overflow-hidden">
        <div className="px-4 py-3 bg-md-surface-container-high border-b border-md-outline-variant">
          <span className="text-[10px] font-medium tracking-widest uppercase text-md-outline">Information</span>
        </div>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <User size={18} className="text-md-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-md-on-surface-variant leading-relaxed">
              Pairing connects your device to the portal for cloud features. 
              Pairings automatically expire after 24 hours for security. 
              You can re-pair at any time using the pairing code from the portal.
            </p>
          </div>
        </div>
      </div>

      {/* Debug Logs Card */}
      <div className="rounded-2xl border border-md-outline-variant bg-md-surface-container overflow-hidden">
        <div 
          className="px-4 py-3 bg-md-surface-container-high border-b border-md-outline-variant flex items-center justify-between cursor-pointer"
          onClick={() => setShowLogs(!showLogs)}
        >
          <span className="text-[10px] font-medium tracking-widest uppercase text-md-outline">Debug Logs</span>
          {showLogs ? <ChevronUp size={16} className="text-md-outline" /> : <ChevronDown size={16} className="text-md-outline" />}
        </div>
        {showLogs && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-md-on-surface-variant">{logs.length} log entries</span>
              <button
                onClick={() => clearLogs()}
                className="flex items-center gap-1 text-xs text-md-error hover:underline"
              >
                <Trash2 size={12} />
                Clear
              </button>
            </div>
            <div className="bg-md-surface rounded-xl p-3 h-64 overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-md-on-surface-variant text-center py-8">No logs yet</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className={`mb-1 ${log.type === 'error' ? 'text-md-error' : log.type === 'warn' ? 'text-orange-500' : 'text-md-on-surface'}`}>
                    <span className="text-md-outline-variant">[{log.timestamp}]</span> {log.message}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
