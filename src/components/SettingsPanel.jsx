import { useState, useEffect } from 'react';
import { Settings, X, Camera, Printer, Layout, Sliders, RotateCcw, Info, Save, Megaphone } from 'lucide-react';
import { useSnackbar } from '../context/SnackbarContext.jsx';
import { playClick } from '../hooks/useSound.js';
import GeneralSettings from './settings/GeneralSettings.jsx';
import CameraSettings from './settings/CameraSettings.jsx';
import PrinterSettings from './settings/PrinterSettings.jsx';
import TemplateSettings from './settings/TemplateSettings.jsx';
import AboutSettings from './settings/AboutSettings.jsx';
import AdvertisingSettings from './settings/AdvertisingSettings.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';

const TABS = [
  { key: 'general',      label: 'General',      icon: Sliders },
  { key: 'advertising',  label: 'Advertising',  icon: Megaphone },
  { key: 'templates',    label: 'Templates',    icon: Layout },
  { key: 'camera',       label: 'Camera',       icon: Camera },
  { key: 'printer',      label: 'Printer',      icon: Printer },
  { key: 'about',        label: 'About',        icon: Info },
];

const TAB_MAP = {
  general: GeneralSettings, advertising: AdvertisingSettings, camera: CameraSettings,
  printer: PrinterSettings, templates: TemplateSettings, about: AboutSettings,
};

export default function SettingsPanel({ currentScreen = 'standby' }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [pendingClose, setPendingClose] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const { isDirty, saveSettings, discardSettings, resetSettings } = useSettings();
  const { showSnackbar } = useSnackbar();

  useEffect(() => { if (!isDirty) setPendingClose(false); }, [isDirty]);

  const ActiveComponent = TAB_MAP[activeTab];

  function triggerClose() {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setPendingClose(false);
    }, 250);
  }

  function handleSave() {
    saveSettings();
    showSnackbar('Settings saved');
  }

  function handleClose() {
    if (isDirty) {
      setPendingClose(true);
    } else {
      triggerClose();
    }
  }

  function handleDiscard() {
    discardSettings();
    triggerClose();
  }

  function handleSaveAndClose() {
    saveSettings();
    triggerClose();
    showSnackbar('Settings saved');
  }

  function handleReset() {
    setShowResetDialog(true);
  }

  function handleConfirmReset() {
    resetSettings();
    showSnackbar('Reset to defaults');
    setShowResetDialog(false);
  }

  return (
    <>
      {/* FAB trigger — badge dot when dirty — only show on standby */}
      {currentScreen === 'standby' && (
        <button
          onClick={() => { playClick(); setOpen(true); }}
          className="fixed top-4 right-4 z-40 w-12 h-12 flex items-center justify-center rounded-2xl bg-md-surface-container-highest text-md-on-surface hover:bg-md-surface-bright shadow-lg"
          style={{ transition: 'background-color 150ms cubic-bezier(0.4, 0.0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0.0, 0.2, 1)' }}
          aria-label="Settings"
        >
          <Settings size={20} />
          {isDirty && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-md-primary border-2 border-md-surface-container-highest" />
          )}
        </button>
      )}

      {/* Fullscreen settings sheet */}
      {open && (
        <div className={`fixed inset-0 z-50 bg-md-surface flex flex-col overflow-hidden ${closing ? 'md3-settings-exit' : 'md3-settings-enter'}`}>

          {/* Top App Bar */}
          <div className="flex items-center h-14 px-2 flex-shrink-0 bg-md-surface-container-low border-b border-md-outline-variant">
            <button
              onClick={() => { playClick(); handleClose(); }}
              className="w-12 h-12 flex items-center justify-center rounded-full text-md-on-surface hover:bg-md-surface-container-highest hover:scale-110 hover:shadow-md active:scale-95 transition-all duration-150"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <div className="flex-1 text-center">
              <h1 className="text-[22px] leading-7 font-normal text-md-on-surface">Admin Settings</h1>
            </div>

            {/* Save button */}
            <button
              onClick={() => { playClick(); handleSave(); }}
              disabled={!isDirty}
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-150 ${
                isDirty
                  ? 'text-md-primary hover:bg-md-primary/10 hover:scale-110 hover:shadow-md active:scale-95'
                  : 'text-md-outline opacity-40 cursor-not-allowed'
              }`}
              title="Save settings"
              aria-label="Save"
            >
              <Save size={22} />
            </button>

            {/* Reset button */}
            <button
              onClick={() => { playClick(); handleReset(); }}
              className="w-12 h-12 flex items-center justify-center rounded-full text-md-error hover:bg-md-error-container/40 hover:scale-110 hover:shadow-md active:scale-95 transition-all duration-150"
              title="Reset to factory defaults"
              aria-label="Reset"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          {/* Nav rail + content */}
          <div className="flex flex-1 overflow-hidden">
            <nav className="w-20 flex-shrink-0 bg-md-surface-container-low flex flex-col py-3 gap-1 border-r border-md-outline-variant">
              {TABS.map(({ key, label, icon: Icon }) => {
                const isActive = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => { playClick(); setActiveTab(key); }}
                    className="flex flex-col items-center gap-1.5 py-3 px-2 mx-1.5 rounded-2xl transition-colors"
                  >
                    <div className={`w-14 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-md-secondary-container text-md-on-secondary-container'
                        : 'text-md-on-surface-variant hover:bg-md-surface-container-high'
                    }`}>
                      <Icon size={22} />
                    </div>
                    <span className={`text-[11px] font-medium transition-colors ${
                      isActive ? 'text-md-on-surface' : 'text-md-on-surface-variant'
                    }`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="flex-1 overflow-y-auto p-4 bg-md-surface">
              <p className="text-xs font-medium tracking-widest uppercase text-md-on-surface-variant mb-4">
                {TABS.find(t => t.key === activeTab)?.label}
              </p>
              <div key={activeTab} className="tab-fade-in">
                <ActiveComponent />
              </div>
            </div>
          </div>

          {/* Unsaved-changes confirm bar */}
          {pendingClose && (
            <div className="flex-shrink-0 flex items-center justify-between gap-3 px-5 py-4 bg-md-surface-container border-t-2 border-md-primary/40">
              <div>
                <p className="text-sm font-semibold text-md-on-surface">Unsaved changes</p>
                <p className="text-xs text-md-on-surface-variant">Save before closing or discard?</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { playClick(); setPendingClose(false); }}
                  className="px-4 py-2.5 rounded-full text-sm font-medium text-md-on-surface-variant border border-md-outline hover:bg-md-surface-container-high transition-colors"
                >
                  Keep editing
                </button>
                <button
                  onClick={() => { playClick(); handleDiscard(); }}
                  className="px-4 py-2.5 rounded-full text-sm font-medium text-md-error border border-md-error/40 hover:bg-md-error-container/30 transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={() => { playClick(); handleSaveAndClose(); }}
                  className="px-4 py-2.5 rounded-full text-sm font-semibold bg-md-primary text-md-on-primary hover:brightness-110 transition-colors shadow"
                >
                  Save &amp; Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reset confirmation dialog */}
      <ConfirmDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        title="Reset All Settings"
        description="Reset ALL settings to factory defaults? This cannot be undone."
        onConfirm={handleConfirmReset}
        confirmText="Reset"
        cancelText="Cancel"
      />
    </>
  );
}
