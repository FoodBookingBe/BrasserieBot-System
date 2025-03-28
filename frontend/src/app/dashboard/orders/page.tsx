'use client';

import { useEffect } from 'react';
import '../dashboard.css';

export default function OrdersPage() {
  useEffect(() => {
    // Set the title when component mounts
    document.title = 'BrasserieBot - Online Bestellingen';
  }, []);

  return (
    <div className="page active" id="orders">
      <h1>Online Bestellingen</h1>
      <p>Beheer bestellingen van verschillende online platforms.</p>
      
      <div className="ai-insight">
        <div className="ai-insight-title"><i>🤖</i> AI Inzicht</div>
        <div>Er zijn 4 nieuwe bestellingen binnengekomen in de afgelopen 30 minuten. De gemiddelde bereidingstijd voor deze gerechten is 25 minuten.</div>
        <div className="ai-action">
          <div className="ai-action-title"><i>✓</i> Aanbevolen Actie</div>
          <div>Informeer bezorgers dat de bestellingen rond 20:15 klaar zullen zijn voor bezorging.</div>
        </div>
      </div>
      
      <div className="tabs">
        <div className="tab active">Nieuwe</div>
        <div className="tab">In Voorbereiding</div>
        <div className="tab">Klaar voor Bezorging</div>
        <div className="tab">Bezorgd</div>
        <div className="tab">Alle</div>
      </div>
      
      <div className="stats-container">
        <div className="stat-card">
          <div>Nieuwe Bestellingen</div>
          <div className="stat-value">4</div>
          <div className="stat-change">↑ 2 vs. gisteren</div>
        </div>
        <div className="stat-card">
          <div>In Voorbereiding</div>
          <div className="stat-value">6</div>
          <div className="stat-change">↑ 1 vs. gisteren</div>
        </div>
        <div className="stat-card">
          <div>Klaar voor Bezorging</div>
          <div className="stat-value">3</div>
          <div className="stat-change">↑ 2 vs. gisteren</div>
        </div>
      </div>
      
      <div className="card">
        <h2>Nieuwe Bestellingen</h2>
        <table>
          <thead>
            <tr>
              <th>Bestelnr.</th>
              <th>Platform</th>
              <th>Klant</th>
              <th>Bestelling</th>
              <th>Totaal</th>
              <th>Tijd</th>
              <th>Bezorgmethode</th>
              <th>Status</th>
              <th>Acties</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#ORD-1234</td>
              <td><div className="platform-icon">F</div> FoodBooking</td>
              <td>Jan Jansen<br/>Hoofdstraat 123, Amsterdam</td>
              <td>2x Margherita Pizza<br/>1x Tiramisu<br/>2x Cola</td>
              <td>€32.50</td>
              <td>19:15</td>
              <td>Bezorging</td>
              <td><span className="badge badge-info">Nieuw</span></td>
              <td>
                <div className="action-buttons">
                  <button className="btn btn-sm">✓</button>
                  <button className="btn btn-sm">✗</button>
                  <button className="btn btn-sm">👁️</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>#ORD-1235</td>
              <td><div className="platform-icon">T</div> TakeAway</td>
              <td>Piet de Vries<br/>Kerkstraat 45, Amsterdam</td>
              <td>1x Pasta Carbonara<br/>1x Bruschetta<br/>1x Fanta</td>
              <td>€24.75</td>
              <td>19:22</td>
              <td>Bezorging</td>
              <td><span className="badge badge-info">Nieuw</span></td>
              <td>
                <div className="action-buttons">
                  <button className="btn btn-sm">✓</button>
                  <button className="btn btn-sm">✗</button>
                  <button className="btn btn-sm">👁️</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>#ORD-1236</td>
              <td><div className="platform-icon">D</div> Deliveroo</td>
              <td>Anna Bakker<br/>Prinsengracht 789, Amsterdam</td>
              <td>2x Hamburger Deluxe<br/>1x Friet<br/>2x Milkshake</td>
              <td>€29.90</td>
              <td>19:30</td>
              <td>Bezorging</td>
              <td><span className="badge badge-info">Nieuw</span></td>
              <td>
                <div className="action-buttons">
                  <button className="btn btn-sm">✓</button>
                  <button className="btn btn-sm">✗</button>
                  <button className="btn btn-sm">👁️</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>#ORD-1237</td>
              <td><div className="platform-icon">U</div> Ubereats</td>
              <td>Sander Visser<br/>Afhalen</td>
              <td>1x Salade Niçoise<br/>1x Soep van de Dag<br/>1x Mineraalwater</td>
              <td>€18.50</td>
              <td>19:45</td>
              <td>Afhalen</td>
              <td><span className="badge badge-info">Nieuw</span></td>
              <td>
                <div className="action-buttons">
                  <button className="btn btn-sm">✓</button>
                  <button className="btn btn-sm">✗</button>
                  <button className="btn btn-sm">👁️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}