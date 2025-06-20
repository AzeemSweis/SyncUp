import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>🎉 SyncUp - Social Planning App</h1>
        <p>
          Welcome to SyncUp! Your social planning app is ready to build.
        </p>
        <div style={{ marginTop: '20px' }}>
          <button style={{ 
            padding: '10px 20px', 
            backgroundColor: '#3B82F6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            Get Started
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
