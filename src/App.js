import React from 'react';
import './App.css';

function App() {
  const boenden = [
    {
      id: 1, name: "Boende 1", floors: 3, rooms: 12},
    {
      id: 2, name: "Boende 2", floors: 2, rooms: 8},
    {
      id: 3, name: "Boende 3", floors: 4, rooms: 20}
  ];
  
  return (
    <div className="App">
      <header className="main-header">
        <h1>Boenden</h1>
        <p>Välj ett boende för att hantera inventarier och besiktningar.</p>
      </header>

      <main className="dashboard-grid">
        {boenden.map(boende => (
          <div key={boende.id} className="building-card">
            <span className="badge">Aktivt</span>
            <h3>{boende.name}</h3>
            <div className="stats">
              <span>{boende.floors} våningar</span>
              <span>{boende.rooms} rum</span>
            </div>
            </div>
        ))}

        <div className="building-card" style={{
          borderStyle: 'dashed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
        }}>
          <span style={{
            color: 'var(--accent)',
            fontWeight: '600'
            }}>Registrera nytt boende</span>
        </div>
      </main>
    </div>
  );
}

export default App;