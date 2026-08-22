import { BrowserRouter, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Navbar } from './components/Navbar';
import { AppRoutes } from './routes/AppRoutes';
import { Footer } from './components/Footer';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '393841138681-846rkeig2b9ea1f04os0dtglmdjfhgt5.apps.googleusercontent.com';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="flex flex-col min-h-screen bg-brand-light font-sans antialiased text-slate-800">
      {/* Navbar - hidden on login page */}
      {!isLoginPage && <Navbar />}

      {/* Main Content Area */}
      <main className="flex-grow">
        <AppRoutes />
      </main>

      {/* Footer - hidden on login page */}
      {!isLoginPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
