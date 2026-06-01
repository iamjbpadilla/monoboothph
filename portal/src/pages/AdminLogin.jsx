import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Mail } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/admin/dashboard');
      }
    }
    checkAuth();
  }, [navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user is an admin
      const { data: adminCheck, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();

      if (adminError || !adminCheck) {
        await supabase.auth.signOut();
        throw new Error('Not authorized as admin');
      }

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 border-2 border-gray-900 portal-card">
        <div className="text-center mb-8">
          <img 
            src="/mono-booth-ph.svg" 
            alt="MONO BOOTH PH" 
            className="w-24 h-24 mx-auto mb-4 object-contain invert"
          />
          <p className="text-gray-500 text-sm">Admin Portal</p>
        </div>
        
        {error && (
          <div className="bg-gray-100 border border-gray-900 text-gray-900 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-2 text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
