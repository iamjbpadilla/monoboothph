import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Copy, Trash2, RefreshCw, Search, Edit2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AppManagement() {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingApp, setEditingApp] = useState(null);
  const [editAppName, setEditAppName] = useState('');

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.pairing_code.includes(searchQuery)
  );

  useEffect(() => {
    fetchApps();
    fetchDevices();

    // Subscribe to device status changes
    const subscription = supabase
      .channel('device-status-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'devices'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setDevices(prev => 
              prev.map(device => 
                device.id === payload.new.id ? payload.new : device
              ).filter(d => d.status === 'online')
            );
          } else if (payload.eventType === 'INSERT') {
            if (payload.new.status === 'online') {
              setDevices(prev => [payload.new, ...prev]);
            }
          } else if (payload.eventType === 'DELETE') {
            setDevices(prev => prev.filter(device => device.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchApps() {
    try {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApps(data || []);
    } catch (err) {
      console.error('Error fetching apps:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDevices() {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('status', 'online')
        .order('last_sync', { ascending: false });

      if (error) throw error;
      setDevices(data || []);
    } catch (err) {
      console.error('Error fetching devices:', err);
    }
  }

  async function createApp() {
    if (!newAppName.trim()) return;
    setCreating(true);

    try {
      const pairingCode = generatePairingCode();
      const { data, error } = await supabase
        .from('apps')
        .insert({
          name: newAppName,
          pairing_code: pairingCode,
          settings: {},
        })
        .select()
        .single();

      if (error) throw error;

      setApps([data, ...apps]);
      setNewAppName('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating app:', err);
      alert(`Failed to create app: ${err.message || err.details || 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  }

  function generatePairingCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async function regeneratePairingCode(appId) {
    try {
      const newCode = generatePairingCode();
      const { error } = await supabase
        .from('apps')
        .update({ pairing_code: newCode })
        .eq('id', appId);

      if (error) throw error;

      setApps(apps.map(app => 
        app.id === appId ? { ...app, pairing_code: newCode } : app
      ));
    } catch (err) {
      console.error('Error regenerating code:', err);
      alert('Failed to regenerate pairing code');
    }
  }

  async function deleteApp(appId) {
    if (!confirm('Are you sure? This will delete all devices and photos associated with this app.')) return;

    try {
      const { error } = await supabase
        .from('apps')
        .delete()
        .eq('id', appId);

      if (error) throw error;

      setApps(apps.filter(app => app.id !== appId));
    } catch (err) {
      console.error('Error deleting app:', err);
      alert('Failed to delete app');
    }
  }

  async function renameApp(appId, newName) {
    if (!newName.trim()) return;

    try {
      const { error } = await supabase
        .from('apps')
        .update({ name: newName })
        .eq('id', appId);

      if (error) throw error;

      setApps(apps.map(app => 
        app.id === appId ? { ...app, name: newName } : app
      ));
      setEditingApp(null);
      setEditAppName('');
    } catch (err) {
      console.error('Error renaming app:', err);
      alert('Failed to rename app');
    }
  }

  function startEditing(app) {
    setEditingApp(app.id);
    setEditAppName(app.name);
  }

  function cancelEditing() {
    setEditingApp(null);
    setEditAppName('');
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Apps</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New App
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin mb-4" />
            <p className="text-sm text-gray-500 font-medium">Loading...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search apps by name or pairing code..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            {filteredApps.length === 0 && apps.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No apps match your search</p>
              </div>
            ) : apps.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500 mb-4">No apps created yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create your first app
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">App Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pairing Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Devices</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApps.map((app) => {
                  const appDevices = devices.filter(d => d.app_id === app.id);
                  return (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {editingApp === app.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editAppName}
                              onChange={(e) => setEditAppName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') renameApp(app.id, editAppName);
                                if (e.key === 'Escape') cancelEditing();
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                            />
                            <button
                              onClick={() => renameApp(app.id, editAppName)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {app.name}
                            <button
                              onClick={() => startEditing(app)}
                              className="text-gray-400 hover:text-gray-600 transition"
                              title="Rename"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm font-mono text-gray-700 bg-gray-100 px-2.5 py-1 rounded">{app.pairing_code}</code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {appDevices.length > 0 ? (
                          <div className="space-y-1.5">
                            {appDevices.map(device => (
                              <div key={device.id} className="flex items-center gap-2 text-xs">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-medium rounded ${
                                  device.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                  {device.status}
                                </span>
                                <span className="text-gray-700">{device.device_name || device.device_id}</span>
                                <span className="text-gray-500">
                                  ({device.print_count || 0} prints)
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">No devices</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => copyToClipboard(app.pairing_code)}
                          className="text-gray-500 hover:text-gray-700 mr-3 transition"
                          title="Copy code"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => regeneratePairingCode(app.id)}
                          className="text-gray-500 hover:text-gray-700 mr-3 transition"
                          title="Regenerate code"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteApp(app.id)}
                          className="text-gray-500 hover:text-red-600 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
            )}
          </>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-md w-full shadow-lg rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New App</h2>
            <input
              type="text"
              value={newAppName}
              onChange={(e) => setNewAppName(e.target.value)}
              placeholder="App name (e.g., Wedding Reception)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={createApp}
                disabled={creating || !newAppName.trim()}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition text-sm font-medium"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

