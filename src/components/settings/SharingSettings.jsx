import { useState } from 'react';
import { Upload, Cloud, CloudOff, RefreshCw, Trash2, ExternalLink, Copy, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { usePendingUploads } from '../../hooks/usePendingUploads.js';

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-md-on-surface tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

export default function SharingSettings() {
  const { settings, updateSettings } = useSettings();
  const { sharing } = settings;
  const { uploads, storageUsage, storageLimit, retry, retryAll, clear } = usePendingUploads();
  const [filter, setFilter] = useState('all'); // all, pending, successful, failed
  const [copiedId, setCopiedId] = useState(null);

  // Filter uploads based on status
  const filteredUploads = (uploads || []).filter(u => {
    if (filter === 'all') return true;
    if (filter === 'pending') return u.retryCount < 3;
    if (filter === 'failed') return u.retryCount >= 3;
    return false;
  });

  function handleCopy(sessionId) {
    const url = `https://monoboothph.vercel.app/download/${sessionId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(sessionId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleRetry(sessionId) {
    retry(sessionId);
  }

  function handleRetryAll() {
    retryAll();
  }

  function handleDelete(sessionId) {
    // This would need to be implemented in usePendingUploads
    console.log('Delete:', sessionId);
  }

  function handleClearAll() {
    clear();
  }

  return (
    <div className="space-y-6">
      {/* Sharing Toggle */}
      <Section title="Image Sharing">
        <div className="flex items-center justify-between py-4 px-4 bg-md-surface-container border border-md-outline-variant rounded-lg">
          <div>
            <div className="text-sm font-medium text-md-on-surface">Enable Sharing</div>
            <div className="text-xs text-md-on-surface-variant">Upload photos to Supabase and show QR code</div>
          </div>
          <button
            role="switch"
            aria-checked={sharing.enabled}
            onClick={() => updateSettings('sharing.enabled', !sharing.enabled)}
            className={`relative inline-flex flex-shrink-0 w-[52px] h-[32px] rounded-full transition-colors duration-200 ${
              sharing.enabled
                ? 'bg-md-primary'
                : 'bg-md-surface-container-highest ring-2 ring-inset ring-md-outline'
            }`}
          >
            <span
              className={`pointer-events-none absolute top-[4px] left-[4px] w-[24px] h-[24px] rounded-full shadow-md transition-all duration-200 ease-out ${
                sharing.enabled ? 'translate-x-[20px] bg-md-on-primary' : 'translate-x-0 bg-md-on-surface-variant'
              }`}
            />
          </button>
        </div>
      </Section>

      {/* Fallback Message */}
      <Section title="Offline Fallback Message">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-md-on-surface-variant mb-2">
            Message shown when offline or upload fails
          </label>
          <input
            type="text"
            value={sharing.fallbackMessage}
            onChange={e => updateSettings('sharing.fallbackMessage', e.target.value)}
            className="w-full px-3 py-2 bg-md-surface-container border border-md-outline-variant rounded-lg text-sm"
            placeholder="Photo saved locally - will sync when online"
          />
          <p className="text-xs text-md-outline">This message replaces the QR code when sharing is disabled or offline.</p>
        </div>
      </Section>

      {/* Auto-Retry Settings */}
      <Section title="Auto-Retry">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 px-4 bg-md-surface-container border border-md-outline-variant rounded-lg">
            <div>
              <div className="text-sm font-medium text-md-on-surface">Auto-Retry on Internet</div>
              <div className="text-xs text-md-on-surface-variant">Automatically retry failed uploads when internet returns</div>
            </div>
            <button
              role="switch"
              aria-checked={sharing.autoRetry}
              onClick={() => updateSettings('sharing.autoRetry', !sharing.autoRetry)}
              className={`relative inline-flex flex-shrink-0 w-[52px] h-[32px] rounded-full transition-colors duration-200 ${
                sharing.autoRetry
                  ? 'bg-md-primary'
                  : 'bg-md-surface-container-highest ring-2 ring-inset ring-md-outline'
              }`}
            >
              <span
                className={`pointer-events-none absolute top-[4px] left-[4px] w-[24px] h-[24px] rounded-full shadow-md transition-all duration-200 ease-out ${
                  sharing.autoRetry ? 'translate-x-[20px] bg-md-on-primary' : 'translate-x-0 bg-md-on-surface-variant'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Max Retry Attempts: {sharing.maxRetries}</label>
            <input
              type="range"
              min="1"
              max="10"
              value={sharing.maxRetries}
              onChange={e => updateSettings('sharing.maxRetries', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </Section>

      {/* Pending Upload Queue */}
      <Section title="Pending Upload Queue">
        <div className="space-y-4">
          {/* Storage Usage */}
          <div className="flex items-center justify-between py-2 px-3 bg-md-surface-container border border-md-outline-variant rounded-lg">
            <div className="text-xs text-md-on-surface-variant">
              Storage: {storageUsage.toFixed(2)} MB / {storageLimit} MB
            </div>
            {storageUsage > storageLimit * 0.8 && (
              <div className="flex items-center gap-1 text-xs text-md-error">
                <AlertCircle size={12} />
                Near limit
              </div>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {['all', 'pending', 'failed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm capitalize rounded-lg border transition-colors ${
                  filter === f
                    ? 'bg-md-primary text-md-on-primary border-md-primary'
                    : 'bg-md-surface-container text-md-on-surface-variant border-md-outline-variant hover:bg-md-surface-container-high'
                }`}
              >
                {f} ({f === 'all' ? uploads.length : uploads.filter(u => f === 'pending' ? u.retryCount < 3 : u.retryCount >= 3).length})
              </button>
            ))}
          </div>

          {/* Upload List */}
          {filteredUploads.length === 0 ? (
            <div className="py-8 text-center text-md-on-surface-variant text-sm">
              {filter === 'all' ? 'No pending uploads' : `No ${filter} uploads`}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUploads.map(upload => (
                <div
                  key={upload.sessionId}
                  className="flex items-center gap-3 p-3 bg-md-surface-container border border-md-outline-variant rounded-lg"
                >
                  {/* Thumbnail */}
                  <img
                    src={upload.imageDataUrl}
                    alt="Thumbnail"
                    className="w-12 h-12 object-cover rounded"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-md-on-surface truncate">
                      {upload.sessionId}
                    </div>
                    <div className="text-xs text-md-on-surface-variant">
                      {new Date(upload.timestamp).toLocaleString()} • {upload.fileSize} MB
                    </div>
                    <div className="flex items-center gap-1 text-xs mt-1">
                      {upload.retryCount >= 3 ? (
                        <span className="flex items-center gap-1 text-md-error">
                          <XCircle size={10} />
                          Failed ({upload.retryCount} attempts)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-md-primary">
                          <Clock size={10} />
                          Pending ({upload.retryCount} attempts)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleRetry(upload.sessionId)}
                      className="p-2 text-md-primary hover:bg-md-primary-container rounded-lg transition-colors"
                      title="Retry"
                    >
                      <RefreshCw size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(upload.sessionId)}
                      className="p-2 text-md-error hover:bg-md-error-container rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bulk Actions */}
          {filteredUploads.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleRetryAll}
                className="flex items-center gap-2 px-3 py-2 bg-md-primary text-md-on-primary rounded-lg text-sm font-medium hover:brightness-110 transition-colors"
              >
                <RefreshCw size={16} />
                Retry All
              </button>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-3 py-2 bg-md-error-container border border-md-error rounded-lg text-sm text-md-on-error hover:brightness-110 transition-colors"
              >
                <Trash2 size={16} />
                Clear All
              </button>
            </div>
          )}
        </div>
      </Section>

      {/* Upload History */}
      <Section title="Upload History">
        <div className="space-y-4">
          <p className="text-xs text-md-outline">
            This shows all photos captured. Successful uploads can be viewed/downloaded.
          </p>

          {uploads.length === 0 ? (
            <div className="py-8 text-center text-md-on-surface-variant text-sm">
              No upload history
            </div>
          ) : (
            <div className="space-y-2">
              {uploads.map(upload => (
                <div
                  key={upload.sessionId}
                  className="flex items-center gap-3 p-3 bg-md-surface-container border border-md-outline-variant rounded-lg"
                >
                  {/* Thumbnail */}
                  <img
                    src={upload.imageDataUrl}
                    alt="Thumbnail"
                    className="w-12 h-12 object-cover rounded"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-md-on-surface truncate">
                      {upload.sessionId}
                    </div>
                    <div className="text-xs text-md-on-surface-variant">
                      {new Date(upload.timestamp).toLocaleString()}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium">
                    {upload.retryCount >= 3 ? (
                      <span className="flex items-center gap-1 bg-md-error-container text-md-on-error-container">
                        <XCircle size={10} />
                        Failed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-md-primary-container text-md-on-primary-container">
                        <CheckCircle size={10} />
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => window.open(`https://monoboothph.vercel.app/download/${upload.sessionId}`, '_blank')}
                      className="p-2 text-md-primary hover:bg-md-primary-container rounded-lg transition-colors"
                      title="View in browser"
                    >
                      <ExternalLink size={16} />
                    </button>
                    <button
                      onClick={() => handleCopy(upload.sessionId)}
                      className="p-2 text-md-primary hover:bg-md-primary-container rounded-lg transition-colors"
                      title="Copy link"
                    >
                      {copiedId === upload.sessionId ? <CheckCircle size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
