'use client';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '🛡️' },
    { id: 'scan', label: 'Deep Scan', icon: '🔍' },
    { id: 'alerts', label: 'Alerts', icon: '🚨' },
    { id: 'x402', label: 'x402 API', icon: '💳' },
  ];

  return (
    <header className="border-b border-gray-800 bg-[#0A0E27]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D4AA] to-[#0057FF] flex items-center justify-center">
              <span className="text-xl">🛡️</span>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#00D4AA] rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                StellarShield<span className="text-[#00D4AA]"> AI</span>
              </h1>
              <p className="text-xs text-gray-500">Security Agent for Stellar</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#111538] text-[#00D4AA] border border-[#00D4AA]/30'
                    : 'text-gray-400 hover:text-white hover:bg-[#111538]/50'
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Network Indicator */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#111538] border border-gray-700">
              <div className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
              <span className="text-xs text-gray-400">Stellar Testnet</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
