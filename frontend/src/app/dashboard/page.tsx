'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import './dashboard.css';

export default function Dashboard() {
  useEffect(() => {
    // Set the title when component mounts
    document.title = 'BrasserieBot - Dashboard Overview';
  }, []);

  return (
    <div className="page active" id="dashboard">
      <h1>Dashboard Overview</h1>
      <p>Welkom bij het BrasserieBot Dashboard. Hier vindt u een overzicht van alle belangrijke metrics.</p>
      
      <div className="stats-container">
        <div className="stat-card">
          <div>Omzet Vandaag</div>
          <div className="stat-value">€1,245</div>
          <div className="stat-change">+12% vs. gisteren</div>
        </div>
        
        <div className="stat-card">
          <div>Reserveringen</div>
          <div className="stat-value">28</div>
          <div className="stat-change">+4 vs. gisteren</div>
        </div>
        
        <div className="stat-card">
          <div>Online Bestellingen</div>
          <div className="stat-value">15</div>
          <div className="stat-change">+3 vs. gisteren</div>
        </div>
      </div>
      
      <div className="ai-insight">
        <div className="ai-insight-title"><i>🤖</i> AI Inzicht</div>
        <div>Het wordt morgen zonnig en 25°C. Verwacht 20% meer terrasreserveringen dan normaal.</div>
        <div className="ai-action">
          <div className="ai-action-title"><i>✓</i> Aanbevolen Actie</div>
          <div>Plan 2 extra personeelsleden in voor de middagshift en zorg voor extra voorraad frisdrank.</div>
        </div>
      </div>
      
      <div className="card">
        <h2>Omzet per Week</h2>
        <div style={{height: "200px", backgroundColor: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center"}}>
          Grafiek: Omzet per Week
        </div>
      </div>
      
      <div className="card">
        <h2>Recente Activiteiten</h2>
        <table>
          <thead>
            <tr>
              <th>Tijd</th>
              <th>Activiteit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>19:45</td>
              <td>Nieuwe online bestelling #ORD-1237</td>
              <td><span className="badge badge-info">Nieuw</span></td>
            </tr>
            <tr>
              <td>19:30</td>
              <td>Nieuwe online bestelling #ORD-1236</td>
              <td><span className="badge badge-info">Nieuw</span></td>
            </tr>
            <tr>
              <td>19:22</td>
              <td>Nieuwe online bestelling #ORD-1235</td>
              <td><span className="badge badge-info">Nieuw</span></td>
            </tr>
            <tr>
              <td>19:15</td>
              <td>Nieuwe online bestelling #ORD-1234</td>
              <td><span className="badge badge-info">Nieuw</span></td>
            </tr>
            <tr>
              <td>18:30</td>
              <td>Nieuwe reservering voor 4 personen</td>
              <td><span className="badge badge-success">Bevestigd</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}