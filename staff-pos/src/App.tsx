import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PosProvider } from './context/PosContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import PosTerminal from './pages/PosTerminal';
import ActiveOrders from './pages/ActiveOrders';
import ShiftRegister from './pages/ShiftRegister';
import Settings from './pages/Settings';

export const App: React.FC = () => {
  return (
    <PosProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-orange-500 selection:text-white">
          <Header />
          <main className="flex-1 w-full overflow-y-auto">
            <Routes>
              <Route path="/" element={<PosTerminal />} />
              <Route path="/orders" element={<ActiveOrders />} />
              <Route path="/register" element={<ShiftRegister />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </Router>
    </PosProvider>
  );
};

export default App;
