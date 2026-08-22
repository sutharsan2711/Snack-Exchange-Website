import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AdminLayout } from './components/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { AnalyticsReport } from './pages/AnalyticsReport';
import { MenuManager } from './pages/MenuManager';
import { OrderManager } from './pages/OrderManager';
import { StoreSettings } from './pages/StoreSettings';
import { FooterManager } from './pages/FooterManager';
import { AccountManager } from './pages/AccountManager';
import { Login } from './pages/Login';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '393841138681-846rkeig2b9ea1f04os0dtglmdjfhgt5.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes (wrapped in AdminLayout) */}
        <Route
          path="/*"
          element={
            <AdminLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/analytics" element={<AnalyticsReport />} />
                <Route path="/categories" element={<Navigate to="/menu" replace />} />
                <Route path="/menu" element={<MenuManager />} />
                <Route path="/orders" element={<OrderManager />} />
                <Route path="/users" element={<AccountManager />} />
                <Route path="/settings" element={<StoreSettings />} />
                <Route path="/footer" element={<FooterManager />} />
                {/* Redirect invalid routes inside AdminLayout to dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AdminLayout>
          }
        />
      </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
