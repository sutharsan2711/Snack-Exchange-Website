import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { AnalyticsReport } from './pages/AnalyticsReport';
import { CategoryManager } from './pages/CategoryManager';
import { MenuManager } from './pages/MenuManager';
import { OrderManager } from './pages/OrderManager';
import { StoreSettings } from './pages/StoreSettings';
import { FooterManager } from './pages/FooterManager';

function App() {
  return (
    <BrowserRouter>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<AnalyticsReport />} />
          <Route path="/categories" element={<CategoryManager />} />
          <Route path="/menu" element={<MenuManager />} />
          <Route path="/orders" element={<OrderManager />} />
          <Route path="/settings" element={<StoreSettings />} />
          <Route path="/footer" element={<FooterManager />} />
          {/* Redirect invalid routes to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminLayout>
    </BrowserRouter>
  );
}


export default App;
