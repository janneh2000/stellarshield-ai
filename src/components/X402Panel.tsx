'use client';

import { useState } from 'react';

export default function X402Panel() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);

  const endpoints = [
    {
      id: 'scan',
      method: 'POST',
      path: '/api/scan',
      description: 'Scan a Stellar wallet for security threats',
      price: '0.10 USDC',
      paymentType: 'singleScan',
      example: {
        request: `curl -X POST https://stellarshield.ai/api/scan \\
  -H "Content-Type: application/json" \\
  -H "X-Payment: <signed_stellar_tx_xdr>" \\
  -d '{"address": "GABC...XYZ", "network": "testnet"}'`,
        response402: `{
  "error": "Payment Required",
  "paymentDetails": {
    "version": "2",
    "network": "stellar:testnet",
    "payTo": "GDQP2...YRMO",
    "maxAmountRequired": "0.10",
    "asset": { "code": "USDC" },
    "resource": "/api/scan"
  }
}`,
        response200: `{
  "account": { "balance": "1234.56", "signers": 2 },
  "alerts": [...],
  "aiAnalysis": {
    "riskScore": 35,
    "riskLevel": "medium",
    "findings": [...]
  }
}`,
      },
    },
    {
      id: 'deep',
      method: 'POST',
      path: '/api/deep-analysis',
      description: 'Full AI-powered security audit with Claude',
      price: '0.50 USDC',
      paymentType: 'deepAnalysis',
      example: {
        request: `curl -X POST https://stellarshield.ai/api/deep-analysis \\
  -H "X-Payment: <signed_stellar_tx_xdr>" \\
  -d '{"address": "GABC...XYZ"}'`,
        response402: `{
  "error": "Payment Required",
  "paymentDetails": {
    "maxAmountRequired": "0.50",
    "description": "Deep AI security analysis"
  }
}`,
        response200: `{
  "detailedAnalysis": "## Full Report...",
  "contractAudit": {...},
  "historicalPatterns": {...}
}`,
      },
    },
    {
      id: 'monitor',
      method: 'POST',
      path: '/api/monitor',
      description: 'Start real-time monitoring with instant alerts',
      price: '1.00 USDC/hr',
      paymentType: 'realtimeMonitor',
      example: {
        request: `curl -X POST https://stellarshield.ai/api/monitor \\
  -H "X-Payment: <signed_stellar_tx_xdr>" \\
  -d '{"addresses": ["GABC..."], "webhook": "https://..."}'`,
        response402: `{
  "error": "Payment Required",
  "paymentDetails": {
    "maxAmountRequired": "1.00",
    "description": "1 hour real-time monitoring"
  }
}`,
        response200: `{
  "monitorId": "mon_abc123",
  "status": "active",
  "expiresAt": "2026-04-08T14:00:00Z"
}`,
      },
    },
    {
      id: 'batch',
      method: 'POST',
      path: '/api/batch-scan',
      description: 'Scan multiple addresses in a single request',
      price: '0.05 USDC/addr',
      paymentType: 'batchScan',
      example: {
        request: `curl -X POST https://stellarshield.ai/api/batch-scan \\
  -H "X-Payment: <signed_stellar_tx_xdr>" \\
  -d '{"addresses": ["G...", "G...", "G..."]}'`,
        response402: `{
  "error": "Payment Required",
  "paymentDetails": {
    "maxAmountRequired": "0.15",
    "description": "Batch scan (3 addresses)"
  }
}`,
        response200: `{
  "results": [
    { "address": "G...", "riskScore": 12 },
    { "address": "G...", "riskScore": 67 },
    { "address": "G...", "riskScore": 3 }
  ]
}`,
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#111538] border border-gray-800">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              x402 Payment API
            </h2>
            <p className="text-sm text-gray-400 max-w-2xl">
              StellarShield AI uses the{' '}
              <span className="text-[#00D4AA]">x402 protocol</span> to enable
              AI agents and developers to pay for security scans via USDC
              micropayments on Stellar. No API keys needed — just send payment
              with your request.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#00D4AA]/10 border border-[#00D4AA]/20">
            <span className="text-xs text-[#00D4AA] font-mono">HTTP 402</span>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Request', desc: 'Call any API endpoint without payment', icon: '📤' },
            { step: '2', title: '402 Response', desc: 'Receive payment details in headers', icon: '💳' },
            { step: '3', title: 'Pay via Stellar', desc: 'Sign & submit USDC payment tx', icon: '⭐' },
            { step: '4', title: 'Get Results', desc: 'Resend request with payment proof', icon: '✅' },
          ].map((s) => (
            <div key={s.step} className="p-4 rounded-xl bg-[#0A0E27] border border-gray-800 text-center">
              <span className="text-2xl">{s.icon}</span>
              <p className="text-xs text-[#00D4AA] mt-2 font-medium">Step {s.step}</p>
              <p className="text-sm text-white font-medium mt-1">{s.title}</p>
              <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* API Endpoints */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">API Endpoints</h3>
        {endpoints.map((ep) => (
          <div key={ep.id} className="rounded-xl bg-[#111538] border border-gray-800 overflow-hidden">
            <button
              onClick={() => setSelectedEndpoint(selectedEndpoint === ep.id ? null : ep.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-[#0A0E27]/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <span className="px-2 py-1 rounded text-xs font-bold bg-[#0057FF]/20 text-[#0057FF]">
                  {ep.method}
                </span>
                <span className="text-sm font-mono text-white">{ep.path}</span>
                <span className="text-xs text-gray-500">{ep.description}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-1 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] text-xs font-mono">
                  {ep.price}
                </span>
                <span className="text-gray-500 text-sm">
                  {selectedEndpoint === ep.id ? '▲' : '▼'}
                </span>
              </div>
            </button>

            {selectedEndpoint === ep.id && (
              <div className="p-4 border-t border-gray-800 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Request Example</p>
                  <pre className="p-3 rounded-lg bg-[#0A0E27] text-xs text-gray-300 overflow-x-auto font-mono">
                    {ep.example.request}
                  </pre>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#FF6B35] mb-2">402 Response (No Payment)</p>
                    <pre className="p-3 rounded-lg bg-[#0A0E27] text-xs text-gray-300 overflow-x-auto font-mono">
                      {ep.example.response402}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs text-[#00D4AA] mb-2">200 Response (With Payment)</p>
                    <pre className="p-3 rounded-lg bg-[#0A0E27] text-xs text-gray-300 overflow-x-auto font-mono">
                      {ep.example.response200}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Integration Guide */}
      <div className="p-6 rounded-2xl bg-[#111538] border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">
          Agent Integration Example
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Here&apos;s how an AI agent can use StellarShield AI with x402 payments:
        </p>
        <pre className="p-4 rounded-xl bg-[#0A0E27] text-xs text-gray-300 overflow-x-auto font-mono leading-relaxed">
{`import { StellarShieldClient } from 'stellarshield-ai';

// Initialize the client with your Stellar keypair
const shield = new StellarShieldClient({
  network: 'testnet',
  secretKey: process.env.STELLAR_SECRET_KEY,
});

// AI agent scans a wallet before interacting with it
async function checkWalletSecurity(address: string) {
  // x402 payment is handled automatically
  const result = await shield.scan(address);

  if (result.riskScore > 70) {
    console.log('HIGH RISK - Aborting interaction');
    return false;
  }

  console.log('Wallet appears safe:', result.summary);
  return true;
}

// Use in an agent workflow
const isSafe = await checkWalletSecurity('GABC...XYZ');
if (isSafe) {
  // Proceed with transaction
}`}
        </pre>
      </div>
    </div>
  );
}
