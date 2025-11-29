import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Admin from './components/Admin';

function App() {
  const [userId] = useState(`user${Date.now()}`);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>E-Commerce Store</h1>
          <nav>
            <Link to="/" className="nav-link">Cart</Link>
            <Link to="/checkout" className="nav-link">Checkout</Link>
          </nav>
        </header>

        <main className="App-main">
          <Routes>
            <Route path="/" element={<Cart userId={userId} />} />
            <Route path="/checkout" element={<Checkout userId={userId} />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
