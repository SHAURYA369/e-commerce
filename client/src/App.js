import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Admin from './components/Admin';
import DebugInfo from './components/DebugInfo';

function Header() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  if (isAdmin) {
    return (
      <header className="App-header admin-header">
        <h1>Admin Panel</h1>
        <Link to="/" className="back-link">← Back to Store</Link>
      </header>
    );
  }

  return (
    <header className="App-header">
      <h1>E-Commerce Store</h1>
      <nav>
        <Link to="/" className="nav-link">Cart</Link>
        <Link to="/checkout" className="nav-link">Checkout</Link>
      </nav>
    </header>
  );
}

function getOrCreateUserId() {
  try {
    let userId = localStorage.getItem('ecommerce_userId');
    if (!userId) {
      userId = `user${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      try {
        localStorage.setItem('ecommerce_userId', userId);
      } catch (storageError) {
        console.warn('Failed to save userId to localStorage:', storageError);
      }
    }
    return userId;
  } catch (error) {
    console.warn('localStorage not available, using session-based userId:', error);
    return `user${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

function App() {
  const [userId] = useState(getOrCreateUserId());

  return (
    <Router>
      <div className="App">
        <Header />
        <main className="App-main">
          <Routes>
            <Route path="/" element={<Cart userId={userId} />} />
            <Route path="/checkout" element={<Checkout userId={userId} />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        {process.env.NODE_ENV === 'development' && <DebugInfo />}
      </div>
    </Router>
  );
}

export default App;
