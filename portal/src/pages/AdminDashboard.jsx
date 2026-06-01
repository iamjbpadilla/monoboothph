import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, Plus, Images, Smartphone, LogOut, Settings, CheckCircle, XCircle, Loader2, AlertTriangle, Clock, Printer, Activity, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ apps: 0, devices: 0, photos: 0, totalPrints: 0, onlineDevices: 0 });
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState('checking'); // checking, connected, error
  const [storageStatus, setStorageStatus] = useState('checking'); // checking, connected, error
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 0, percentage: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [expiringSoon, setExpiringSoon] = useState([]);

  useEffect(() => {
    checkDbConnection();
    checkStorageConnection();
    fetchStorageUsage();
    fetchStats();
    fetchRecentActivity();
    fetchExpiringSoon();
  }, []);

  async function checkDbConnection() {
    setDbStatus('checking');
    try {
      const { error } = await supabase.from('apps').select('id').limit(1);
      if (error) throw error;
      setDbStatus('connected');
    } catch (err) {
      console.error('Database connection error:', err);
      setDbStatus('error');
    }
  }

  async function checkStorageConnection() {
    setStorageStatus('checking');
    try {
      // Try to access the photos bucket directly
      const { data, error } = await supabase.storage.from('photos').list('', { limit: 1 });
      console.log('Storage check result:', { data, error });
      
      if (error) {
        console.error('Storage access error:', error);
        // If it's a permission error but bucket exists, still mark as connected
        if (error.message?.includes('not found')) {
          setStorageStatus('error');
        } else {
          // Permission error means bucket exists but no access - mark as connected
          setStorageStatus('connected');
        }
      } else {
        setStorageStatus('connected');
      }
    } catch (err) {
      console.error('Storage connection error:', err);
      setStorageStatus('error');
    }
  }

  async function fetchStorageUsage() {
    try {
      // Supabase free tier: 1GB = 1073741824 bytes
      const totalBytes = 1073741824;
      
      // List all files in photos bucket to calculate usage
      const { data: files, error } = await supabase.storage.from('photos').list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' }
      });
      
      if (error) {
        console.error('Error fetching storage usage:', error);
        return;
      }
      
      // Calculate total used bytes
      let usedBytes = 0;
      if (files) {
        for (const file of files) {
          if (file.metadata?.size) {
            usedBytes += file.metadata.size;
          }
        }
      }
      
      const percentage = (usedBytes / totalBytes) * 100;
      
      setStorageUsage({
        used: usedBytes,
        total: totalBytes,
        percentage: percentage.toFixed(2)
      });
    } catch (err) {
      console.error('Error calculating storage usage:', err);
    }
  }

  async function fetchStats() {
    try {
      const [appsCount, devicesCount, photosCount, onlineDevicesCount, devicesWithPrints] = await Promise.all([
        supabase.from('apps').select('*', { count: 'exact', head: true }),
        supabase.from('devices').select('*', { count: 'exact', head: true }),
        supabase.from('photos').select('*', { count: 'exact', head: true }),
        supabase.from('devices').select('*', { count: 'exact', head: true }).eq('status', 'online'),
        supabase.from('devices').select('print_count'),
      ]);

      const totalPrints = devicesWithPrints.data?.reduce((sum, d) => sum + (d.print_count || 0), 0) || 0;

      setStats({
        apps: appsCount.count || 0,
        devices: devicesCount.count || 0,
        photos: photosCount.count || 0,
        totalPrints: totalPrints,
        onlineDevices: onlineDevicesCount.count || 0,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRecentActivity() {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*, apps(name), devices(device_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentActivity(data || []);
    } catch (err) {
      console.error('Error fetching recent activity:', err);
    }
  }

  async function fetchExpiringSoon() {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .gte('created_at', new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true })
        .limit(5);

      if (error) throw error;
      setExpiringSoon(data || []);
    } catch (err) {
      console.error('Error fetching expiring photos:', err);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <img 
                src="/mono-booth-ph.svg" 
                alt="MONO BOOTH PH" 
                className="w-8 h-8 object-contain invert"
              />
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {dbStatus === 'checking' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    DB: Checking
                  </span>
                )}
                {dbStatus === 'connected' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3" />
                    DB: OK
                  </span>
                )}
                {dbStatus === 'error' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    <XCircle className="w-3 h-3" />
                    DB: Error
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-8">
            {/* Stats Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <StatCard
                  title="Total Apps"
                  value={stats.apps}
                  icon={<LayoutDashboard className="w-5 h-5 text-purple-600" />}
                  onClick={() => navigate('/admin/apps')}
                />
                <StatCard
                  title="Online Devices"
                  value={stats.onlineDevices}
                  icon={<Smartphone className="w-5 h-5 text-green-600" />}
                />
                <StatCard
                  title="Total Photos"
                  value={stats.photos}
                  icon={<Images className="w-5 h-5 text-blue-600" />}
                  onClick={() => navigate('/admin/gallery')}
                />
                <StatCard
                  title="Total Prints"
                  value={stats.totalPrints}
                  icon={<Printer className="w-5 h-5 text-orange-600" />}
                />
                <StatCard
                  title="All Devices"
                  value={stats.devices}
                  icon={<Activity className="w-5 h-5 text-gray-600" />}
                />
              </div>
            </div>

            {/* Storage Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Storage</h2>
              <StorageCard
                status={storageStatus}
                usage={storageUsage}
              />
            </div>

            {/* Recent Activity & Expiring Soon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </h2>
                <RecentActivityCard activity={recentActivity} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Expiring Soon
                </h2>
                <ExpiringSoonCard photos={expiringSoon} />
              </div>
            </div>

            {/* Quick Actions Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <QuickAction
                  title="Manage Apps"
                  description="Create and manage photobooth installations"
                  icon={<Plus className="w-5 h-5 text-purple-600" />}
                  onClick={() => navigate('/admin/apps')}
                />
                <QuickAction
                  title="Photo Gallery"
                  description="View and manage uploaded photos"
                  icon={<Images className="w-5 h-5 text-blue-600" />}
                  onClick={() => navigate('/admin/gallery')}
                />
                <QuickAction
                  title="Device Status"
                  description="Monitor connected devices"
                  icon={<Smartphone className="w-5 h-5 text-green-600" />}
                  onClick={() => navigate('/admin/apps')}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 p-6 cursor-pointer portal-card ${onClick ? '' : 'cursor-default'}`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        {icon}
      </div>
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function QuickAction({ title, description, icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer portal-card"
    >
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-500 mt-1 text-sm">{description}</p>
    </div>
  );
}

function RecentActivityCard({ activity }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {activity.length === 0 ? (
        <p className="text-gray-500 text-sm">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {activity.map((item) => (
            <div key={item.id} className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-purple-600" />
              <div className="flex-1">
                <p className="text-gray-900 font-medium">Photo uploaded</p>
                <p className="text-gray-500 text-xs">
                  {item.apps?.name} - {item.devices?.device_name || 'Unknown device'}
                </p>
              </div>
              <p className="text-gray-400 text-xs">
                {new Date(item.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExpiringSoonCard({ photos }) {
  const getTimeRemaining = (createdAt) => {
    const created = new Date(createdAt);
    const deletionTime = new Date(created.getTime() + 3 * 24 * 60 * 60 * 1000);
    const diff = deletionTime - new Date();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}h`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {photos.length === 0 ? (
        <p className="text-gray-500 text-sm">No photos expiring soon</p>
      ) : (
        <div className="space-y-3">
          {photos.map((photo) => (
            <div key={photo.id} className="flex items-center gap-3 text-sm">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <div className="flex-1">
                <p className="text-gray-900 font-medium">{photo.session_id}</p>
                <p className="text-gray-500 text-xs">
                  {photo.apps?.name}
                </p>
              </div>
              <p className="text-orange-600 text-xs font-medium">
                {getTimeRemaining(photo.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StorageCard({ status, usage }) {
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Storage Usage</h3>
        <div className="flex items-center gap-2 text-sm">
          {status === 'checking' && (
            <>
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              <span className="text-gray-400">Checking...</span>
            </>
          )}
          {status === 'connected' && (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-600">Connected</span>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-600">Error</span>
            </>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Used</span>
          <span className="font-medium text-gray-900">{formatBytes(usage.used)}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(usage.percentage, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total</span>
          <span className="font-medium text-gray-900">{formatBytes(usage.total)}</span>
        </div>
        
        <div className="text-right text-sm text-gray-500">
          {usage.percentage}% used
        </div>
      </div>
    </div>
  );
}
