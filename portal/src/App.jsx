import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Landing from './pages/Landing';
import ProtectedRoute from './components/ProtectedRoute';

const PhotoDownload = lazy(() => import('./pages/PhotoDownload'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AppManagement = lazy(() => import('./pages/AppManagement'));
const Gallery = lazy(() => import('./pages/Gallery'));

function App() {
  return (
    <BrowserRouter>
      <div className="portal-bg" />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
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
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
