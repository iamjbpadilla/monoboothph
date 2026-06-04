import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, LayoutDashboard, Smartphone, Users, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

export default function Help() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('admin');
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const tabs = [
    { id: 'admin', label: 'Admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'operator', label: 'Kiosk Operator', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'guest', label: 'Guest', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="bg-white border-b-2 border-black">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2 text-black hover:bg-gray-100 px-3 py-2 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Dashboard</span>
            </button>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-black" />
              <span className="font-bold text-black">Help Center</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex gap-2 border-b-2 border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-semibold transition border-b-2 -mb-0.5 ${
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {activeTab === 'admin' && <AdminGuide expandedSections={expandedSections} toggleSection={toggleSection} />}
        {activeTab === 'operator' && <OperatorGuide expandedSections={expandedSections} toggleSection={toggleSection} />}
        {activeTab === 'guest' && <GuestGuide expandedSections={expandedSections} toggleSection={toggleSection} />}
      </div>
    </div>
  );
}

function AdminGuide({ expandedSections, toggleSection }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-black mb-6">Admin Guide</h2>

      <Accordion
        id="event-management"
        title="Event Management"
        expanded={expandedSections['event-management']}
        onToggle={toggleSection}
      >
        <div className="space-y-4 text-black">
          <h3 className="font-bold text-black">Creating a New Event</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Navigate to <strong>Apps Management</strong> from the dashboard</li>
            <li>Click <strong>Create New App</strong></li>
            <li>Fill in event details:
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>Event name</li>
                <li>Event date</li>
                <li>Contact information</li>
                <li>Branding preferences</li>
              </ul>
            </li>
            <li>Click <strong>Create</strong> to generate the pairing code</li>
            <li>Share the pairing code with the kiosk operator</li>
          </ol>

          <h3 className="font-bold text-black mt-6">Managing Existing Events</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>View all events in the Apps Management page</li>
            <li>Regenerate pairing codes if needed</li>
            <li>Delete events after completion (photos auto-delete after 7 days)</li>
          </ul>
        </div>
      </Accordion>

      <Accordion
        id="app-pairing"
        title="App Pairing"
        expanded={expandedSections['app-pairing']}
        onToggle={toggleSection}
      >
        <div className="space-y-4 text-black">
          <h3 className="font-bold text-black">Pairing Process</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Create an event in the admin portal to get a pairing code</li>
            <li>On the kiosk device, open the MONO BOOTH PH app</li>
            <li>Enter the pairing code when prompted</li>
            <li>Wait for confirmation that the device is paired</li>
            <li>The kiosk will now load event-specific branding and settings</li>
          </ol>

          <div className="bg-white border-2 border-gray-200 p-4 mt-4">
            <p className="font-semibold text-black flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Important Notes
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Each kiosk can only be paired to one event at a time</li>
              <li>Pairing codes are single-use</li>
              <li>Unpairing a device requires admin intervention</li>
            </ul>
          </div>
        </div>
      </Accordion>

      <Accordion
        id="gallery-management"
        title="Gallery Management"
        expanded={expandedSections['gallery-management']}
        onToggle={toggleSection}
      >
        <div className="space-y-4 text-black">
          <h3 className="font-bold text-black">Viewing Photos</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Navigate to <strong>Gallery</strong> from the dashboard</li>
            <li>Filter by event or date</li>
            <li>Search by session ID</li>
            <li>View individual photos with download options</li>
          </ul>

          <h3 className="font-bold text-black mt-6">Bulk Operations</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Select multiple photos using checkboxes</li>
            <li>Bulk download selected photos</li>
            <li>Bulk delete (use with caution)</li>
          </ul>

          <h3 className="font-bold text-black mt-6">Auto-Delete Policy</h3>
          <p className="text-sm">Photos are automatically deleted 7 days after upload to manage storage. Download important photos before they expire.</p>
        </div>
      </Accordion>

      <Accordion
        id="settings"
        title="Settings"
        expanded={expandedSections['settings']}
        onToggle={toggleSection}
      >
        <div className="space-y-4 text-black">
          <h3 className="font-bold text-black">Hardware Settings</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Camera configuration (resolution, quality)</li>
            <li>Printer settings (paper width, print density)</li>
            <li>Test hardware connections</li>
          </ul>

          <h3 className="font-bold text-black mt-6">System Settings</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>View storage usage</li>
            <li>Check database connection status</li>
            <li>Monitor active devices</li>
          </ul>
        </div>
      </Accordion>
    </div>
  );
}

function OperatorGuide({ expandedSections, toggleSection }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-black mb-6">Kiosk Operator Guide</h2>

      <Accordion
        id="hardware-setup"
        title="Hardware Setup"
        expanded={expandedSections['hardware-setup']}
        onToggle={toggleSection}
      >
        <div className="space-y-4 text-black">
          <h3 className="font-bold text-black">Required Equipment</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Android tablet/device with MONO BOOTH PH app installed</li>
            <li>ESC/POS compatible thermal printer</li>
            <li>USB connection for printer</li>
            <li>Stable power supply</li>
            <li>Optional: External lighting for better photos</li>
          </ul>

          <h3 className="font-bold text-black mt-6">Initial Setup</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Connect printer to device via USB</li>
            <li>Open MONO BOOTH PH app</li>
            <li>Go to Settings → Hardware</li>
            <li>Test printer connection</li>
            <li>Test camera functionality</li>
            <li>Enter pairing code from admin</li>
          </ol>
        </div>
      </Accordion>

      <Accordion
        id="printer-connection"
        title="Printer Connection"
        expanded={expandedSections['printer-connection']}
        onToggle={toggleSection}
      >
        <div className="space-y-4 text-black">
          <h3 className="font-bold text-black">USB Connection</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Connect printer USB to device</li>
            <li>Grant USB permission when prompted</li>
            <li>Printer should auto-detect in settings</li>
          </ol>

          <div className="bg-white border-2 border-gray-200 p-4 mt-4">
            <p className="font-semibold text-black flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Troubleshooting
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>If printer not detected, check USB cable connection</li>
              <li>Restart printer if unresponsive</li>
              <li>Ensure printer has paper and is powered on</li>
            </ul>
          </div>
        </div>
      </Accordion>

      <Accordion
        id="event-operations"
        title="Event Day Operations"
        expanded={expandedSections['event-operations']}
        onToggle={toggleSection}
      >
        <div className="space-y-4 text-black">
          <h3 className="font-bold text-black">Before Event</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Ensure device is fully charged or plugged in</li>
            <li>Verify printer has sufficient paper</li>
            <li>Test print a sample receipt</li>
            <li>Confirm event is paired and branding is loaded</li>
          </ul>

          <h3 className="font-bold text-black mt-6">During Event</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Monitor printer paper level</li>
            <li>Replace paper when low</li>
            <li>Assist guests if needed (app is designed to be self-service)</li>
            <li>Keep device secure and stable</li>
          </ul>

          <h3 className="font-bold text-black mt-6">After Event</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Unpair device from event (optional)</li>
            <li>Turn off printer to save paper</li>
            <li>Charge device for next event</li>
          </ul>
        </div>
      </Accordion>
    </div>
  );
}

function GuestGuide({ expandedSections, toggleSection }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-black mb-6">Guest Guide</h2>

      <Accordion
        id="using-kiosk"
        title="Using the Kiosk"
        expanded={expandedSections['using-kiosk']}
        onToggle={toggleSection}
      >
        <div className="space-y-4 text-black">
          <h3 className="font-bold text-black">Step-by-Step</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Tap the screen to start</li>
            <li>Position yourself in the frame</li>
            <li>Tap the capture button or wait for countdown</li>
            <li>Wait for the photo to process</li>
            <li>Take your printed receipt from the printer</li>
          </ol>

          <h3 className="font-bold text-black mt-6">Tips for Great Photos</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Face the camera directly</li>
            <li>Ensure good lighting (the kiosk has built-in lighting)</li>
            <li>Stand at the marked distance</li>
            <li>Have fun with poses!</li>
          </ul>
        </div>
      </Accordion>

      <Accordion
        id="qr-download"
        title="QR Code & Digital Download"
        expanded={expandedSections['qr-download']}
        onToggle={toggleSection}
      >
        <div className="space-y-4 text-black">
          <h3 className="font-bold text-black">Scanning the QR Code</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Open your phone's camera app</li>
            <li>Point at the QR code on your printed receipt</li>
            <li>Tap the link that appears</li>
            <li>Your full-color photo will load in the browser</li>
          </ol>

          <h3 className="font-bold text-black mt-6">Downloading Your Photo</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>On the download page, tap the <strong>Download</strong> button</li>
            <li>Or long-press on the photo and select "Save Image"</li>
            <li>The photo will save to your phone's gallery</li>
          </ul>

          <div className="bg-white border-2 border-gray-200 p-4 mt-4">
            <p className="font-semibold text-black flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Important
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Photos are available for 3 days after the event</li>
              <li>Download your photo before it expires</li>
              <li>Photos are also uploaded to our Facebook page</li>
            </ul>
          </div>
        </div>
      </Accordion>

      <Accordion
        id="troubleshooting"
        title="Troubleshooting"
        expanded={expandedSections['troubleshooting']}
        onToggle={toggleSection}
      >
        <div className="space-y-4 text-black">
          <h3 className="font-bold text-black">QR Code Not Working?</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Ensure you have a stable internet connection</li>
            <li>Try a different QR scanner app</li>
            <li>Manually visit the URL if printed on receipt</li>
            <li>Contact the event organizer for assistance</li>
          </ul>

          <h3 className="font-bold text-black mt-6">Photo Not Found?</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>The photo may have expired (3-day limit)</li>
            <li>Check our Facebook page for backup copies</li>
            <li>Contact the event organizer</li>
          </ul>
        </div>
      </Accordion>
    </div>
  );
}

function Accordion({ id, title, expanded, onToggle, children }) {
  return (
    <div className="border-2 border-gray-200 overflow-hidden">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition"
      >
        <span className="font-bold text-black">{title}</span>
        {expanded ? <ChevronUp className="w-5 h-5 text-black" /> : <ChevronDown className="w-5 h-5 text-black" />}
      </button>
      {expanded && (
        <div className="p-4 bg-white border-t-2 border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
}
