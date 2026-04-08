'use client';

import { ScanHistoryEntry } from '@/app/page';
import NetworkStats from '@/components/NetworkStats';

interface DashboardProps {
  scanResult: any | null;
  networkStats: any | null;
  scanHistory: ScanHistoryEntry[];
  alerts: any[];
}

function RiskMeter({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 70) return '#FF3366';
    if (score >= 45) return '#FF6B35';
    if (score >= 25) return '#FFD700';
    return '#00D4AA';
  };

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="#1E2248"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-xs text-gray-400">Risk Score</span>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color = 'accent',
}: {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    accent: 'border-[#00D4AA]/20 text-[#00D4AA]',
    danger: 'border-[#FF3366]/20 text-[#FF3366]',
    warning: 'border-[#FF6B35]/20 text-[#FF6B35]',
    blue: 'border-[#0057FF]/20 text-[#0057FF]',
  };

  return (
    <div
      className={`p-4 rounded-xl bg-[#111538] border ${colorMap[color]?.split(' ')[0] || 'border-gray-700'}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-medium ${colorMap[color]?.split(' ')[1] || 'text-gray-400'}`}>
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

export default function Dashboard({
  scanResult,
  networkStats,
  scanHistory,
  alerts,
}: DashboardProps) {
  const aiAnalysis = scanResult?.aiAnalysis;
  const criticalCount = alerts.filter((a: any) => a.level === 'critical').length;
  const highCount = alerts.filter((a: any) => a.level === 'high').length;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Scans"
          value={scanHistory.length}
          icon="🔍"
          color="blue"
        />
        <StatCard
          label="Alerts Found"
          value={alerts.length}
          icon="🚨"
          color={alerts.length > 0 ? 'warning' : 'accent'}
        />
        <StatCard
          label="Critical"
          value={criticalCount}
          icon="⚠️"
          color={criticalCount > 0 ? 'danger' : 'accent'}
        />
        <StatCard
          label="Network"
          value={networkStats ? 'Online' : 'Connecting...'}
          icon="🌐"
          color="accent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risk Assessment */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-2xl bg-[#111538] border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">
              Risk Assessment
            </h3>
            {aiAnalysis ? (
              <>
                <RiskMeter score={aiAnalysis.riskScore} />
                <div className="mt-4 text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      aiAnalysis.riskLevel === 'critical'
                        ? 'bg-[#FF3366]/20 text-[#FF3366]'
                        : aiAnalysis.riskLevel === 'high'
                          ? 'bg-[#FF6B35]/20 text-[#FF6B35]'
                          : aiAnalysis.riskLevel === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-[#00D4AA]/20 text-[#00D4AA]'
                    }`}
                  >
                    {aiAnalysis.riskLevel?.toUpperCase()} RISK
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-400 text-center">
                  {aiAnalysis.summary?.substring(0, 150)}...
                </p>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🛡️</div>
                <p className="text-gray-400 text-sm">
                  Scan a wallet to see risk assessment
                </p>
              </div>
            )}
          </div>
        </div>

        {/* AI Analysis */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-2xl bg-[#111538] border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">
              AI Security Analysis
            </h3>
            {aiAnalysis ? (
              <div className="space-y-4">
                {/* Findings */}
                {aiAnalysis.findings?.map((finding: any, i: number) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border ${
                      finding.severity === 'critical'
                        ? 'border-[#FF3366]/30 bg-[#FF3366]/5'
                        : finding.severity === 'high'
                          ? 'border-[#FF6B35]/30 bg-[#FF6B35]/5'
                          : finding.severity === 'medium'
                            ? 'border-yellow-500/30 bg-yellow-500/5'
                            : 'border-gray-700 bg-[#0A0E27]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-white">
                          {finding.category}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {finding.description}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          finding.severity === 'critical'
                            ? 'bg-[#FF3366]/20 text-[#FF3366]'
                            : finding.severity === 'high'
                              ? 'bg-[#FF6B35]/20 text-[#FF6B35]'
                              : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {finding.severity?.toUpperCase()}
                      </span>
                    </div>
                    {finding.evidence && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {finding.evidence.map((e: string, j: number) => (
                          <span
                            key={j}
                            className="px-2 py-0.5 rounded bg-[#0A0E27] text-xs text-gray-400"
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Recommendations */}
                {aiAnalysis.recommendations?.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#00D4AA]/5 border border-[#00D4AA]/20">
                    <h4 className="text-sm font-medium text-[#00D4AA] mb-2">
                      Recommendations
                    </h4>
                    <ul className="space-y-1.5">
                      {aiAnalysis.recommendations.map(
                        (rec: string, i: number) => (
                          <li
                            key={i}
                            className="text-xs text-gray-300 flex items-start"
                          >
                            <span className="text-[#00D4AA] mr-2 mt-0.5">→</span>
                            {rec}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🤖</div>
                <p className="text-gray-400">
                  Enter a Stellar address above to run an AI security analysis
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Our AI agent will analyze transactions, detect threats, and
                  provide security recommendations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div className="p-6 rounded-2xl bg-[#111538] border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">
            Scan History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-gray-800">
                  <th className="pb-3 text-left font-medium">Address</th>
                  <th className="pb-3 text-left font-medium">Time</th>
                  <th className="pb-3 text-center font-medium">Risk Score</th>
                  <th className="pb-3 text-center font-medium">Alerts</th>
                </tr>
              </thead>
              <tbody>
                {scanHistory.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-gray-800/50 hover:bg-[#0A0E27]/50 transition-colors"
                  >
                    <td className="py-3 font-mono text-xs text-gray-300">
                      {entry.address.substring(0, 8)}...
                      {entry.address.substring(entry.address.length - 8)}
                    </td>
                    <td className="py-3 text-gray-400 text-xs">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          entry.riskScore >= 70
                            ? 'bg-[#FF3366]/20 text-[#FF3366]'
                            : entry.riskScore >= 45
                              ? 'bg-[#FF6B35]/20 text-[#FF6B35]'
                              : entry.riskScore >= 25
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-[#00D4AA]/20 text-[#00D4AA]'
                        }`}
                      >
                        {entry.riskScore}/100
                      </span>
                    </td>
                    <td className="py-3 text-center text-gray-300">
                      {entry.alertCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Network Stats */}
      {networkStats && <NetworkStats stats={networkStats} />}
    </div>
  );
}
