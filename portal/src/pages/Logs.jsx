import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Activity, AlertTriangle, Info, Bug, Trash2, Search, Filter, X } from 'lucide-react';

export default function Logs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all'); // all, error, warn, info, debug
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState('all'); // 'all' or app_id
  const [apps, setApps] = useState([]);
  const [connected, setConnected] = useState(false);
  const channelRef = useRef(null);
  const logsEndRef = useRef(null);

  useEffect(() => {
    fetchApps();
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedApp && selectedApp !== 'all') {
      connectToLogsChannel(selectedApp);
    } else {
      // Disconnect if 'all' is selected
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
        setConnected(false);
      }
    }
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [selectedApp]);

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  async function fetchApps() {
    try {
      const { data, error } = await supabase.from('apps').select('id, name').order('created_at', { ascending: false });
      if (error) throw error;
      setApps(data || []);
      if (data && data.length > 0) {
        setSelectedApp(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching apps:', err);
    }
  }

  function connectToLogsChannel(appId) {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    const channelName = `logs:${appId}`;
    const channel = supabase.channel(channelName);

    channel
      .on('broadcast', { event: 'log' }, (payload) => {
        const newLog = payload.payload;
        setLogs(prev => [...prev, newLog]);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true);
          console.log('Connected to logs channel:', channelName);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setConnected(false);
          console.log('Disconnected from logs channel');
        }
      });

    channelRef.current = channel;
  }

  function scrollToBottom() {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function clearLogs() {
    setLogs([]);
  }

  function getLevelIcon(level) {
    switch (level) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      case 'debug': return <Bug className="w-4 h-4 text-gray-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  }

  function getLevelColor(level) {
    switch (level) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warn': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'debug': return 'bg-gray-50 border-gray-200 text-gray-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  }

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.level !== filter) return false;
    if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase()) && !log.error_code?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Real-time Logs</h1>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`} />
                {connected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
            <button
              onClick={clearLogs}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* App Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">App:</label>
              <select
                value={selectedApp}
                onChange={(e) => setSelectedApp(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Apps</option>
                {apps.map(app => (
                  <option key={app.id} value={app.id}>{app.name}</option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search message or error code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Log Count */}
            <div className="text-sm text-gray-500">
              {filteredLogs.length} logs
            </div>
          </div>
        </div>
      </div>

      {/* Logs Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No logs to display</p>
            <p className="text-sm text-gray-400 mt-1">Logs will appear here in real-time</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className={`border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors ${
                    index === filteredLogs.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getLevelIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>
                        {log.error_code && (
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {log.error_code}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 break-words">{log.message}</p>
                      {log.stack_trace && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            View stack trace
                          </summary>
                          <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-x-auto">
                            {log.stack_trace}
                          </pre>
                        </details>
                      )}
                      {log.device_id && (
                        <p className="text-xs text-gray-400 mt-1">Device: {log.device_id.slice(0, 8)}...</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
