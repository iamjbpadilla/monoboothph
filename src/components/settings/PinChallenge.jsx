import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

export default function PinChallenge({ expectedPin, onUnlock, onCancel }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleKey = useCallback((key) => {
    if (error) setError(false);
    if (value.length < 4) {
      setValue(v => v + key);
    }
  }, [value, error]);

  const handleBackspace = useCallback(() => {
    setValue(v => v.slice(0, -1));
    setError(false);
  }, []);

  const handleClear = useCallback(() => {
    setValue('');
    setError(false);
  }, []);

  useEffect(() => {
    if (value.length === 4) {
      if (value === expectedPin) {
        onUnlock();
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => setShake(false), 400);
        setTimeout(() => setValue(''), 600);
      }
    }
  }, [value, expectedPin, onUnlock]);

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '←'];

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className={`w-full max-w-sm bg-md-surface rounded-3xl p-6 shadow-2xl ${shake ? 'animate-shake' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-md-on-surface">Enter PIN</h2>
          <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-md-surface-container-high transition-colors">
            <X size={20} className="text-md-on-surface-variant" />
          </button>
        </div>

        {/* PIN Dots */}
        <div className="flex justify-center gap-3 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                i < value.length
                  ? 'bg-md-primary border-md-primary'
                  : error
                  ? 'border-md-error bg-transparent'
                  : 'border-md-outline bg-transparent'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-sm text-md-error mb-4">Incorrect PIN</p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {keys.map((k, i) => {
            if (k === '') return <div key={i} />;
            const isBackspace = k === '←';
            return (
              <button
                key={i}
                onClick={() => isBackspace ? handleBackspace() : handleKey(k)}
                className={`h-14 rounded-2xl text-xl font-medium transition-all active:scale-95 ${
                  isBackspace
                    ? 'bg-md-surface-container-high text-md-on-surface hover:bg-md-surface-container-highest'
                    : 'bg-md-surface-container text-md-on-surface hover:bg-md-surface-container-high'
                }`}
              >
                {isBackspace ? '←' : k}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleClear}
          className="w-full py-3 text-sm font-medium text-md-on-surface-variant hover:text-md-on-surface transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
