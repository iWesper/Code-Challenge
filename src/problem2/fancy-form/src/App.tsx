import React from 'react';
import logo from './logo.svg';
import CurrencySwap from './components/CurrencySwap';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header bg-zinc-900">
        <CurrencySwap />
      </header>
    </div>
  );
}

export default App;
