import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, Plus, Images, Smartphone, LogOut, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ apps: 0, devices: 0, photos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [appsCount, devicesCount, photosCount] = await Promise.all([
        supabase.from('apps').select('*', { count: 'exact', head: true }),
        supabase.from('devices').select('*', { count: 'exact', head: true }),
        supabase.from('photos').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        apps: appsCount.count || 0,
        devices: devicesCount.count || 0,
        photos: photosCount.count || 0,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
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
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Total Apps"
                value={stats.apps}
                onClick={() => navigate('/admin/apps')}
              />
              <StatCard
                title="Active Devices"
                value={stats.devices}
              />
              <StatCard
                title="Total Photos"
                value={stats.photos}
                onClick={() => navigate('/admin/gallery')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <QuickAction
                title="Manage Apps"
                description="Create and manage photobooth installations"
                onClick={() => navigate('/admin/apps')}
              />
              <QuickAction
                title="Photo Gallery"
                description="View and manage uploaded photos"
                onClick={() => navigate('/admin/gallery')}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:border-purple-500 hover:shadow-sm transition-all duration-200 ${onClick ? '' : 'cursor-default'}`}
    >
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-3xl font-semibold text-gray-900 mt-2">{value}</p>
    </div>
  );
}

function QuickAction({ title, description, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:border-purple-500 hover:shadow-sm transition-all duration-200"
    >
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-500 mt-1 text-sm">{description}</p>
    </div>
  );
}
