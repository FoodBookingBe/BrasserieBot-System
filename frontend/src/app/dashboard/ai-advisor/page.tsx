'use client';

import { useEffect } from 'react';
import '../dashboard.css';

export default function AIAdvisorPage() {
  useEffect(() => {
    // Set the title when component mounts
    document.title = 'BrasserieBot - AI Beslissingsondersteuning';
  }, []);

  return (
    <div className="page active" id="ai-assistant">
      <h1>AI Beslissingsondersteuning</h1>
      <p>Geavanceerde AI-ondersteuning voor dagelijkse beslissingen in uw restaurant.</p>
      
      <div className="stats-container">
        <div className="stat-card">
          <div>Actieve Voorspellingen</div>
          <div className="stat-value">8</div>
          <div>Weer, voorraad, personeel, etc.</div>
        </div>
        <div className="stat-card">
          <div>Nauwkeurigheid</div>
          <div className="stat-value">92%</div>
          <div>Gebaseerd op historische data</div>
        </div>
        <div className="stat-card">
          <div>Besparingen</div>
          <div className="stat-value">€1,850</div>
          <div>Deze maand door AI-suggesties</div>
        </div>
      </div>
      
      <div className="card">
        <h2>Huidige Inzichten & Aanbevelingen</h2>
        
        <div className="ai-insight">
          <div className="ai-insight-title"><i>🌤️</i> Weersvoorspelling & Impact</div>
          <div>Komend weekend wordt het 28°C en zonnig. Historische data toont 35% meer terrasbezoek bij deze weersomstandigheden.</div>
          <div className="ai-action">
            <div className="ai-action-title"><i>✓</i> Aanbevolen Actie</div>
            <div>Plan 3 extra personeelsleden in voor zaterdag en zondag tussen 12:00-22:00 uur.</div>
            <button className="btn btn-sm" style={{marginTop: "10px"}}>Toepassen</button>
          </div>
        </div>
        
        <div className="ai-insight">
          <div className="ai-insight-title"><i>📦</i> Voorraadoptimalisatie</div>
          <div>De voorraad frisdrank is 15% lager dan optimaal voor het verwachte weer. Risico op tekort: 75%.</div>
          <div className="ai-action">
            <div className="ai-action-title"><i>✓</i> Aanbevolen Actie</div>
            <div>Bestel 24 extra flessen cola, 18 flessen fanta en 12 flessen mineraalwater.</div>
            <button className="btn btn-sm" style={{marginTop: "10px"}}>Toepassen</button>
          </div>
        </div>
        
        <div className="ai-insight">
          <div className="ai-insight-title"><i>💰</i> Prijsoptimalisatie</div>
          <div>De winstmarge op de zalmfilet is 15% lager door gestegen inkoopprijzen. Concurrenten hebben hun prijzen al verhoogd.</div>
          <div className="ai-action">
            <div className="ai-action-title"><i>✓</i> Aanbevolen Actie</div>
            <div>Verhoog de prijs van de zalmfilet met €1,50 naar €22,50 om de winstmarge te herstellen.</div>
            <button className="btn btn-sm" style={{marginTop: "10px"}}>Toepassen</button>
          </div>
        </div>
        
        <div className="ai-insight">
          <div className="ai-insight-title"><i>👥</i> Klantbehoud</div>
          <div>5 Gold Members hebben in de afgelopen 3 weken niet gereserveerd, terwijl ze normaal wekelijks komen.</div>
          <div className="ai-action">
            <div className="ai-action-title"><i>✓</i> Aanbevolen Actie</div>
            <div>Stuur een gepersonaliseerde e-mail met een speciale aanbieding voor hun favoriete gerechten.</div>
            <button className="btn btn-sm" style={{marginTop: "10px"}}>Toepassen</button>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2>Historische Nauwkeurigheid</h2>
        <div style={{height: "200px", backgroundColor: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center"}}>
          Grafiek: AI Voorspellingsnauwkeurigheid
        </div>
      </div>
      
      <div className="card">
        <h2>AI Instellingen</h2>
        
        <div className="form-group">
          <label htmlFor="prediction-frequency">Voorspellingsfrequentie</label>
          <select id="prediction-frequency" className="form-control" aria-label="Voorspellingsfrequentie" defaultValue="twice">
            <option value="daily">Dagelijks</option>
            <option value="twice">Twee keer per dag</option>
            <option value="hourly">Elk uur</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="recommendation-priority">Prioriteit van aanbevelingen</label>
          <select id="recommendation-priority" className="form-control" aria-label="Prioriteit van aanbevelingen" defaultValue="balanced">
            <option value="cost">Kostenbesparingen</option>
            <option value="balanced">Gebalanceerd</option>
            <option value="customer">Klanttevredenheid</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="auto-apply">Automatisch toepassen van aanbevelingen</label>
          <select id="auto-apply" className="form-control" aria-label="Automatisch toepassen van aanbevelingen" defaultValue="low-risk">
            <option value="never">Nooit (alleen suggesties)</option>
            <option value="low-risk">Alleen laag-risico aanbevelingen</option>
            <option value="all">Alle aanbevelingen</option>
          </select>
        </div>
        
        <button className="btn">Instellingen Opslaan</button>
      </div>
    </div>
  );
}