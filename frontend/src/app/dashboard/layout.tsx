'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import './dashboard.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');

  useEffect(() => {
    // Extract the last part of the path to determine active menu item
    const path = pathname.split('/').pop() || 'dashboard';
    setActiveMenuItem(path);
  }, [pathname]);

  return (
    <>
      <Script src="/dashboard-script.js" strategy="afterInteractive" />
      <div className="container">
        <div className="sidebar">
          <div className="logo">
            <h1>BrasserieBot</h1>
            <p>Restaurant Management</p>
          </div>
          <div className="menu">
            <Link 
              href="/dashboard" 
              className={`menu-item ${activeMenuItem === 'dashboard' ? 'active' : ''}`}
              data-page="dashboard"
            >
              <i>📊</i> Dashboard Overview
            </Link>
            <Link 
              href="/dashboard/reservations" 
              className={`menu-item ${activeMenuItem === 'reservations' ? 'active' : ''}`}
              data-page="reservations"
            >
              <i>📅</i> Reservaties Beheer
            </Link>
            <Link 
              href="/dashboard/inventory" 
              className={`menu-item ${activeMenuItem === 'inventory' ? 'active' : ''}`}
              data-page="inventory"
            >
              <i>📦</i> Voorraad & Inkoop
            </Link>
            <Link 
              href="/dashboard/personnel" 
              className={`menu-item ${activeMenuItem === 'personnel' ? 'active' : ''}`}
              data-page="personnel"
            >
              <i>👥</i> Personeel Planning
            </Link>
            <Link 
              href="/dashboard/menu" 
              className={`menu-item ${activeMenuItem === 'menu' ? 'active' : ''}`}
              data-page="menu"
            >
              <i>🍽️</i> Menu & Prijzen
            </Link>
            <Link 
              href="/dashboard/customers" 
              className={`menu-item ${activeMenuItem === 'customers' ? 'active' : ''}`}
              data-page="customers"
            >
              <i>❤️</i> Klanten & Loyaliteit
            </Link>
            <Link 
              href="/dashboard/analytics" 
              className={`menu-item ${activeMenuItem === 'analytics' ? 'active' : ''}`}
              data-page="analytics"
            >
              <i>📈</i> AI Analytics & Inzichten
            </Link>
            <Link 
              href="/dashboard/payments" 
              className={`menu-item ${activeMenuItem === 'payments' ? 'active' : ''}`}
              data-page="payments"
            >
              <i>💳</i> Betalingen & Leveranciers
            </Link>
            <Link 
              href="/dashboard/marketing" 
              className={`menu-item ${activeMenuItem === 'marketing' ? 'active' : ''}`}
              data-page="marketing"
            >
              <i>📣</i> Marketing & Promoties
            </Link>
            <Link 
              href="/dashboard/orders" 
              className={`menu-item ${activeMenuItem === 'orders' ? 'active' : ''}`}
              data-page="orders"
            >
              <i>🛒</i> Online Bestellingen
            </Link>
            <Link 
              href="/dashboard/ai-advisor" 
              className={`menu-item ${activeMenuItem === 'ai-advisor' ? 'active' : ''}`}
              data-page="ai-advisor"
            >
              <i>🤖</i> AI Beslissingsondersteuning
            </Link>
            <Link 
              href="/dashboard/feestzaal" 
              className={`menu-item ${activeMenuItem === 'feestzaal' ? 'active' : ''}`}
              data-page="feestzaal"
            >
              <i>🎉</i> Feestzaal Reserveringen
            </Link>
          </div>
        </div>
        
        <div className="content">
          {children}
        </div>
      </div>
    </>
  );
}