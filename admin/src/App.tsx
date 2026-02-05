import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Layout } from '@/components/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Sites } from '@/pages/Sites';
import { SiteDetail } from '@/pages/SiteDetail';
import { Widgets } from '@/pages/Widgets';
import { StatsWidget } from '@/widgets/StatsWidget';
import { ChartWidget } from '@/widgets/ChartWidget';
import { PagesWidget } from '@/widgets/PagesWidget';
import { RealtimeWidget } from '@/widgets/RealtimeWidget';
import { DocsWidget } from '@/widgets/DocsWidget';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          {/* Main app */}
          <Route element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sites" element={<Sites />} />
            <Route path="/sites/:id" element={<SiteDetail />} />
            <Route path="/widgets" element={<Widgets />} />
          </Route>

          {/* Widgets for iframe embedding */}
          <Route path="/widget/stats" element={<StatsWidget />} />
          <Route path="/widget/chart" element={<ChartWidget />} />
          <Route path="/widget/pages" element={<PagesWidget />} />
          <Route path="/widget/realtime" element={<RealtimeWidget />} />
          <Route path="/widget/docs" element={<DocsWidget />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
