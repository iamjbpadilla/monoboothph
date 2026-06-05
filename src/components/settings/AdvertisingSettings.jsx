import { useEffect, useState, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';
import QRCode from 'qrcode';
import StyledSelect from '../StyledSelect.jsx';
import ConfirmDialog from '../ConfirmDialog.jsx';
import { Play, X } from 'lucide-react';

const BACKGROUND_STYLES = {
  'solid-slate': 'bg-slate-600',
  'gradient-slate': 'bg-gradient-to-br from-slate-600 to-slate-700',
  'gradient-purple-pink': 'bg-gradient-to-br from-purple-600 to-pink-500',
  'gradient-blue-cyan': 'bg-gradient-to-br from-blue-600 to-cyan-500',
  'gradient-orange-red': 'bg-gradient-to-br from-orange-600 to-red-500',
  'gradient-green-teal': 'bg-gradient-to-br from-green-600 to-teal-500',
  'gradient-yellow-orange': 'bg-gradient-to-br from-yellow-500 to-orange-500',
  'gradient-pink-red': 'bg-gradient-to-br from-pink-500 to-red-500',
  'gradient-indigo-purple': 'bg-gradient-to-br from-indigo-600 to-purple-500',
  'gradient-teal-blue': 'bg-gradient-to-br from-teal-500 to-blue-600',
  'solid-purple': 'bg-purple-600',
  'solid-blue': 'bg-blue-600',
  'solid-dark': 'bg-gray-900',
  'solid-black': 'bg-black',
  'solid-white': 'bg-white',
  'solid-gray': 'bg-gray-500',
};

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-md-on-surface mb-2">{title}</h3>
      {children}
    </div>
  );
}

export default function AdvertisingSettings() {
  const { settings, updateSettings } = useSettings();
  const general = settings.general || {};
  const adConfig = general.advertising || {};
  const display = adConfig.display || {};
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', description: '', onConfirm: null });
  const [showPreview, setShowPreview] = useState(false);

  function showConfirm(title, description, onConfirm) {
    setConfirmDialog({ open: true, title, description, onConfirm });
  }

  // Full-screen image upload handler
  function handleFullScreenUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const currentCount = (adConfig.fullScreenImages || []).length;
    const remainingSlots = 10 - currentCount;
    const filesToAdd = files.slice(0, remainingSlots);
    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const newImg = { type: 'upload', value: ev.target.result };
        updateSettings('general.advertising.fullScreenImages', [...(adConfig.fullScreenImages || []), newImg]);
      };
      reader.readAsDataURL(file);
    });
  }

  // Full-screen video upload handler
  function handleFullScreenVideoUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const currentCount = (adConfig.fullScreenVideos || []).length;
    const remainingSlots = 10 - currentCount;
    const filesToAdd = files.slice(0, remainingSlots);
    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const newVideo = { type: 'upload', value: ev.target.result };
        updateSettings('general.advertising.fullScreenVideos', [...(adConfig.fullScreenVideos || []), newVideo]);
      };
      reader.readAsDataURL(file);
    });
  }

  useEffect(() => {
    if (display.showQR && adConfig.facebookUsername) {
      const facebookUrl = `https://facebook.com/${adConfig.facebookUsername}`;
      QRCode.toDataURL(facebookUrl, { width: 120, margin: 1 })
        .then(setQrCodeUrl)
        .catch(console.error);
    }
  }, [display.showQR, adConfig.facebookUsername]);

  // Poster wall upload handler
  function handlePosterWallUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    const currentCount = (adConfig.posterWall || []).length;
    const remainingSlots = 10 - currentCount;
    const filesToAdd = files.slice(0, remainingSlots);
    
    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const newPoster = { type: 'upload', value: ev.target.result };
        updateSettings('general.advertising.posterWall', [...(adConfig.posterWall || []), newPoster]);
      };
      reader.readAsDataURL(file);
    });
  }

  const backgroundClass = BACKGROUND_STYLES[display.backgroundStyle] || BACKGROUND_STYLES['solid-slate'];
  const title = adConfig.title || 'MONO BOOTH PH';
  const subtitle = adConfig.subtitle || 'Capture Your Best Moments';
  const message = adConfig.message || 'Professional photobooth services for all your special occasions. Weddings, birthdays, corporate events, and more!';

  return (
    <div className="space-y-5">
      {/* ── Full Screen Image ── */}
      <Section title="Full Screen Image">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-md-on-surface-variant">Enable Full Screen Image</label>
            <button
              role="switch"
              aria-checked={adConfig.showFullScreen ?? false}
              onClick={() => updateSettings('general.advertising.showFullScreen', !(adConfig.showFullScreen ?? false))}
              className={`relative inline-flex flex-shrink-0 w-[52px] h-[32px] rounded-full transition-colors duration-200 ${
                (adConfig.showFullScreen ?? false)
                  ? 'bg-md-primary'
                  : 'bg-md-surface-container-highest ring-2 ring-inset ring-md-outline'
              }`}
            >
              <span
                className={`pointer-events-none absolute top-[4px] left-[4px] w-[24px] h-[24px] rounded-full shadow-md transition-all duration-200 ease-out ${
                  (adConfig.showFullScreen ?? false) ? 'translate-x-[20px] bg-md-on-primary' : 'translate-x-0 bg-md-on-surface-variant'
                }`}
              />
            </button>
          </div>

          {adConfig.showFullScreen && (
            <>
              {/* URL Input */}
              <div>
                <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Image URLs (one per line)</label>
                <textarea
                  value={(adConfig.fullScreenImages || []).filter(p => p.type === 'url').map(p => p.value).join('\n')}
                  onChange={e => {
                    const urls = e.target.value.split('\n').filter(u => u.trim());
                    const uploads = (adConfig.fullScreenImages || []).filter(p => p.type === 'upload');
                    const urlImgs = urls.slice(0, 10 - uploads.length).map(url => ({ type: 'url', value: url }));
                    updateSettings('general.advertising.fullScreenImages', [...uploads, ...urlImgs]);
                  }}
                  className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary resize-none"
                  rows={3}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                />
              </div>

              {/* Upload Button */}
              <div>
                <label className="flex flex-col items-center gap-2 py-4 cursor-pointer rounded-xl border border-dashed border-md-outline-variant hover:border-md-outline hover:bg-md-surface-container-high transition-colors">
                  <svg className="w-6 h-6 text-md-outline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-md-on-surface-variant">Upload images</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleFullScreenUpload} />
                </label>
              </div>

              {/* Image Grid */}
              {(adConfig.fullScreenImages || []).length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {(adConfig.fullScreenImages || []).map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-md-outline-variant">
                      <img src={img.value} alt={`Full ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => showConfirm(
                          'Remove Image',
                          'Are you sure you want to remove this image?',
                          () => {
                            const updated = adConfig.fullScreenImages.filter((_, i) => i !== idx);
                            updateSettings('general.advertising.fullScreenImages', updated);
                          }
                        )}
                        className="absolute top-1 right-1 p-1 rounded-full bg-md-error-container/80 text-md-on-error-container hover:bg-md-error-container transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/50 text-white text-[10px]">
                        {img.type === 'url' ? 'URL' : 'Upload'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-md-on-surface-variant">{(adConfig.fullScreenImages || []).length}/10 images</p>

              {/* Scaling Mode */}
              <div>
                <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Scaling Mode</label>
                <div className="flex gap-1.5">
                  {[
                    { value: 'scale', label: 'Scale' },
                    { value: 'fit', label: 'Fit' },
                    { value: 'stretch', label: 'Stretch' },
                  ].map(opt => (
                    <button key={opt.value} onClick={() => updateSettings('general.advertising.fullScreenImageMode', opt.value)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex-1 ${
                        (adConfig.fullScreenImageMode || 'scale') === opt.value
                          ? 'bg-md-primary text-md-on-primary border-md-primary'
                          : 'bg-md-surface-container-high border-md-outline-variant text-md-on-surface-variant hover:bg-md-surface-container-highest'
                      }`}>{opt.label}</button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Section>

      {/* ── Full Screen Video ── */}
      <Section title="Full Screen Video">
        <div className="space-y-3">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-md-surface-container-high border border-md-outline-variant mb-3">
            <svg className="w-4 h-4 text-md-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-md-on-surface-variant leading-relaxed">
              For best experience, keep videos to 10 seconds or less. Longer videos may impact user experience.
            </p>
          </div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-md-on-surface-variant">Enable Full Screen Video</label>
            <button
              role="switch"
              aria-checked={adConfig.showFullScreenVideo ?? false}
              onClick={() => updateSettings('general.advertising.showFullScreenVideo', !(adConfig.showFullScreenVideo ?? false))}
              className={`relative inline-flex flex-shrink-0 w-[52px] h-[32px] rounded-full transition-colors duration-200 ${
                (adConfig.showFullScreenVideo ?? false)
                  ? 'bg-md-primary'
                  : 'bg-md-surface-container-highest ring-2 ring-inset ring-md-outline'
              }`}
            >
              <span
                className={`pointer-events-none absolute top-[4px] left-[4px] w-[24px] h-[24px] rounded-full shadow-md transition-all duration-200 ease-out ${
                  (adConfig.showFullScreenVideo ?? false) ? 'translate-x-[20px] bg-md-on-primary' : 'translate-x-0 bg-md-on-surface-variant'
                }`}
              />
            </button>
          </div>

          {adConfig.showFullScreenVideo && (
            <>
              {/* URL Input */}
              <div>
                <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Video URLs (one per line)</label>
                <textarea
                  value={(adConfig.fullScreenVideos || []).filter(p => p.type === 'url').map(p => p.value).join('\n')}
                  onChange={e => {
                    const urls = e.target.value.split('\n').filter(u => u.trim());
                    const uploads = (adConfig.fullScreenVideos || []).filter(p => p.type === 'upload');
                    const urlVideos = urls.slice(0, 10 - uploads.length).map(url => ({ type: 'url', value: url }));
                    updateSettings('general.advertising.fullScreenVideos', [...uploads, ...urlVideos]);
                  }}
                  className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary resize-none"
                  rows={3}
                  placeholder="https://example.com/video1.mp4&#10;https://example.com/video2.mp4"
                />
              </div>

              {/* Upload Button */}
              <div>
                <label className="flex flex-col items-center gap-2 py-4 cursor-pointer rounded-xl border border-dashed border-md-outline-variant hover:border-md-outline hover:bg-md-surface-container-high transition-colors">
                  <svg className="w-6 h-6 text-md-outline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-md-on-surface-variant">Upload videos</span>
                  <input type="file" accept="video/*" multiple className="hidden" onChange={handleFullScreenVideoUpload} />
                </label>
              </div>

              {/* Video Grid */}
              {(adConfig.fullScreenVideos || []).length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {(adConfig.fullScreenVideos || []).map((video, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-md-outline-variant bg-md-surface-container">
                      <video src={video.value} className="w-full h-full object-cover" muted />
                      <button
                        onClick={() => showConfirm(
                          'Remove Video',
                          'Are you sure you want to remove this video?',
                          () => {
                            const updated = adConfig.fullScreenVideos.filter((_, i) => i !== idx);
                            updateSettings('general.advertising.fullScreenVideos', updated);
                          }
                        )}
                        className="absolute top-1 right-1 p-1 rounded-full bg-md-error-container/80 text-md-on-error-container hover:bg-md-error-container transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/50 text-white text-[10px]">
                        {video.type === 'url' ? 'URL' : 'Upload'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-md-on-surface-variant">{(adConfig.fullScreenVideos || []).length}/10 videos</p>
            </>
          )}
        </div>
      </Section>

      {/* ── Advertising Toggle ── */}
      <Section title="Advertising">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-md-on-surface-variant">Show Advertising After Print</label>
            <button
              role="switch"
              aria-checked={general.showAdvertising ?? true}
              onClick={() => updateSettings('general.showAdvertising', !(general.showAdvertising ?? true))}
              className={`relative inline-flex flex-shrink-0 w-[52px] h-[32px] rounded-full transition-colors duration-200 ${
                (general.showAdvertising ?? true)
                  ? 'bg-md-primary'
                  : 'bg-md-surface-container-highest ring-2 ring-inset ring-md-outline'
              }`}
            >
              <span
                className={`pointer-events-none absolute top-[4px] left-[4px] w-[24px] h-[24px] rounded-full shadow-md transition-all duration-200 ease-out ${
                  (general.showAdvertising ?? true) ? 'translate-x-[20px] bg-md-on-primary' : 'translate-x-0 bg-md-on-surface-variant'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Advertising Duration</label>
            <StyledSelect
              value={general.adDuration ?? 5}
              onValueChange={v => updateSettings('general.adDuration', parseInt(v))}
              options={[
                { value: 3, label: '3 seconds' },
                { value: 5, label: '5 seconds' },
                { value: 8, label: '8 seconds' },
                { value: 10, label: '10 seconds' },
                { value: 15, label: '15 seconds' },
                { value: 20, label: '20 seconds' },
                { value: 30, label: '30 seconds' },
                { value: 0, label: 'Use video length' }
              ]}
              placeholder="Select duration"
            />
            {(general.adDuration ?? 5) === 0 && (
              <p className="text-xs text-md-on-surface-variant mt-2">
                When using video length, the ad will play for the full duration of the video. Recommended: keep videos under 10 seconds.
              </p>
            )}
          </div>

          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-md-primary text-md-on-primary rounded-xl text-sm font-medium hover:bg-md-primary-container transition-colors"
          >
            <Play size={16} />
            Preview Ad Full Screen
          </button>
        </div>
      </Section>

      {/* ── Content ── */}
      <Section title="Content">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Title</label>
            <input
              type="text"
              value={adConfig.title ?? 'MONO BOOTH PH'}
              onChange={e => updateSettings('general.advertising.title', e.target.value)}
              className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary"
              placeholder="MONO BOOTH PH"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Subtitle</label>
            <input
              type="text"
              value={adConfig.subtitle ?? 'Capture Your Best Moments'}
              onChange={e => updateSettings('general.advertising.subtitle', e.target.value)}
              className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary"
              placeholder="Capture Your Best Moments"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Marketing Message</label>
            <textarea
              value={adConfig.message ?? ''}
              onChange={e => updateSettings('general.advertising.message', e.target.value)}
              className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary resize-none"
              rows={3}
              placeholder="Professional photobooth services..."
            />
          </div>
        </div>
      </Section>

      {/* ── Poster Wall ── */}
      <Section title="Poster Wall">
        <div className="space-y-3">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-md-surface-container-high border border-md-outline-variant mb-3">
            <svg className="w-4 h-4 text-md-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-md-on-surface-variant leading-relaxed">
              Add 1-10 images via URL or upload. Images will display randomly on the ad screen. QR code stays at bottom.
            </p>
          </div>
          
          {/* URL Input */}
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Image URLs (one per line)</label>
            <textarea
              value={(adConfig.posterWall || []).filter(p => p.type === 'url').map(p => p.value).join('\n')}
              onChange={e => {
                const urls = e.target.value.split('\n').filter(u => u.trim());
                const uploads = (adConfig.posterWall || []).filter(p => p.type === 'upload');
                const urlPosters = urls.slice(0, 10 - uploads.length).map(url => ({ type: 'url', value: url }));
                updateSettings('general.advertising.posterWall', [...uploads, ...urlPosters]);
              }}
              className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary resize-none"
              rows={3}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            />
          </div>

          {/* Upload Button */}
          <div>
            <label className="flex flex-col items-center gap-2 py-4 cursor-pointer rounded-xl border border-dashed border-md-outline-variant hover:border-md-outline hover:bg-md-surface-container-high transition-colors">
              <svg className="w-6 h-6 text-md-outline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-md-on-surface-variant">Upload images</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePosterWallUpload} />
            </label>
          </div>

          {/* Image Grid */}
          {(adConfig.posterWall || []).length > 0 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {(adConfig.posterWall || []).map((poster, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-md-outline-variant">
                  <img src={poster.value} alt={`Poster ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => showConfirm(
                      'Remove Poster',
                      'Are you sure you want to remove this poster?',
                      () => {
                        const updated = adConfig.posterWall.filter((_, i) => i !== idx);
                        updateSettings('general.advertising.posterWall', updated);
                      }
                    )}
                    className="absolute top-1 right-1 p-1 rounded-full bg-md-error-container/80 text-md-on-error-container hover:bg-md-error-container transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/50 text-white text-[10px]">
                    {poster.type === 'url' ? 'URL' : 'Upload'}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <p className="text-xs text-md-on-surface-variant">
            {(adConfig.posterWall || []).length}/10 images added
          </p>
        </div>
      </Section>

      {/* ── Social Media ── */}
      <Section title="Social Media">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Facebook Username</label>
            <input
              type="text"
              value={adConfig.facebookUsername ?? ''}
              onChange={e => updateSettings('general.advertising.facebookUsername', e.target.value)}
              className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary"
              placeholder="Facebook username"
            />
            {adConfig.facebookUsername && (
              <p className="text-xs text-md-on-surface-variant mt-1">URL: https://facebook.com/{adConfig.facebookUsername}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Instagram Username</label>
            <input
              type="text"
              value={adConfig.instagramUsername ?? ''}
              onChange={e => updateSettings('general.advertising.instagramUsername', e.target.value)}
              className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary"
              placeholder="Instagram username"
            />
            {adConfig.instagramUsername && (
              <p className="text-xs text-md-on-surface-variant mt-1">URL: https://instagram.com/{adConfig.instagramUsername}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">TikTok Username</label>
            <input
              type="text"
              value={adConfig.tiktokUsername ?? ''}
              onChange={e => updateSettings('general.advertising.tiktokUsername', e.target.value)}
              className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary"
              placeholder="TikTok username"
            />
            {adConfig.tiktokUsername && (
              <p className="text-xs text-md-on-surface-variant mt-1">URL: https://tiktok.com/@{adConfig.tiktokUsername}</p>
            )}
          </div>
        </div>
      </Section>

      {/* ── Contact Info ── */}
      <Section title="Contact Info">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Phone</label>
            <input
              type="text"
              value={adConfig.phone ?? ''}
              onChange={e => updateSettings('general.advertising.phone', e.target.value)}
              className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary"
              placeholder="Phone number"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Email</label>
            <input
              type="text"
              value={adConfig.email ?? ''}
              onChange={e => updateSettings('general.advertising.email', e.target.value)}
              className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary"
              placeholder="Email address"
            />
          </div>
        </div>
      </Section>

      {/* ── Appearance ── */}
      <Section title="Appearance">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Background Style</label>
            <StyledSelect
              value={display.backgroundStyle ?? 'solid-slate'}
              onValueChange={v => updateSettings('general.advertising.display.backgroundStyle', v)}
              options={[
                { value: 'solid-slate', label: 'Solid Slate' },
                { value: 'gradient-slate', label: 'Slate Gradient' },
                { value: 'gradient-purple-pink', label: 'Purple to Pink Gradient' },
                { value: 'gradient-blue-cyan', label: 'Blue to Cyan Gradient' },
                { value: 'gradient-orange-red', label: 'Orange to Red Gradient' },
                { value: 'gradient-green-teal', label: 'Green to Teal Gradient' },
                { value: 'gradient-yellow-orange', label: 'Yellow to Orange Gradient' },
                { value: 'gradient-pink-red', label: 'Pink to Red Gradient' },
                { value: 'gradient-indigo-purple', label: 'Indigo to Purple Gradient' },
                { value: 'gradient-teal-blue', label: 'Teal to Blue Gradient' },
                { value: 'solid-purple', label: 'Solid Purple' },
                { value: 'solid-blue', label: 'Solid Blue' },
                { value: 'solid-dark', label: 'Solid Dark' },
                { value: 'solid-black', label: 'Solid Black' },
                { value: 'solid-white', label: 'Solid White' },
                { value: 'solid-gray', label: 'Solid Gray' }
              ]}
              placeholder="Select background"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-medium text-md-on-surface-variant">Display Options</label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-md-on-surface">Show Social Media Links</span>
              <button
                role="switch"
                aria-checked={display.showSocial ?? true}
                onClick={() => updateSettings('general.advertising.display.showSocial', !(display.showSocial ?? true))}
                className={`relative inline-flex flex-shrink-0 w-[52px] h-[32px] rounded-full transition-colors duration-200 ${
                  (display.showSocial ?? true)
                    ? 'bg-md-primary'
                    : 'bg-md-surface-container-highest ring-2 ring-inset ring-md-outline'
                }`}
              >
                <span
                  className={`pointer-events-none absolute top-[4px] left-[4px] w-[24px] h-[24px] rounded-full shadow-md transition-all duration-200 ease-out ${
                    (display.showSocial ?? true) ? 'translate-x-[20px] bg-md-on-primary' : 'translate-x-0 bg-md-on-surface-variant'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-md-on-surface">Show Contact Info</span>
              <button
                role="switch"
                aria-checked={display.showContact ?? false}
                onClick={() => updateSettings('general.advertising.display.showContact', !(display.showContact ?? false))}
                className={`relative inline-flex flex-shrink-0 w-[52px] h-[32px] rounded-full transition-colors duration-200 ${
                  (display.showContact ?? false)
                    ? 'bg-md-primary'
                    : 'bg-md-surface-container-highest ring-2 ring-inset ring-md-outline'
                }`}
              >
                <span
                  className={`pointer-events-none absolute top-[4px] left-[4px] w-[24px] h-[24px] rounded-full shadow-md transition-all duration-200 ease-out ${
                    (display.showContact ?? false) ? 'translate-x-[20px] bg-md-on-primary' : 'translate-x-0 bg-md-on-surface-variant'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-md-on-surface">Show QR Code</span>
              <button
                role="switch"
                aria-checked={display.showQR ?? true}
                onClick={() => updateSettings('general.advertising.display.showQR', !(display.showQR ?? true))}
                className={`relative inline-flex flex-shrink-0 w-[52px] h-[32px] rounded-full transition-colors duration-200 ${
                  (display.showQR ?? true)
                    ? 'bg-md-primary'
                    : 'bg-md-surface-container-highest ring-2 ring-inset ring-md-outline'
                }`}
              >
                <span
                  className={`pointer-events-none absolute top-[4px] left-[4px] w-[24px] h-[24px] rounded-full shadow-md transition-all duration-200 ease-out ${
                    (display.showQR ?? true) ? 'translate-x-[20px] bg-md-on-primary' : 'translate-x-0 bg-md-on-surface-variant'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-md-on-surface">Show Logo Instead of Icon</span>
              <button
                role="switch"
                aria-checked={display.showLogo ?? false}
                onClick={() => updateSettings('general.advertising.display.showLogo', !(display.showLogo ?? false))}
                className={`relative inline-flex flex-shrink-0 w-[52px] h-[32px] rounded-full transition-colors duration-200 ${
                  (display.showLogo ?? false)
                    ? 'bg-md-primary'
                    : 'bg-md-surface-container-highest ring-2 ring-inset ring-md-outline'
                }`}
              >
                <span
                  className={`pointer-events-none absolute top-[4px] left-[4px] w-[24px] h-[24px] rounded-full shadow-md transition-all duration-200 ease-out ${
                    (display.showLogo ?? false) ? 'translate-x-[20px] bg-md-on-primary' : 'translate-x-0 bg-md-on-surface-variant'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Live Preview ── */}
      <Section title="Live Preview">
        <div className="rounded-2xl overflow-hidden border border-md-outline-variant shadow-lg">
          {adConfig.showFullScreen && (adConfig.fullScreenImages || []).length > 0 ? (
            <div className="relative w-full aspect-[3/4] bg-black">
              <img
                src={adConfig.fullScreenImages[0].value}
                alt="Full screen preview"
                className={`w-full h-full ${
                  (adConfig.fullScreenImageMode || 'scale') === 'scale'
                    ? 'object-cover'
                    : (adConfig.fullScreenImageMode || 'scale') === 'fit'
                    ? 'object-contain'
                    : 'object-fill'
                }`}
              />
            </div>
          ) : (
          <div className={`${backgroundClass} p-6 flex flex-col items-center justify-center relative`}>
            {/* Logo/Icon */}
            <div className="mb-4">
              {display.showLogo && general.logoBase64 ? (
                <img 
                  src={general.logoBase64} 
                  alt="Logo" 
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm object-contain p-2"
                />
              ) : (
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              )}
              <h1 className="text-2xl font-bold text-white mb-2 text-center">{title}</h1>
              <p className="text-sm text-white/90 font-medium text-center">{subtitle}</p>
            </div>

            {/* Poster Wall Preview */}
            {(adConfig.posterWall || []).length > 0 && (
              <div className="mb-4 w-full max-w-xs">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-white/10">
                  <img src={adConfig.posterWall[0].value} alt="Poster" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
                    {(adConfig.posterWall || []).length} images
                  </div>
                </div>
              </div>
            )}

            {/* Marketing message */}
            <div className="mb-4 text-center">
              <p className="text-sm text-white/95 leading-relaxed">
                {message}
              </p>
            </div>

            {/* Social media links */}
            {display.showSocial && (
              <div className="flex flex-col gap-2 mb-4 w-full max-w-xs">
                {adConfig.facebookUsername && (
                  <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-xs font-semibold text-white">@{adConfig.facebookUsername}</span>
                  </div>
                )}
                {adConfig.instagramUsername && (
                  <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span className="text-xs font-semibold text-white">@{adConfig.instagramUsername}</span>
                  </div>
                )}
                {adConfig.tiktokUsername && (
                  <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                    <span className="text-xs font-semibold text-white">@{adConfig.tiktokUsername}</span>
                  </div>
                )}
              </div>
            )}

            {/* Contact Info */}
            {display.showContact && (adConfig.phone || adConfig.email) && (
              <div className="mb-4 space-y-1">
                {adConfig.phone && (
                  <div className="inline-flex items-center gap-1 text-white/90">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-xs">{adConfig.phone}</span>
                  </div>
                )}
                {adConfig.email && (
                  <div className="inline-flex items-center gap-1 text-white/90">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs">{adConfig.email}</span>
                  </div>
                )}
              </div>
            )}

            {/* QR Code */}
            {display.showQR && qrCodeUrl && (
              <div className="mb-4">
                <div className="inline-block p-2 bg-white rounded-lg">
                  <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20" />
                </div>
              </div>
            )}

            {/* Tagline */}
            <div className="mt-4 text-center">
              <p className="text-[10px] text-white/70 tracking-widest uppercase">No proof without @monoboothph</p>
              <p className="text-[10px] text-white/70 mt-0.5">📍 Kabankalan City & Beyond</p>
            </div>
          </div>
          )}
        </div>
      </Section>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={() => {
          if (confirmDialog.onConfirm) confirmDialog.onConfirm();
          setConfirmDialog({ ...confirmDialog, open: false });
        }}
      />

      {/* Ad Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black">
          <button
            onClick={() => setShowPreview(false)}
            className="absolute top-4 right-4 z-20 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <X size={24} />
          </button>
          <AdvertisingPreview
            adConfig={adConfig}
            display={display}
            adDuration={general.adDuration || 5}
            onComplete={() => setShowPreview(false)}
          />
        </div>
      )}
    </div>
  );
}

// Preview component that reuses the ad logic
function AdvertisingPreview({ adConfig, display, adDuration, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(adDuration === 0 ? null : adDuration);
  const [videoError, setVideoError] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoDuration, setVideoDuration] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const videoRef = useRef(null);
  const completedRef = useRef(false);
  const useVideoLength = adDuration === 0;

  useEffect(() => {
    if (useVideoLength) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [adDuration, onComplete, useVideoLength]);

  const backgroundClass = BACKGROUND_STYLES[display.backgroundStyle] || BACKGROUND_STYLES['solid-slate'];
  const title = adConfig.title || 'MONO BOOTH PH';
  const subtitle = adConfig.subtitle || 'Capture Your Best Moments';
  const message = adConfig.message || 'Professional photobooth services for all your special occasions. Weddings, birthdays, corporate events, and more!';
  const fsImages = adConfig.fullScreenImages || [];
  const fsVideos = adConfig.fullScreenVideos || [];

  // Prioritize full screen video over image if both are available
  if (fsVideos.length > 0 && !videoError) {
    return (
      <div className="w-full h-full relative bg-black">
        <video
          key={currentVideoIndex}
          ref={videoRef}
          src={fsVideos[currentVideoIndex].value}
          preload="auto"
          autoPlay
          muted
          loop={false}
          playsInline
          controls={false}
          className={`w-full h-full object-cover transition-opacity duration-300 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
          onError={() => {
            console.warn('[AdPreview] Video failed to load, falling back');
            setVideoError(true);
          }}
          onCanPlay={() => {
            setVideoReady(true);
            if (videoRef.current && videoRef.current.duration) {
              setVideoDuration(videoRef.current.duration);
            }
            if (videoRef.current) {
              videoRef.current.play().catch(err => console.warn('[AdPreview] Auto-play failed:', err));
            }
          }}
          onLoadedData={() => setVideoReady(true)}
          onPlay={() => {
            completedRef.current = false;
          }}
          onEnded={() => {
            if (useVideoLength && !completedRef.current) {
              completedRef.current = true;
              onComplete();
            } else if (!useVideoLength && fsVideos.length > 1) {
              // Rotate to next video
              setCurrentVideoIndex(prev => (prev + 1) % fsVideos.length);
            }
          }}
        />
        {!videoReady && (
          <div className="absolute inset-0 bg-black z-10" />
        )}
        {!useVideoLength && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm z-20">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-sm font-semibold text-white">{timeLeft}s</span>
          </div>
        )}
      </div>
    );
  }
  
  // Show full screen image if available (and no video)
  if (fsImages.length > 0 && (fsVideos.length === 0 || videoError)) {
    const mode = adConfig.fullScreenImageMode || 'scale';
    const objFit = mode === 'fit' ? 'contain' : mode === 'stretch' ? 'fill' : 'cover';
    return (
      <div className="w-full h-full relative bg-black">
        <img
          key={currentImageIndex}
          src={fsImages[currentImageIndex].value}
          alt=""
          className="w-full h-full"
          style={{ objectFit: objFit }}
        />
        <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm z-10">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-sm font-semibold text-white">{timeLeft}s</span>
        </div>
      </div>
    );
  }

  // Default content preview
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center p-8 ${backgroundClass}`}>
      <div className="max-w-md w-full text-center space-y-6">
        {display.showLogo && adConfig.logoImage ? (
          <img src={adConfig.logoImage} alt="Logo" className="w-20 h-20 mx-auto rounded-full" />
        ) : display.showLogo && adConfig.logoIcon && (
          <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-4xl">📷</span>
          </div>
        )}
        
        <h1 className="text-4xl font-bold text-white">{title}</h1>
        <p className="text-xl text-white/90">{subtitle}</p>
        <p className="text-sm text-white/80 leading-relaxed">{message}</p>

        {display.showCarousel && adConfig.media && adConfig.media.length > 0 && (
          <div className="w-full max-w-xs mx-auto">
            {adConfig.media[0]?.type === 'image' ? (
              <img 
                src={adConfig.media[0].url} 
                alt="Carousel" 
                className="w-full h-48 object-cover rounded-2xl bg-white/20 backdrop-blur-sm"
              />
            ) : adConfig.media[0]?.type === 'video' ? (
              <video 
                src={adConfig.media[0].url}
                autoPlay
                muted
                loop
                playsInline
                controls={false}
                className="w-full h-48 object-cover rounded-2xl bg-white/20 backdrop-blur-sm"
              />
            ) : null}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <p className="text-sm text-white/70 tracking-widest uppercase">No proof without @monoboothph</p>
          <p className="text-sm text-white/70">📍 Kabankalan City & Beyond</p>
        </div>
      </div>
      
      {!useVideoLength && (
        <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm z-10">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-sm font-semibold text-white">{timeLeft}s</span>
        </div>
      )}
    </div>
  );
}
