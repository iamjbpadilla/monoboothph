import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Landing from './pages/Landing';
import ProtectedRoute from './components/ProtectedRoute';

const PhotoDownload = lazy(() => import('./pages/PhotoDownload'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AppManagement = lazy(() => import('./pages/AppManagement'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Help = lazy(() => import('./pages/Help'));
const Timeline = lazy(() => import('./pages/Timeline'));
const Marketing = lazy(() => import('./pages/Marketing'));

function App() {
  return (
    <BrowserRouter>
      <div className="portal-bg" />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/download" element={<Navigate to="/" replace />} />
          <Route path="/download/:sessionId" element={<PhotoDownload />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/apps"
            element={
              <ProtectedRoute>
                <AppManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/gallery"
            element={
              <ProtectedRoute>
                <Gallery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/help"
            element={
              <ProtectedRoute>
                <Help />
              </ProtectedRoute>
            }
          />
          <Route path="/timeline" element={<Timeline />} />
          <Route
            path="/marketing"
            element={
              <ProtectedRoute>
                <Marketing />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
