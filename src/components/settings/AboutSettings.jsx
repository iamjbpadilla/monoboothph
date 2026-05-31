import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, Share2, Globe } from 'lucide-react';
import { Device } from '@capacitor/device';

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

const CHANGE_TYPE_COLORS = {
  Added: 'bg-green-500/15 text-green-400',
  Changed: 'bg-blue-500/15 text-blue-400',
  Fixed: 'bg-yellow-500/15 text-yellow-400',
  Security: 'bg-red-500/15 text-red-400',
};

function parseChangelog(markdown) {
  const lines = markdown.split('\n');
  const releases = [];
  let currentRelease = null;
  let currentSection = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Version header
    if (line.startsWith('## [')) {
      if (currentRelease) {
        releases.push(currentRelease);
      }
      const versionMatch = line.match(/\[([^\]]+)\]/);
      const dateMatch = line.match(/- (.+)$/);
      currentRelease = {
        version: versionMatch ? versionMatch[1] : 'Unknown',
        date: dateMatch ? dateMatch[1].replace('{date}', new Date().toLocaleDateString()) : 'Unknown',
        changes: []
      };
      currentSection = null;
    }
    // Section header
    else if (line.startsWith('### ')) {
      currentSection = line.substring(4);
    }
    // Change item
    else if (line.startsWith('- ') && currentRelease) {
      const text = line.substring(2);
      const type = currentSection || 'Changed';
      currentRelease.changes.push({ type, text });
    }
  }

  if (currentRelease) {
    releases.push(currentRelease);
  }

  return releases;
}

export default function AboutSettings() {
  const [changelogExpanded, setChangelogExpanded] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [webApisExpanded, setWebApisExpanded] = useState(false);
  const [dependenciesExpanded, setDependenciesExpanded] = useState(false);
  const [changelogData, setChangelogData] = useState([]);

  useEffect(() => {
    async function loadDeviceInfo() {
      try {
        const [id, info, battery] = await Promise.all([
          Device.getId(),
          Device.getInfo(),
          Device.getBatteryInfo(),
        ]);
        setDeviceInfo({ ...id, ...info, ...battery });
      } catch (err) {
        console.error('Failed to get device info:', err);
      }
    }
    loadDeviceInfo();
  }, []);

  useEffect(() => {
    async function loadChangelog() {
      try {
        const response = await fetch('/CHANGELOG.md');
        const markdown = await response.text();
        const parsed = parseChangelog(markdown);
        setChangelogData(parsed);
      } catch (err) {
        console.error('Failed to load changelog:', err);
      }
    }
    loadChangelog();
  }, []);

  return (
    <div className="space-y-5">
      {/* About Mono Studio */}
      <div className="rounded-[20px] bg-md-primary-container px-5 py-5 space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-md-on-primary-container">MONO BOOTH PH</h2>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-md-on-primary-container/10 text-md-on-primary-container/70">
            v0.1.0-mvp
          </span>
        </div>
        <p className="text-sm text-md-on-primary-container/80">
          Receipt Photobooth — print memories, one strip at a time.
        </p>
        <p className="text-xs text-md-on-primary-container/60 leading-relaxed pt-1">
          No proof without @monoboothph — show 'em the receipts! 🧾✨
        </p>
        <p className="text-xs text-md-on-primary-container/60 leading-relaxed">
          📍 Kabankalan City & Beyond
        </p>
      </div>

      {/* Developer */}
      <div className="rounded-[16px] bg-md-surface-container p-4 space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-md-on-surface-variant">Developer</p>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-md-secondary-container flex items-center justify-center text-md-on-secondary-container font-semibold text-base select-none">
            JP
          </div>
          <div>
            <div className="text-sm font-semibold text-md-on-surface">Jubet M. Padilla</div>
            <div className="text-xs text-md-on-surface-variant">Designer &amp; Developer</div>
          </div>
        </div>
      </div>

      {/* Connect */}
      <div className="rounded-[16px] bg-md-surface-container p-4 space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-md-on-surface-variant">Connect</p>
        <div className="grid grid-cols-2 gap-2">
          <a
            href="https://instagram.com/monoboothph"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-md-surface-container-high hover:bg-md-surface-container-highest transition-colors"
          >
            <Share2 size={18} className="text-md-on-surface" />
            <span className="text-sm text-md-on-surface">@monoboothph</span>
            <ExternalLink size={12} className="text-md-outline ml-auto" />
          </a>
          <a
            href="https://facebook.com/monoboothph"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-md-surface-container-high hover:bg-md-surface-container-highest transition-colors"
          >
            <Globe size={18} className="text-md-on-surface" />
            <span className="text-sm text-md-on-surface">MONO BOOTH PH</span>
            <ExternalLink size={12} className="text-md-outline ml-auto" />
          </a>
        </div>
      </div>

      {/* Changelog */}
      <div className="space-y-2">
        <button
          onClick={() => setChangelogExpanded(!changelogExpanded)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-md-surface-container border border-md-outline-variant hover:bg-md-surface-container-high transition-colors"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-md-on-surface-variant">Changelog</p>
          {changelogExpanded ? <ChevronDown className="w-4 h-4 text-md-on-surface-variant" /> : <ChevronRight className="w-4 h-4 text-md-on-surface-variant" />}
        </button>
        {changelogExpanded && (
          <div className="rounded-xl overflow-hidden border border-md-outline-variant divide-y divide-md-outline-variant">
            {changelogData.map((release) => (
              <div key={release.version} className="bg-md-surface-container p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-md-on-surface">{release.version}</span>
                  <span className="text-xs text-md-on-surface-variant">{release.date}</span>
                </div>
                <div className="space-y-2">
                  {release.changes.map((change, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${CHANGE_TYPE_COLORS[change.type] ?? 'bg-md-surface-container-highest text-md-on-surface-variant'}`}>
                        {change.type}
                      </span>
                      <span className="text-xs text-md-on-surface-variant leading-relaxed">{change.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How to Use */}
      <div className="rounded-[16px] bg-md-surface-container p-4 space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-md-on-surface-variant">How to Use</p>
        <div className="space-y-2 text-xs text-md-on-surface-variant leading-relaxed">
          <div className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center text-[10px] font-semibold">1</span>
            <span>Tap the screen to start</span>
          </div>
          <div className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center text-[10px] font-semibold">2</span>
            <span>Choose your template (Solo, Double, Triple, or Quad)</span>
          </div>
          <div className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center text-[10px] font-semibold">3</span>
            <span>Strike a pose for each photo</span>
          </div>
          <div className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center text-[10px] font-semibold">4</span>
            <span>Preview and print your receipt</span>
          </div>
        </div>
      </div>

      {/* Device Info */}
      {deviceInfo && (
        <div className="rounded-[16px] bg-md-surface-container p-4 space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-md-on-surface-variant">Device Info</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-md-on-surface-variant">Device ID</span>
              <span className="text-xs font-mono text-md-on-surface">{deviceInfo.identifier || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-md-on-surface-variant">Model</span>
              <span className="text-xs text-md-on-surface">{deviceInfo.model || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-md-on-surface-variant">Platform</span>
              <span className="text-xs text-md-on-surface">{deviceInfo.platform || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-md-on-surface-variant">OS Version</span>
              <span className="text-xs text-md-on-surface">{deviceInfo.osVersion || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-md-on-surface-variant">Manufacturer</span>
              <span className="text-xs text-md-on-surface">{deviceInfo.manufacturer || 'N/A'}</span>
            </div>
            {deviceInfo.batteryLevel !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-md-on-surface-variant">Battery</span>
                <span className="text-xs text-md-on-surface">{Math.round(deviceInfo.batteryLevel * 100)}%</span>
              </div>
            )}
            {deviceInfo.isCharging !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-md-on-surface-variant">Charging</span>
                <span className="text-xs text-md-on-surface">{deviceInfo.isCharging ? 'Yes' : 'No'}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Web Platform APIs */}
      <div className="space-y-2">
        <button
          onClick={() => setWebApisExpanded(!webApisExpanded)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-md-surface-container border border-md-outline-variant hover:bg-md-surface-container-high transition-colors"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-md-on-surface-variant">Web Platform APIs</p>
          {webApisExpanded ? <ChevronDown className="w-4 h-4 text-md-on-surface-variant" /> : <ChevronRight className="w-4 h-4 text-md-on-surface-variant" />}
        </button>
        {webApisExpanded && (
          <div className="rounded-xl overflow-hidden border border-md-outline-variant divide-y divide-md-outline-variant">
            {PLATFORM_APIS.map(a => (
              <div key={a.name} className="flex items-center justify-between px-4 py-3 bg-md-surface-container">
                <span className="text-sm text-md-on-surface font-medium">{a.name}</span>
                <span className="text-xs text-md-on-surface-variant ml-2 text-right">{a.note}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Open-source dependencies */}
      <div className="space-y-2">
        <button
          onClick={() => setDependenciesExpanded(!dependenciesExpanded)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-md-surface-container border border-md-outline-variant hover:bg-md-surface-container-high transition-colors"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-md-on-surface-variant">Open-Source Dependencies</p>
          {dependenciesExpanded ? <ChevronDown className="w-4 h-4 text-md-on-surface-variant" /> : <ChevronRight className="w-4 h-4 text-md-on-surface-variant" />}
        </button>
        {dependenciesExpanded && (
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
        )}
      </div>

      {/* App license */}
      <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-md-surface-container border border-md-outline-variant">
        <span className="text-xs text-md-on-surface-variant">This project</span>
        <span className="text-xs font-semibold text-md-on-surface">Private / MVP — All rights reserved</span>
      </div>
    </div>
  );
}
