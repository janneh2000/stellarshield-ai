'use client';

interface NetworkStatsProps {
  stats: {
    latestLedger?: number;
    closedAt?: string;
    txCount?: number;
    failedTxCount?: number;
    operationCount?: number;
    baseFee?: number;
    protocolVersion?: number;
  };
}

export default function NetworkStats({ stats }: NetworkStatsProps) {
  if (!stats || !stats.latestLedger) return null;

  const items = [
    { label: 'Latest Ledger', value: stats.latestLedger?.toLocaleString(), icon: '📦' },
    { label: 'Last Closed', value: stats.closedAt ? new Date(stats.closedAt).toLocaleTimeString() : '-', icon: '⏱️' },
    { label: 'Transactions', value: stats.txCount?.toString() || '0', icon: '📊' },
    { label: 'Failed Txs', value: stats.failedTxCount?.toString() || '0', icon: '❌' },
    { label: 'Operations', value: stats.operationCount?.toString() || '0', icon: '⚙️' },
    { label: 'Base Fee', value: `${stats.baseFee || 100} stroops`, icon: '💰' },
    { label: 'Protocol', value: `v${stats.protocolVersion || '?'}`, icon: '🔧' },
  ];

  return (
    <div className="p-6 rounded-2xl bg-[#111538] border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Stellar Network Status</h3>
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
          <span className="text-xs text-[#00D4AA]">Live</span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {items.map((item) => (
          <div key={item.label} className="p-3 rounded-lg bg-[#0A0E27] border border-gray-800 text-center">
            <span className="text-lg">{item.icon}</span>
            <p className="text-xs text-gray-500 mt-1">{item.label}</p>
            <p className="text-sm font-semibold text-white mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
