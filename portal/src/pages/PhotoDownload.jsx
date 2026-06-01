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
  const [imageLoading, setImageLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    fetchPhoto();
  }, [sessionId]);

  // Update current time every second for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
      const file = new File([blob], `mono-booth-${sessionId}.jpg`, { type: 'image/jpeg' });

      // Try Web Share API first (saves directly to gallery on mobile)
      if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Mono Booth Photo',
            text: 'Your photo from Mono Booth PH',
          });
          return;
        } catch (shareError) {
          // If share is cancelled or fails, fall back to download
          console.log('Share cancelled or failed, falling back to download');
        }
      }

      // Fallback: traditional download
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

  function getTimeUntilDeletion(createdAt) {
    const created = new Date(createdAt);
    const deletionTime = new Date(created.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
    const diff = deletionTime - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours}h ${minutes}m ${seconds}s`;
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
    <div className="min-h-screen bg-white flex flex-col p-4 md:p-8">
      {/* Header branding */}
      <div className="flex flex-col items-center gap-1 py-4">
        <img 
          src="/mono-booth-ph.svg" 
          alt="MONO BOOTH PH" 
          className="w-12 h-12 object-contain invert"
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-2xl w-full mx-auto">
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 w-full relative min-h-[200px]">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
            </div>
          )}
          <img
            src={photo.publicUrl}
            alt="Your photo"
            className="w-full rounded-xl"
            onLoad={() => setImageLoading(false)}
            style={{ display: imageLoading ? 'none' : 'block' }}
          />
        </div>
        
        {/* Guide text */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
            <Camera className="w-4 h-4" />
            Long-press on photo to save to gallery
          </p>
          <p className="text-xs text-gray-400">or use the button below</p>
        </div>
        
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-xs"
        >
          <Download className="w-6 h-6" />
          {downloading ? 'Downloading...' : 'Download'}
        </button>

        <p className="text-xs text-gray-500">
          Auto-delete in: <span className={`font-mono ${getTimeUntilDeletion(photo.created_at) === 'Expired' ? 'text-red-600' : 'text-gray-600'}`}>
            {getTimeUntilDeletion(photo.created_at)}
          </span>
        </p>
      </div>

      {/* Footer branding */}
      <div className="flex flex-col items-center gap-1 py-4">
        <p className="text-sm font-semibold text-gray-900 tracking-wider">MONO BOOTH PH</p>
        <p className="text-[10px] text-gray-500 tracking-widest uppercase">No proof without @monoboothph</p>
        <p className="text-[10px] text-gray-400">📍 Kabankalan City & Beyond</p>
      </div>
    </div>
  );
}
