import { useEffect, useState } from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';
import QRCode from 'qrcode';
import StyledSelect from '../StyledSelect.jsx';

const BACKGROUND_STYLES = {
  'gradient-purple-pink': 'bg-gradient-to-br from-purple-600 to-pink-500',
  'gradient-blue-cyan': 'bg-gradient-to-br from-blue-600 to-cyan-500',
  'gradient-orange-red': 'bg-gradient-to-br from-orange-600 to-red-500',
  'gradient-green-teal': 'bg-gradient-to-br from-green-600 to-teal-500',
  'solid-purple': 'bg-purple-600',
  'solid-blue': 'bg-blue-600',
  'solid-dark': 'bg-gray-900',
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

  useEffect(() => {
    if (display.showQR && adConfig.facebookUrl) {
      QRCode.toDataURL(adConfig.facebookUrl, { width: 120, margin: 1 })
        .then(setQrCodeUrl)
        .catch(console.error);
    }
  }, [display.showQR, adConfig.facebookUrl]);

  const backgroundClass = BACKGROUND_STYLES[display.backgroundStyle] || BACKGROUND_STYLES['gradient-purple-pink'];
  const title = adConfig.title || 'MONO BOOTH PH';
  const subtitle = adConfig.subtitle || 'Capture Your Best Moments';
  const message = adConfig.message || 'Professional photobooth services for all your special occasions. Weddings, birthdays, corporate events, and more!';

  return (
    <div className="space-y-5">
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
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Advertising Duration (seconds)</label>
            <StyledSelect
              value={general.adDuration ?? 5}
              onValueChange={v => updateSettings('general.adDuration', parseInt(v))}
              options={[
                { value: 3, label: '3 seconds' },
                { value: 5, label: '5 seconds' },
                { value: 10, label: '10 seconds' }
              ]}
              placeholder="Select duration"
            />
          </div>
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

          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Event Promotion</label>
            <input
              type="text"
              value={adConfig.eventPromotion ?? ''}
              onChange={e => updateSettings('general.advertising.eventPromotion', e.target.value)}
              className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary"
              placeholder="Special event or promotion"
            />
          </div>
        </div>
      </Section>

      {/* ── Social Media ── */}
      <Section title="Social Media">
        <div className="space-y-2">
          <input
            type="text"
            value={adConfig.facebookUrl ?? ''}
            onChange={e => updateSettings('general.advertising.facebookUrl', e.target.value)}
            className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary"
            placeholder="Facebook URL"
          />
          <input
            type="text"
            value={adConfig.instagramUrl ?? ''}
            onChange={e => updateSettings('general.advertising.instagramUrl', e.target.value)}
            className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary"
            placeholder="Instagram URL"
          />
          <input
            type="text"
            value={adConfig.tiktokUrl ?? ''}
            onChange={e => updateSettings('general.advertising.tiktokUrl', e.target.value)}
            className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary"
            placeholder="TikTok URL"
          />
        </div>
      </Section>

      {/* ── Media Carousel ── */}
      <Section title="Media Carousel">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-md-on-surface">Show Media Carousel</span>
            <button
              role="switch"
              aria-checked={display.showCarousel ?? false}
              onClick={() => updateSettings('general.advertising.display.showCarousel', !(display.showCarousel ?? false))}
              className={`relative inline-flex flex-shrink-0 w-[52px] h-[32px] rounded-full transition-colors duration-200 ${
                (display.showCarousel ?? false)
                  ? 'bg-md-primary'
                  : 'bg-md-surface-container-highest ring-2 ring-inset ring-md-outline'
              }`}
            >
              <span
                className={`pointer-events-none absolute top-[4px] left-[4px] w-[24px] h-[24px] rounded-full shadow-md transition-all duration-200 ease-out ${
                  (display.showCarousel ?? false) ? 'translate-x-[20px] bg-md-on-primary' : 'translate-x-0 bg-md-on-surface-variant'
                }`}
              />
            </button>
          </div>
          <div>
            <label className="block text-xs font-medium text-md-on-surface-variant mb-2">Media URLs (one per line)</label>
            <textarea
              value={(adConfig.media || []).map(m => m.url).join('\n')}
              onChange={e => {
                const urls = e.target.value.split('\n').filter(u => u.trim());
                const media = urls.map(url => ({ type: url.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image', url: url.trim() }));
                updateSettings('general.advertising.media', media);
              }}
              className="w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-2.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary resize-none"
              rows={4}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/video1.mp4"
            />
            <p className="text-xs text-md-on-surface-variant mt-1">Enter image or video URLs, one per line. Auto-detects type.</p>
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
              value={display.backgroundStyle ?? 'gradient-purple-pink'}
              onValueChange={v => updateSettings('general.advertising.display.backgroundStyle', v)}
              options={[
                { value: 'gradient-purple-pink', label: 'Purple to Pink Gradient' },
                { value: 'gradient-blue-cyan', label: 'Blue to Cyan Gradient' },
                { value: 'gradient-orange-red', label: 'Orange to Red Gradient' },
                { value: 'gradient-green-teal', label: 'Green to Teal Gradient' },
                { value: 'solid-purple', label: 'Solid Purple' },
                { value: 'solid-blue', label: 'Solid Blue' },
                { value: 'solid-dark', label: 'Solid Dark' }
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

            {/* Event Promotion */}
            {adConfig.eventPromotion && (
              <div className="mb-4 px-3 py-1.5 rounded-full bg-white/30 backdrop-blur-sm">
                <p className="text-xs font-semibold text-white">{adConfig.eventPromotion}</p>
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
                {adConfig.facebookUrl && (
                  <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-xs font-semibold text-white">Facebook</span>
                  </div>
                )}
                {adConfig.instagramUrl && (
                  <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span className="text-xs font-semibold text-white">Instagram</span>
                  </div>
                )}
                {adConfig.tiktokUrl && (
                  <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                    <span className="text-xs font-semibold text-white">TikTok</span>
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
        </div>
      </Section>
    </div>
  );
}
