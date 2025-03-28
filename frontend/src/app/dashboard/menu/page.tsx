'use client';

import { useEffect, useState } from 'react';
import '../dashboard.css';

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState('lunch');

  useEffect(() => {
    // Set the title when component mounts
    document.title = 'BrasserieBot - Menu & Prijzen';
  }, []);

  return (
    <div className="page active" id="menu">
      <h1>Menu & Prijzen</h1>
      <p>Beheer je menukaart en prijzen.</p>
      
      <div className="ai-insight">
        <div className="ai-insight-title"><i>🤖</i> AI Inzicht</div>
        <div>De biefstuk en zalmfilet zijn de best verkopende items deze maand, maar de winstmarge op de zalmfilet is 15% lager door gestegen inkoopprijzen.</div>
        <div className="ai-action">
          <div className="ai-action-title"><i>✓</i> Aanbevolen Actie</div>
          <div>Overweeg de prijs van de zalmfilet met €1,50 te verhogen of zoek naar een alternatieve leverancier voor zalm.</div>
        </div>
      </div>
      
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'lunch' ? 'active' : ''}`}
          onClick={() => setActiveTab('lunch')}
        >
          Lunch
        </div>
        <div 
          className={`tab ${activeTab === 'diner' ? 'active' : ''}`}
          onClick={() => setActiveTab('diner')}
        >
          Diner
        </div>
        <div 
          className={`tab ${activeTab === 'dranken' ? 'active' : ''}`}
          onClick={() => setActiveTab('dranken')}
        >
          Dranken
        </div>
        <div 
          className={`tab ${activeTab === 'desserts' ? 'active' : ''}`}
          onClick={() => setActiveTab('desserts')}
        >
          Desserts
        </div>
      </div>
      
      <div className="card">
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
          <h2 style={{margin: 0}}>Menukaart</h2>
          <button className="btn">Nieuw Item</button>
        </div>
        
        <div className="menu-category">
          <h3>Voorgerechten</h3>
          
          <div className="menu-item-row">
            <div className="menu-item-details">
              <div className="menu-item-name">Carpaccio</div>
              <div className="menu-item-description">Rundercarpaccio met parmezaanse kaas, pijnboompitten en truffelmayonaise</div>
            </div>
            <div className="menu-item-price">€12,50</div>
          </div>
          
          <div className="menu-item-row">
            <div className="menu-item-details">
              <div className="menu-item-name">Tomatensoep</div>
              <div className="menu-item-description">Huisgemaakte tomatensoep met basilicum en crème fraîche</div>
            </div>
            <div className="menu-item-price">€6,75</div>
          </div>
          
          <div className="menu-item-row">
            <div className="menu-item-details">
              <div className="menu-item-name">Garnalenkroketjes</div>
              <div className="menu-item-description">Huisgemaakte garnalenkroketjes met citroenmayonaise</div>
            </div>
            <div className="menu-item-price">€9,50</div>
          </div>
        </div>
        
        <div className="menu-category">
          <h3>Hoofdgerechten</h3>
          
          <div className="menu-item-row">
            <div className="menu-item-details">
              <div className="menu-item-name">Biefstuk</div>
              <div className="menu-item-description">Gegrilde biefstuk met seizoensgroenten en pepersaus</div>
            </div>
            <div className="menu-item-price">€23,50</div>
          </div>
          
          <div className="menu-item-row">
            <div className="menu-item-details">
              <div className="menu-item-name">Zalmfilet</div>
              <div className="menu-item-description">Gebakken zalmfilet met hollandaisesaus en geroosterde groenten</div>
            </div>
            <div className="menu-item-price">€21,00</div>
          </div>
          
          <div className="menu-item-row">
            <div className="menu-item-details">
              <div className="menu-item-name">Risotto (V)</div>
              <div className="menu-item-description">Paddenstoelenrisotto met truffelolie en parmezaanse kaas</div>
            </div>
            <div className="menu-item-price">€18,50</div>
          </div>
        </div>
      </div>
    </div>
  );
}