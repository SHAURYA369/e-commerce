import React, { useState } from 'react';
import './App.css';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Admin from './components/Admin';

function App() {
  const [activeTab, setActiveTab] = useState('cart');
  const [userId] = useState(`user${Date.now()}`);

  return (
    <div className="App">
      <header className="App-header">
        <h1>E-Commerce Store</h1>
        <nav>
          <button
            className={activeTab === 'cart' ? 'active' : ''}
            onClick={() => setActiveTab('cart')}
          >
            Cart
          </button>
          <button
            className={activeTab === 'checkout' ? 'active' : ''}
            onClick={() => setActiveTab('checkout')}
          >
            Checkout
          </button>
          <button
            className={activeTab === 'admin' ? 'active' : ''}
            onClick={() => setActiveTab('admin')}
          >
            Admin
          </button>
        </nav>
      </header>

      <main className="App-main">
        {activeTab === 'cart' && <Cart userId={userId} />}
        {activeTab === 'checkout' && <Checkout userId={userId} />}
        {activeTab === 'admin' && <Admin />}
      </main>
    </div>
  );
}

export default App;
