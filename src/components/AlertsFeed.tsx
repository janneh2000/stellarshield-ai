'use client';

interface AlertsFeedProps {
  alerts: any[];
}

const levelConfig: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  critical: {
    bg: 'bg-[#FF3366]/10',
    border: 'border-[#FF3366]/30',
    text: 'text-[#FF3366]',
    icon: '🚨',
  },
  high: {
    bg: 'bg-[#FF6B35]/10',
    border: 'border-[#FF6B35]/30',
    text: 'text-[#FF6B35]',
    icon: '⚠️',
  },
  medium: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    icon: '🔔',
  },
  low: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: '💡',
  },
  info: {
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    text: 'text-gray-400',
    icon: 'ℹ️',
  },
};

export default function AlertsFeed({ alerts }: AlertsFeedProps) {
  if (alerts.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-[#111538] border border-gray-800 text-center">
        <div className="text-5xl mb-4">🛡️</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Alerts Yet</h3>
        <p className="text-gray-400">
          Scan a wallet address to start detecting threats. Alerts will appear here in
          real-time as they are discovered.
        </p>
      </div>
    );
  }

  const sortedAlerts = [...alerts].sort((a, b) => {
    const levelOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    return (
      (levelOrder[a.level as keyof typeof levelOrder] || 4) -
      (levelOrder[b.level as keyof typeof levelOrder] || 4)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          Security Alerts ({alerts.length})
        </h2>
        <div className="flex gap-2">
          {['critical', 'high', 'medium', 'low'].map((level) => {
            const count = alerts.filter((a: any) => a.level === level).length;
            if (count === 0) return null;
            const config = levelConfig[level];
            return (
              <span
                key={level}
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
              >
                {count} {level}
              </span>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {sortedAlerts.map((alert: any, index: number) => {
          const config = levelConfig[alert.level] || levelConfig.info;
          return (
            <div
              key={alert.id || index}
              className={`p-5 rounded-xl ${config.bg} border ${config.border} transition-all hover:scale-[1.005]`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-xl mt-0.5">{config.icon}</span>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {alert.description}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${config.text} ${config.bg}`}
                  >
                    {alert.level?.toUpperCase()}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Score: {alert.score}/100
                  </p>
                </div>
              </div>

              {/* Indicators */}
              {alert.indicators?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {alert.indicators.map((ind: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-[#0A0E27]/80 text-xs text-gray-400"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              )}

              {/* Recommendation */}
              {alert.recommendation && (
                <div className="mt-3 p-3 rounded-lg bg-[#0A0E27]/60 border border-gray-800">
                  <p className="text-xs text-[#00D4AA]">
                    <span className="font-medium">Recommendation:</span>{' '}
                    {alert.recommendation}
                  </p>
                </div>
              )}

              {/* Meta */}
              <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                {alert.affectedAccount && (
                  <span className="font-mono">
                    Account: {alert.affectedAccount?.substring(0, 8)}...
                  </span>
                )}
                {alert.transactionHash && (
                  <span className="font-mono">
                    Tx: {alert.transactionHash?.substring(0, 12)}...
                  </span>
                )}
                <span>{alert.category}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
