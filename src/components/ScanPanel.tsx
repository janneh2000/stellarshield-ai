'use client';

import { useState } from 'react';

interface ScanPanelProps {
  onScan: (address: string) => void;
  isScanning: boolean;
  scanResult: any | null;
}

export default function ScanPanel({
  onScan,
  isScanning,
  scanResult,
}: ScanPanelProps) {
  const [address, setAddress] = useState('');
  const [scanType, setScanType] = useState<'quick' | 'deep' | 'realtime'>('deep');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim() && !isScanning) {
      onScan(address.trim());
    }
  };

  return (
    <div className="space-y-8">
      {/* Scan Configuration */}
      <div className="p-6 rounded-2xl bg-[#111538] border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-6">Deep Security Scan</h2>

        {/* Scan Type Selection */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              id: 'quick' as const,
              label: 'Quick Scan',
              desc: 'Basic threat check',
              icon: '⚡',
              price: '$0.10',
            },
            {
              id: 'deep' as const,
              label: 'Deep Analysis',
              desc: 'Full AI security audit',
              icon: '🔬',
              price: '$0.50',
            },
            {
              id: 'realtime' as const,
              label: 'Real-time Monitor',
              desc: 'Continuous protection',
              icon: '📡',
              price: '$1.00/hr',
            },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setScanType(type.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                scanType === type.id
                  ? 'border-[#00D4AA] bg-[#00D4AA]/5'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <span className="text-2xl">{type.icon}</span>
              <h3 className="text-sm font-medium text-white mt-2">
                {type.label}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
              <p className="text-xs text-[#00D4AA] mt-2 font-mono">
                {type.price} USDC
              </p>
            </button>
          ))}
        </div>

        {/* Address Input */}
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter Stellar address (G...)"
              className="flex-1 px-4 py-3 rounded-xl bg-[#0A0E27] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4AA] text-sm font-mono"
            />
            <button
              type="submit"
              disabled={!address.trim() || isScanning}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#00D4AA] to-[#0057FF] text-white font-medium text-sm disabled:opacity-50 hover:shadow-lg hover:shadow-[#00D4AA]/20 transition-all whitespace-nowrap"
            >
              {isScanning ? (
                <span className="flex items-center">
                  <svg className="animate-spin mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                `Run ${scanType === 'quick' ? 'Quick' : scanType === 'deep' ? 'Deep' : 'RT'} Scan`
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Scan Results */}
      {scanResult && (
        <div className="space-y-6">
          {/* Account Info */}
          {scanResult.account && (
            <div className="p-6 rounded-2xl bg-[#111538] border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">
                Account Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm text-white font-mono mt-1">
                    {scanResult.account.address?.substring(0, 12)}...
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Balance</p>
                  <p className="text-sm text-white mt-1">
                    {parseFloat(scanResult.account.balance || 0).toLocaleString()} XLM
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Trustlines</p>
                  <p className="text-sm text-white mt-1">
                    {scanResult.account.trustlines?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Signers</p>
                  <p className="text-sm text-white mt-1">
                    {scanResult.account.signers?.length || 0}
                  </p>
                </div>
              </div>

              {/* Trustlines */}
              {scanResult.account.trustlines?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Active Trustlines</p>
                  <div className="flex flex-wrap gap-2">
                    {scanResult.account.trustlines.map((t: any, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-lg bg-[#0A0E27] border border-gray-700 text-xs text-gray-300"
                      >
                        {t.asset_code}: {parseFloat(t.balance).toFixed(2)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Analysis Detail */}
          {scanResult.aiAnalysis?.detailedAnalysis && (
            <div className="p-6 rounded-2xl bg-[#111538] border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">
                Detailed AI Analysis
              </h3>
              <div className="prose prose-invert prose-sm max-w-none">
                <div
                  className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: scanResult.aiAnalysis.detailedAnalysis
                      .replace(/## /g, '<h3 class="text-white text-base font-semibold mt-4 mb-2">')
                      .replace(/### /g, '<h4 class="text-gray-200 text-sm font-medium mt-3 mb-1">')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                      .replace(/\n/g, '<br/>'),
                  }}
                />
              </div>
            </div>
          )}

          {/* Transaction Analysis */}
          {scanResult.transactions?.length > 0 && (
            <div className="p-6 rounded-2xl bg-[#111538] border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">
                Recent Transactions ({scanResult.transactions.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {scanResult.transactions.slice(0, 15).map((tx: any) => (
                  <div
                    key={tx.hash}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#0A0E27] border border-gray-800 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          tx.successful ? 'bg-[#00D4AA]' : 'bg-[#FF3366]'
                        }`}
                      />
                      <div>
                        <p className="text-xs text-white font-mono">
                          {tx.hash?.substring(0, 16)}...
                        </p>
                        <p className="text-xs text-gray-500">
                          {tx.operation_count} op(s) • Fee: {tx.fee_charged} stroops
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(tx.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
