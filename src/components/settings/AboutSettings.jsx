const DEPENDENCIES = [
  { name: 'React',                      version: '^19.2.6',  license: 'MIT',        note: 'UI framework' },
  { name: 'React DOM',                  version: '^19.2.6',  license: 'MIT',        note: 'DOM renderer' },
  { name: 'Vite',                       version: '^8.0.12',  license: 'MIT',        note: 'Build tool & dev server' },
  { name: '@vitejs/plugin-react',       version: '^6.0.1',   license: 'MIT',        note: 'React fast-refresh' },
  { name: 'Tailwind CSS',               version: '^4.3.0',   license: 'MIT',        note: 'Utility-first CSS' },
  { name: '@tailwindcss/vite',          version: '^4.3.0',   license: 'MIT',        note: 'Vite integration' },
  { name: 'lucide-react',               version: '^1.17.0',  license: 'ISC',        note: 'Icon library' },
  { name: 'JsBarcode',                  version: '^3.12.3',  license: 'MIT',        note: 'Barcode generation on Canvas' },
  { name: '@radix-ui/react-dialog',     version: '^1.1.15',  license: 'MIT',        note: 'Accessible dialog primitive' },
  { name: '@radix-ui/react-label',      version: '^2.1.8',   license: 'MIT',        note: 'Accessible label primitive' },
  { name: '@radix-ui/react-select',     version: '^2.2.6',   license: 'MIT',        note: 'Accessible select primitive' },
  { name: '@radix-ui/react-separator', version: '^1.1.8',   license: 'MIT',        note: 'Accessible separator primitive' },
  { name: '@radix-ui/react-slider',     version: '^1.3.6',   license: 'MIT',        note: 'Accessible slider primitive' },
  { name: '@radix-ui/react-switch',     version: '^1.2.6',   license: 'MIT',        note: 'Accessible switch primitive' },
  { name: '@radix-ui/react-tabs',       version: '^1.1.13',  license: 'MIT',        note: 'Accessible tabs primitive' },
  { name: 'class-variance-authority',   version: '^0.7.1',   license: 'Apache 2.0', note: 'Variant-based class utils' },
  { name: 'clsx',                       version: '^2.1.1',   license: 'MIT',        note: 'Classname utility' },
  { name: 'tailwind-merge',             version: '^3.6.0',   license: 'MIT',        note: 'Tailwind class dedup' },
  { name: 'vite-plugin-pwa',            version: '^1.3.0',   license: 'MIT',        note: 'PWA / service worker' },
  { name: 'ESLint',                     version: '^10.3.0',  license: 'MIT',        note: 'Linter (dev only)' },
];

const PLATFORM_APIS = [
  { name: 'Canvas API',           note: 'Receipt image compositor' },
  { name: 'MediaDevices / getUserMedia', note: 'Camera capture' },
  { name: 'ESC/POS Protocol',     note: 'Thermal printer commands' },
  { name: 'Web Serial / USB OTG', note: 'USB printer transport' },
  { name: 'Web Bluetooth',        note: 'BT printer transport' },
  { name: 'Service Worker',       note: 'Offline / PWA caching' },
];

const LICENSE_BADGE = {
  MIT:         'bg-blue-500/15 text-blue-400',
  ISC:         'bg-sky-500/15 text-sky-400',
  'Apache 2.0':'bg-orange-500/15 text-orange-400',
};

export default function AboutSettings() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-[20px] bg-md-primary-container px-5 py-5 space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-md-on-primary-container">Snap &amp; Roll</h2>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-md-on-primary-container/10 text-md-on-primary-container/70">
            v0.1.0-mvp
          </span>
        </div>
        <p className="text-sm text-md-on-primary-container/80">
          Receipt Photobooth — print memories, one strip at a time.
        </p>
        <p className="text-xs text-md-on-primary-container/60 leading-relaxed pt-1">
          A Progressive Web App kiosk for event photobooths. Captures photos with a live
          camera feed, composites them onto a thermal-receipt-style strip, and sends the
          result to a connected ESC/POS printer.
        </p>
      </div>

      {/* Developer */}
      <div className="rounded-[16px] bg-md-surface-container p-4 space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-md-on-surface-variant">Developer</p>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-md-secondary-container flex items-center justify-center text-md-on-secondary-container font-semibold text-base select-none">
            JB
          </div>
          <div>
            <div className="text-sm font-semibold text-md-on-surface">jbpa</div>
            <div className="text-xs text-md-on-surface-variant">Designer &amp; Developer</div>
          </div>
        </div>
      </div>

      {/* Web Platform APIs */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-md-on-surface-variant">Web Platform APIs</p>
        <div className="rounded-xl overflow-hidden border border-md-outline-variant divide-y divide-md-outline-variant">
          {PLATFORM_APIS.map(a => (
            <div key={a.name} className="flex items-center justify-between px-4 py-3 bg-md-surface-container">
              <span className="text-sm text-md-on-surface font-medium">{a.name}</span>
              <span className="text-xs text-md-on-surface-variant ml-2 text-right">{a.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Open-source dependencies */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-md-on-surface-variant">Open-Source Dependencies</p>
        <div className="rounded-xl overflow-hidden border border-md-outline-variant divide-y divide-md-outline-variant">
          {DEPENDENCIES.map(d => (
            <div key={d.name} className="flex items-start justify-between px-4 py-3 bg-md-surface-container gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-sm text-md-on-surface font-medium truncate">{d.name}</div>
                <div className="text-xs text-md-on-surface-variant">{d.version} · {d.note}</div>
              </div>
              <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${LICENSE_BADGE[d.license] ?? 'bg-md-surface-container-highest text-md-on-surface-variant'}`}>
                {d.license}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* App license */}
      <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-md-surface-container border border-md-outline-variant">
        <span className="text-xs text-md-on-surface-variant">This project</span>
        <span className="text-xs font-semibold text-md-on-surface">Private / MVP — All rights reserved</span>
      </div>
    </div>
  );
}
