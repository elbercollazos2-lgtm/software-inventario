import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Loading } from './components/ui/Loading';

// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const POS = lazy(() => import('./pages/POS').then(module => ({ default: module.POS })));
const Inventory = lazy(() => import('./pages/Inventory').then(module => ({ default: module.Inventory })));
// Users component might be default export or named export, assuming named based on others
const Users = lazy(() => import('./pages/Users').then(module => ({ default: module.Users })));
const InvoiceUpload = lazy(() => import('./pages/InvoiceUpload').then(module => ({ default: module.InvoiceUpload })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Categories = lazy(() => import('./pages/Categories').then(module => ({ default: module.Categories })));
const Bodegas = lazy(() => import('./pages/Bodegas').then(module => ({ default: module.Bodegas })));
const Grupos = lazy(() => import('./pages/Grupos').then(module => ({ default: module.Grupos })));
const Compras = lazy(() => import('./pages/Compras').then(module => ({ default: module.Compras })));
const Traslados = lazy(() => import('./pages/Traslados').then(module => ({ default: module.Traslados })));
const Ajustes = lazy(() => import('./pages/Ajustes').then(module => ({ default: module.Ajustes })));
const Kardex = lazy(() => import('./pages/Kardex').then(module => ({ default: module.Kardex })));
const Alerts = lazy(() => import('./pages/Alerts').then(module => ({ default: module.Alerts })));
const Providers = lazy(() => import('./pages/Providers').then(module => ({ default: module.Providers })));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const ProductPerformance = lazy(() => import('./pages/ProductPerformance').then(module => ({ default: module.ProductPerformance })));
const HelpCenter = lazy(() => import('./pages/HelpCenter').then(module => ({ default: module.HelpCenter })));
const CuentasPorPagar = lazy(() => import('./pages/CuentasPorPagar').then(module => ({ default: module.CuentasPorPagar })));
const HistorialPagos = lazy(() => import('./pages/HistorialPagos').then(module => ({ default: module.HistorialPagos })));

function ProtectedRoute({ children, allowedRoles }) {
  const role = localStorage.getItem('user_role');

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Si es cajero (empleado) e intenta entrar a ruta no permitida, mandar a POS
    if (role === 'empleado' || role === 'cajero') return <Navigate to="/pos" replace />;
    // Si es admin/super y por alguna razón no tiene permiso, mandar a home
    return <Navigate to="/" replace />;
  }

  return children;
}

import { Toaster } from 'sonner';

function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Suspense fallback={<Loading />}>
        <Routes>

          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute allowedRoles={['admin', 'superuser']}>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/pos" element={
            <ProtectedRoute allowedRoles={['empleado', 'cajero', 'admin', 'superuser']}>
              <MainLayout>
                <POS />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/inventory" element={
            <ProtectedRoute allowedRoles={['admin', 'superuser']}>
              <MainLayout>
                <Inventory />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/performance" element={
            <ProtectedRoute allowedRoles={['admin', 'superuser']}>
              <MainLayout>
                <ProductPerformance />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/upload" element={
            <ProtectedRoute allowedRoles={['admin', 'superuser']}>
              <MainLayout>
                <InvoiceUpload />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/categories" element={
            <ProtectedRoute allowedRoles={['admin', 'superuser']}>
              <MainLayout>
                <Categories />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/bodegas" element={
            <ProtectedRoute allowedRoles={['admin', 'superuser']}>
              <MainLayout>
                <Bodegas />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/grupos" element={
            <ProtectedRoute allowedRoles={['admin', 'superuser']}>
              <MainLayout>
                <Grupos />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/compras" element={
            <ProtectedRoute allowedRoles={['admin', 'superuser']}>
              <MainLayout>
                <Compras />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/debts" element={
            <ProtectedRoute allowedRoles={['admin', 'superuser']}>
              <MainLayout>
                <CuentasPorPagar />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/payment-history" element={
            <ProtectedRoute allowedRoles={['admin', 'superuser']}>
              <MainLayout>
                <HistorialPagos />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/traslados" element={
            <ProtectedRoute allowedRoles={['admin', 'superuser']}>
              <MainLayout>
                <Traslados />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/ajustes" element={
            <ProtectedRoute allowedRoles={['admin', 'superuser']}>
              <MainLayout>
                <Ajustes />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/kardex" element={
            <ProtectedRoute allowedRoles={['admin', 'superuser']}>
              <MainLayout>
                <Kardex />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/alerts" element={
            <ProtectedRoute allowedRoles={['admin', 'superuser']}>
              <MainLayout>
                <Alerts />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['admin', 'superuser']}>
              <MainLayout>
                <Users />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/providers" element={
            <ProtectedRoute allowedRoles={['admin', 'superuser']}>
              <MainLayout>
                <Providers />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['admin', 'superuser']}>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/help" element={
            <ProtectedRoute allowedRoles={['admin', 'superuser', 'empleado', 'cajero']}>
              <MainLayout>
                <HelpCenter />
              </MainLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

