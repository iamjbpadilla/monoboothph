import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Download, AlertCircle, ExternalLink, Camera } from 'lucide-react';

export default function PhotoDownload() {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchPhoto();
  }, [sessionId]);

  async function fetchPhoto() {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error) throw error;

      if (!data) {
        setError('Photo not found or has expired');
        return;
      }

      // Get public URL for the photo
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(data.storage_path);

      setPhoto({ ...data, publicUrl });
    } catch (err) {
      console.error('Error fetching photo:', err);
      setError('Photo not found or has expired');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!photo) return;
    setDownloading(true);

    try {
      const response = await fetch(photo.publicUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mono-booth-${sessionId}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/mono-booth-ph.svg" 
            alt="MONO BOOTH PH" 
            className="w-24 h-24 mx-auto mb-4 object-contain invert animate-pulse"
          />
          <p className="text-lg text-gray-500">Loading your photo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-50 rounded-2xl p-8 text-center border border-gray-200">
          <img 
            src="/mono-booth-ph.svg" 
            alt="MONO BOOTH PH" 
            className="w-16 h-16 mx-auto mb-4 object-contain invert"
          />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Photo Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error}. Photos uploaded daily to our Facebook page.
          </p>
          <a
            href="https://facebook.com/monoboothph"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition"
          >
            <ExternalLink className="w-5 h-5" />
            Visit Our Facebook Page
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* Header branding */}
      <div className="absolute top-6 left-0 right-0 flex flex-col items-center gap-1">
        <img 
          src="/mono-booth-ph.svg" 
          alt="MONO BOOTH PH" 
          className="w-12 h-12 object-contain invert"
        />
      </div>

      <div className="max-w-2xl w-full flex flex-col items-center gap-6">
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 w-full">
          <img
            src={photo.publicUrl}
            alt="Your photo"
            className="w-full rounded-xl"
          />
        </div>
        
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-6 h-6" />
          {downloading ? 'Downloading...' : 'Download Photo'}
        </button>
      </div>

      {/* Footer branding */}
      <div className="absolute bottom-6 flex flex-col items-center gap-1">
        <p className="text-sm font-semibold text-gray-900 tracking-wider">MONO BOOTH PH</p>
        <p className="text-[10px] text-gray-500 tracking-widest uppercase">No proof without @monoboothph</p>
        <p className="text-[10px] text-gray-400">📍 Kabankalan City & Beyond</p>
      </div>
    </div>
  );
}
