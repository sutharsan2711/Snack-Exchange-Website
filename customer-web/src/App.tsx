import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AppRoutes } from './routes/AppRoutes';
import { CartButton } from './components/CartButton';
import { Footer } from './components/Footer';


function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-brand-light font-sans antialiased text-slate-800">
        {/* Navbar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-grow">
          <AppRoutes />
        </main>

        {/* Global Cart Button Popup */}
        <CartButton />

        {/* Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
