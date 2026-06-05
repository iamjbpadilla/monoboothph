import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Download, Trash2, Filter, Search, QrCode, XCircle, Grid, List, AlertTriangle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';

export default function Gallery() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [apps, setApps] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [qrModalPhoto, setQrModalPhoto] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [now, setNow] = useState(new Date());
  const [viewMode, setViewMode] = useState('grid'); // 'table' or 'grid'
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(24);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Update current time every second for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const [photosData, appsData, devicesData] = await Promise.all([
        supabase
          .from('photos')
          .select('*, apps(name), devices(device_name)')
          .order('timestamp', { ascending: false }),
        supabase.from('apps').select('*'),
        supabase.from('devices').select('*'),
      ]);

      if (photosData.error) throw photosData.error;
      if (appsData.error) throw appsData.error;
      if (devicesData.error) throw devicesData.error;

      // Add public URLs to photos
      const photosWithUrls = (photosData.data || []).map(photo => {
        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(photo.storage_path);
        return { ...photo, publicUrl };
      });

      setPhotos(photosWithUrls);
      setApps(appsData.data || []);
      setDevices(devicesData.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredPhotos = photos.filter(photo => {
    if (selectedApp !== 'all' && photo.app_id !== selectedApp) return false;
    if (selectedDevice !== 'all' && photo.device_id !== selectedDevice) return false;
    if (searchQuery && !photo.session_id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Date range filtering
    if (startDate) {
      const photoDate = new Date(photo.timestamp);
      const start = new Date(startDate);
      if (photoDate < start) return false;
    }
    if (endDate) {
      const photoDate = new Date(photo.timestamp);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include end date
      if (photoDate > end) return false;
    }
    
    return true;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedApp, selectedDevice, searchQuery, startDate, endDate]);

  // Pagination
  const totalPages = Math.ceil(filteredPhotos.length / itemsPerPage);
  const paginatedPhotos = filteredPhotos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }

  function openPreview(photo, index) {
    setPreviewPhoto(photo);
    setPreviewIndex(index);
  }

  function closePreview() {
    setPreviewPhoto(null);
    setPreviewIndex(null);
  }

  function navigatePreview(direction) {
    const newIndex = previewIndex + direction;
    if (newIndex >= 0 && newIndex < paginatedPhotos.length) {
      setPreviewPhoto(paginatedPhotos[newIndex]);
      setPreviewIndex(newIndex);
    }
  }

  async function handleBulkDelete() {
    if (selectedPhotos.size === 0) return;
    if (!confirm(`Delete ${selectedPhotos.size} photos? This cannot be undone.`)) return;

    setDeleting(true);

    try {
      const photosToDelete = photos.filter(p => selectedPhotos.has(p.id));

      // Delete from storage
      for (const photo of photosToDelete) {
        await supabase.storage.from('photos').remove([photo.storage_path]);
        if (photo.thumbnail_path) {
          await supabase.storage.from('photos').remove([photo.thumbnail_path]);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('photos')
        .delete()
        .in('id', Array.from(selectedPhotos));

      if (error) throw error;

      setPhotos(photos.filter(p => !selectedPhotos.has(p.id)));
      setSelectedPhotos(new Set());
    } catch (err) {
      console.error('Error deleting photos:', err);
      alert('Failed to delete photos');
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeleteAll() {
    if (filteredPhotos.length === 0) return;
    setDeletingAll(true);

    try {
      // Delete all filtered photos from storage
      for (const photo of filteredPhotos) {
        await supabase.storage.from('photos').remove([photo.storage_path]);
        if (photo.thumbnail_path) {
          await supabase.storage.from('photos').remove([photo.thumbnail_path]);
        }
      }

      // Delete all filtered photos from database
      const { error } = await supabase
        .from('photos')
        .delete()
        .in('id', filteredPhotos.map(p => p.id));

      if (error) throw error;

      setPhotos(photos.filter(p => !filteredPhotos.some(fp => fp.id === p.id)));
      setSelectedPhotos(new Set());
      setShowDeleteAllConfirm(false);
    } catch (err) {
      console.error('Error deleting all photos:', err);
      alert('Failed to delete all photos');
    } finally {
      setDeletingAll(false);
    }
  }

  function togglePhotoSelection(photoId) {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  }

  async function downloadPhoto(photo) {
    try {
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(photo.storage_path);

      const response = await fetch(publicUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `photo-${photo.session_id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
    }
  }

  async function downloadAllPhotos() {
    setDownloadingAll(true);
    setDownloadProgress({ current: 0, total: filteredPhotos.length });
    try {
      for (let i = 0; i < filteredPhotos.length; i++) {
        await downloadPhoto(filteredPhotos[i]);
        setDownloadProgress({ current: i + 1, total: filteredPhotos.length });
        // Small delay between downloads to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err) {
      console.error('Download all error:', err);
    } finally {
      setDownloadingAll(false);
      setDownloadProgress({ current: 0, total: 0 });
    }
  }

  async function showQRCode(photo) {
    setQrModalPhoto(photo);
    const url = `https://monoboothph.vercel.app/download/${photo.session_id}`;
    const dataUrl = await QRCode.toDataURL(url, {
      width: 256,
      margin: 2,
      color: { dark: '#1C1B1F', light: '#FFFFFF' },
    });
    setQrDataUrl(dataUrl);
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
              <h1 className="text-xl font-semibold text-gray-900">Gallery</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
                title={viewMode === 'table' ? 'Grid View' : 'List View'}
              >
                {viewMode === 'table' ? <Grid className="w-5 h-5" /> : <List className="w-5 h-5" />}
              </button>
              
              {/* Download */}
              {filteredPhotos.length > 0 && (
                <button
                  onClick={downloadAllPhotos}
                  disabled={downloadingAll}
                  className="relative flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Download all photos"
                >
                  <Download className="w-4 h-4" />
                  Download All
                  {downloadingAll && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {downloadProgress.current}
                    </span>
                  )}
                </button>
              )}
              
              {/* Delete Actions */}
              {selectedPhotos.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  disabled={deleting}
                  className="relative flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={`Delete ${selectedPhotos.size} selected`}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete ({selectedPhotos.size})
                </button>
              )}
              
              {filteredPhotos.length > 0 && (
                <button
                  onClick={() => setShowDeleteAllConfirm(true)}
                  disabled={deletingAll}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete all photos"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by session ID..."
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
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

            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Devices</option>
              {devices.map(device => (
                <option key={device.id} value={device.id}>{device.device_name || device.device_id}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  title="Clear date filter"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="ml-auto text-sm text-gray-500">
              {filteredPhotos.length} photos
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-sm text-gray-500 font-medium">Loading...</p>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No photos found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {paginatedPhotos.map((photo, index) => (
              <div key={photo.id} className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => openPreview(photo, index)}>
                <div className="aspect-square relative">
                  <img
                    src={photo.publicUrl}
                    alt={photo.session_id}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => showQRCode(photo)}
                      className="p-2 bg-white hover:bg-gray-100 transition rounded-lg shadow-sm"
                      title="Show QR Code"
                    >
                      <QrCode className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => downloadPhoto(photo)}
                      className="p-2 bg-white hover:bg-gray-100 transition rounded-lg shadow-sm"
                      title="Download"
                    >
                      <Download className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPhotos(new Set([photo.id]));
                        handleBulkDelete();
                      }}
                      className="p-2 bg-red-600 hover:bg-red-700 transition rounded-lg shadow-sm"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-gray-900 truncate" title={photo.session_id}>{photo.session_id}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{new Date(photo.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          </>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedPhotos.size === paginatedPhotos.length && paginatedPhotos.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPhotos(new Set(paginatedPhotos.map(p => p.id)));
                        } else {
                          setSelectedPhotos(new Set());
                        }
                      }}
                      className="border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">App</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auto-delete</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedPhotos.map((photo) => (
                  <tr key={photo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedPhotos.has(photo.id)}
                        onChange={() => togglePhotoSelection(photo.id)}
                        className="border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={photo.publicUrl}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          e.target.src = '/placeholder.png';
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <code className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">{photo.session_id}</code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{photo.apps?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{photo.devices?.device_name || photo.devices?.device_id || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(photo.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-mono ${getTimeUntilDeletion(photo.created_at) === 'Expired' ? 'text-red-600' : 'text-gray-500'}`}>
                        {getTimeUntilDeletion(photo.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => showQRCode(photo)}
                        className="text-gray-500 hover:text-gray-700 mr-3 transition"
                        title="Show QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadPhoto(photo)}
                        className="text-gray-500 hover:text-gray-700 mr-3 transition"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPhotos(new Set([photo.id]));
                          handleBulkDelete();
                        }}
                        className="text-gray-500 hover:text-red-600 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <button
            onClick={closePreview}
            className="absolute top-4 right-4 text-white hover:opacity-70 transition"
          >
            <XCircle className="w-8 h-8" />
          </button>
          
          <button
            onClick={() => navigatePreview(-1)}
            disabled={previewIndex === 0}
            className="absolute left-4 text-white hover:opacity-70 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>
          
          <button
            onClick={() => navigatePreview(1)}
            disabled={previewIndex === paginatedPhotos.length - 1}
            className="absolute right-4 text-white hover:opacity-70 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-12 h-12" />
          </button>

          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img
              src={previewPhoto.publicUrl}
              alt={previewPhoto.session_id}
              className="max-w-full max-h-[70vh] object-contain"
            />
            <div className="mt-4 text-center text-white">
              <p className="text-lg font-semibold">{previewPhoto.session_id}</p>
              <p className="text-sm text-white/50 mt-1">
                {previewPhoto.apps?.name || '-'} • {previewPhoto.devices?.device_name || previewPhoto.devices?.device_id || '-'}
              </p>
              <p className="text-sm text-white/50 mt-1">
                {new Date(previewPhoto.timestamp).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => showQRCode(previewPhoto)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-100 transition"
              >
                <QrCode className="w-4 h-4" />
                QR Code
              </button>
              <button
                onClick={() => downloadPhoto(previewPhoto)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:opacity-90 transition"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => {
                  setSelectedPhotos(new Set([previewPhoto.id]));
                  handleBulkDelete();
                  closePreview();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 max-w-md w-full shadow-lg rounded-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete All Photos</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Are you sure you want to delete <strong>{filteredPhotos.length}</strong> photos? 
                  This action cannot be undone and will permanently remove all photos from storage.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteAllConfirm(false)}
                    disabled={deletingAll}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    disabled={deletingAll}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 rounded-lg"
                  >
                    {deletingAll ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete All'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalPhoto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 max-w-sm w-full shadow-lg rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">QR Code</h3>
              <button
                onClick={() => {
                  setQrModalPhoto(null);
                  setQrDataUrl(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-4">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
              )}
              <p className="text-sm text-gray-700 text-center">
                Scan to download photo from: <br />
                <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{qrModalPhoto.session_id}</code>
              </p>
              <a
                href={`https://monoboothph.vercel.app/download/${qrModalPhoto.session_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition text-sm rounded-lg"
              >
                <Download className="w-4 h-4" />
                Open Download Page
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

