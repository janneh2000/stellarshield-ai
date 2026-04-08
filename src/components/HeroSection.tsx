'use client';

import { useState } from 'react';

interface HeroSectionProps {
  onScan: (address: string) => void;
  isScanning: boolean;
}

// Demo addresses on Stellar testnet for quick testing
const DEMO_ADDRESSES = [
  {
    label: 'SDF Account',
    address: 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR',
  },
  {
    label: 'Test Account',
    address: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOBD3CAEDAD3YRMO',
  },
];

export default function HeroSection({ onScan, isScanning }: HeroSectionProps) {
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim() && !isScanning) {
      onScan(address.trim());
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0057FF]/5 to-transparent" />
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-[#00D4AA]/5 rounded-full blur-3xl" />
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-[#0057FF]/5 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#111538] border border-[#00D4AA]/20 text-[#00D4AA] text-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-[#00D4AA] mr-2 animate-pulse" />
          AI-Powered Security • x402 Enabled • Built on Stellar
        </div>

        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
          Intelligent Threat Detection
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4AA] to-[#0057FF]">
            for the Stellar Network
          </span>
        </h2>

        <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
          Monitor wallets, detect scams, analyze smart contracts, and protect
          your assets with AI-powered security analysis — pay per scan with x402
          micropayments.
        </p>

        {/* Scan Input */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="relative flex items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter Stellar address to scan (G...)"
                className="w-full px-5 py-4 pr-36 rounded-2xl bg-[#111538] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4AA] focus:ring-1 focus:ring-[#00D4AA]/50 transition-all text-sm"
              />
              <button
                type="submit"
                disabled={!address.trim() || isScanning}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00D4AA] to-[#0057FF] text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#00D4AA]/20 transition-all"
              >
                {isScanning ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Scanning...
                  </span>
                ) : (
                  'Scan Wallet'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Demo addresses */}
        <div className="mt-4 flex items-center justify-center space-x-3 text-sm">
          <span className="text-gray-500">Try:</span>
          {DEMO_ADDRESSES.map((demo) => (
            <button
              key={demo.address}
              onClick={() => {
                setAddress(demo.address);
                onScan(demo.address);
              }}
              disabled={isScanning}
              className="px-3 py-1 rounded-lg bg-[#111538] border border-gray-700 text-gray-400 hover:text-[#00D4AA] hover:border-[#00D4AA]/30 transition-all text-xs disabled:opacity-50"
            >
              {demo.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
