import { useState } from 'react';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.jsx';

export default function SecuritySettings() {
  const { settings, updateSettings } = useSettings();
  const currentPin = settings.general.settingsPin || '0000';

  const [currentInput, setCurrentInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [statusMsg, setStatusMsg] = useState('');

  function handleSave() {
    setStatus(null);

    if (currentInput !== currentPin) {
      setStatus('error');
      setStatusMsg('Current PIN is incorrect');
      return;
    }

    if (!/^\d{4}$/.test(newPin)) {
      setStatus('error');
      setStatusMsg('New PIN must be exactly 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      setStatus('error');
      setStatusMsg('New PINs do not match');
      return;
    }

    updateSettings('general.settingsPin', newPin);
    setStatus('success');
    setStatusMsg('PIN changed successfully');
    setCurrentInput('');
    setNewPin('');
    setConfirmPin('');
  }

  return (
    <div className="space-y-5">
      {/* Current PIN */}
      <div>
        <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Current PIN</label>
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={currentInput}
          onChange={e => setCurrentInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
          className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary tracking-[0.5em] font-mono"
          placeholder="••••"
        />
      </div>

      {/* New PIN */}
      <div>
        <label className="block text-xs font-medium text-md-on-surface-variant mb-2">New PIN</label>
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={newPin}
          onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary tracking-[0.5em] font-mono"
          placeholder="••••"
        />
      </div>

      {/* Confirm New PIN */}
      <div>
        <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Confirm New PIN</label>
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={confirmPin}
          onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary tracking-[0.5em] font-mono"
          placeholder="••••"
        />
      </div>

      {/* Status */}
      {status && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
          status === 'success'
            ? 'bg-green-500/10 text-green-400'
            : 'bg-red-500/10 text-red-400'
        }`}>
          {status === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {statusMsg}
        </div>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 bg-md-primary text-md-on-primary rounded-xl py-3 text-sm font-medium hover:brightness-110 active:scale-[0.98] transition-all"
      >
        <Lock size={14} /> Change PIN
      </button>
    </div>
  );
}
