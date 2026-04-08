'use client';

import { useState, useEffect, useCallback } from 'react';
import Dashboard from '@/components/Dashboard';
import ScanPanel from '@/components/ScanPanel';
import AlertsFeed from '@/components/AlertsFeed';
import NetworkStats from '@/components/NetworkStats';
import X402Panel from '@/components/X402Panel';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ScanProgress from '@/components/ScanProgress';

export interface AppState {
  isScanning: boolean;
  scanTarget: string;
  alerts: any[];
  scanResult: any | null;
  networkStats: any | null;
  scanHistory: ScanHistoryEntry[];
  activeTab: 'dashboard' | 'scan' | 'alerts' | 'x402';
}

export interface ScanHistoryEntry {
  id: string;
  address: string;
  timestamp: string;
  riskScore: number;
  alertCount: number;
}

export default function Home() {
  const [state, setState] = useState<AppState>({
    isScanning: false,
    scanTarget: '',
    alerts: [],
    scanResult: null,
    networkStats: null,
    scanHistory: [],
    activeTab: 'dashboard',
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fetch network stats on mount
    fetchNetworkStats();
  }, []);

  const fetchNetworkStats = async () => {
    try {
      const res = await fetch('/api/network-stats');
      const data = await res.json();
      setState((prev) => ({ ...prev, networkStats: data }));
    } catch (error) {
      console.error('Failed to fetch network stats:', error);
    }
  };

  const handleScan = useCallback(async (address: string) => {
    setState((prev) => ({ ...prev, isScanning: true, scanTarget: address }));

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, network: 'testnet' }),
      });

      const data = await res.json();

      const historyEntry: ScanHistoryEntry = {
        id: `scan_${Date.now()}`,
        address,
        timestamp: new Date().toISOString(),
        riskScore: data.aiAnalysis?.riskScore || 0,
        alertCount: data.alerts?.length || 0,
      };

      setState((prev) => ({
        ...prev,
        isScanning: false,
        scanResult: data,
        alerts: [...(data.alerts || []), ...prev.alerts].slice(0, 100),
        scanHistory: [historyEntry, ...prev.scanHistory].slice(0, 20),
      }));
    } catch (error) {
      console.error('Scan failed:', error);
      setState((prev) => ({ ...prev, isScanning: false }));
    }
  }, []);

  const setActiveTab = (tab: AppState['activeTab']) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen">
      <ScanProgress isScanning={state.isScanning} />
      <Header activeTab={state.activeTab} setActiveTab={setActiveTab} />

      {state.activeTab === 'dashboard' && (
        <>
          <HeroSection onScan={handleScan} isScanning={state.isScanning} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Dashboard
              scanResult={state.scanResult}
              networkStats={state.networkStats}
              scanHistory={state.scanHistory}
              alerts={state.alerts}
            />
          </div>
        </>
      )}

      {state.activeTab === 'scan' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ScanPanel
            onScan={handleScan}
            isScanning={state.isScanning}
            scanResult={state.scanResult}
          />
        </div>
      )}

      {state.activeTab === 'alerts' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AlertsFeed alerts={state.alerts} />
        </div>
      )}

      {state.activeTab === 'x402' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <X402Panel />
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>
            StellarShield AI — Built for Stellar Hacks: Agents Hackathon 2026
          </p>
          <p className="mt-1">
            Powered by Stellar Network • x402 Protocol • Claude AI
          </p>
        </div>
      </footer>
    </main>
  );
}
