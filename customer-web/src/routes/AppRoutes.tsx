import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Cart } from '../pages/Cart';
import { Checkout } from '../pages/Checkout';
import { Login } from '../pages/Login';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/login" element={<Login />} />
      {/* Redirect any other route to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
