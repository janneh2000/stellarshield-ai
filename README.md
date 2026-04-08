# 🛡️ StellarShield AI

**AI-Powered Security Monitoring Agent for the Stellar Network**

> Built for [Stellar Hacks: Agents](https://dorahacks.io/hackathon/stellar-agents-x402-stripe-mpp/detail) Hackathon 2026

![StellarShield AI](https://img.shields.io/badge/Stellar-Agents-blue) ![x402](https://img.shields.io/badge/x402-Payments-green) ![Claude AI](https://img.shields.io/badge/Claude-AI-orange) ![Soroban](https://img.shields.io/badge/Soroban-Smart_Contract-purple)

---

## 🎯 Problem

The Stellar ecosystem is rapidly growing with 800+ projects and 10M+ active accounts, but **security tooling hasn't kept pace**. Users face threats from phishing memos, rug pulls, dust attacks, account draining, and malicious smart contracts — often with no way to detect them before it's too late.

## 💡 Solution

**StellarShield AI** is an intelligent security agent that protects Stellar users by:

1. **Real-time Transaction Monitoring** — Streams and analyzes Stellar transactions via Horizon API to detect threats as they happen
2. **AI-Powered Threat Detection** — Uses pattern recognition and Claude AI to identify phishing, rug pulls, wash trading, dust attacks, and more
3. **x402 Micropayment API** — Enables AI agents and developers to pay-per-scan using USDC on Stellar via the x402 protocol
4. **On-Chain Security Registry** — Soroban smart contract that stores community-reported threat intelligence on-chain

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   StellarShield AI                       │
├──────────────┬──────────────┬──────────────┬────────────┤
│  Next.js     │  Threat      │  x402        │  Soroban   │
│  Dashboard   │  Detection   │  Payment     │  Contract  │
│              │  Engine      │  Gateway     │            │
├──────────────┼──────────────┼──────────────┼────────────┤
│  React UI    │  Pattern     │  HTTP 402    │  Security  │
│  Real-time   │  Rules +     │  USDC on     │  Registry  │
│  Monitoring  │  AI Analysis │  Stellar     │  On-Chain  │
└──────┬───────┴──────┬───────┴──────┬───────┴─────┬──────┘
       │              │              │             │
       ▼              ▼              ▼             ▼
  ┌─────────┐  ┌───────────┐  ┌──────────┐  ┌─────────┐
  │ Horizon │  │  Claude   │  │ Stellar  │  │ Soroban │
  │   API   │  │    AI     │  │ Network  │  │   RPC   │
  └─────────┘  └───────────┘  └──────────┘  └─────────┘
```

## 🔍 Threat Detection Capabilities

| Threat Type | Detection Method | Severity |
|-------------|------------------|----------|
| **Memo Scams** | Pattern matching against known phishing templates | High |
| **Dust Attacks** | Micro-payment + memo combo detection | Medium |
| **Rug Pull Setup** | Bulk trustline manipulation analysis | High |
| **Account Drains** | Account merge operation monitoring | Critical |
| **High-Value Transfers** | Threshold-based anomaly detection | Medium |
| **Rapid Tx Bursts** | Time-window transaction counting | High |
| **Unusual Fees** | Exponential moving average deviation | Low |
| **Missing Multi-Sig** | High-balance single-signer detection | Medium |

## 💳 x402 Payment Integration

StellarShield AI implements the **x402 protocol** — enabling AI agents to pay for security scans via USDC micropayments on Stellar. No API keys, no subscriptions.

### How it works:

```
1. Agent sends request → POST /api/scan
2. Server returns HTTP 402 with payment details
3. Agent signs USDC payment on Stellar
4. Agent resends request with X-Payment header
5. Server verifies payment, returns scan results
```

### Pricing:

| Service | Price | Description |
|---------|-------|-------------|
| Quick Scan | 0.10 USDC | Basic threat check |
| Deep Analysis | 0.50 USDC | Full AI security audit |
| Real-time Monitor | 1.00 USDC/hr | Continuous protection |
| Batch Scan | 0.05 USDC/addr | Multi-address scanning |

## ⛓️ Soroban Smart Contract

The **Security Registry** contract provides decentralized, on-chain threat intelligence:

```rust
// Report a malicious address
fn report_address(reporter, target, threat_level, score, category) -> SecurityReport

// Check if an address is flagged
fn is_flagged(target) -> bool

// Get risk score (0-100)
fn get_risk_score(target) -> u32

// Batch check multiple addresses
fn batch_check(targets) -> Vec<u32>
```

Any Stellar dApp or wallet can query the registry before processing transactions to protect their users.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/stellarshield-ai.git
cd stellarshield-ai

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` to access the dashboard.

### Scan a Wallet

1. Enter a Stellar address in the search bar (or use a demo address)
2. Click "Scan Wallet"
3. View the AI security analysis, threat alerts, and recommendations

### API Usage

```bash
# Scan an address
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"address": "GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR"}'

# Get network stats
curl http://localhost:3000/api/network-stats

# Deep analysis
curl -X POST http://localhost:3000/api/deep-analysis \
  -H "Content-Type: application/json" \
  -d '{"address": "GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR"}'
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Blockchain**: Stellar SDK, Horizon API, Soroban (Rust)
- **AI**: Claude AI for intelligent threat analysis
- **Payments**: x402 protocol with USDC on Stellar
- **Language**: TypeScript, Rust

## 📁 Project Structure

```
stellarshield-ai/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/
│   │   │   ├── scan/           # Wallet scanning endpoint
│   │   │   ├── deep-analysis/  # Deep AI analysis endpoint
│   │   │   └── network-stats/  # Network statistics endpoint
│   │   ├── layout.tsx          # App layout
│   │   ├── page.tsx            # Main dashboard page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── Header.tsx          # Navigation header
│   │   ├── HeroSection.tsx     # Hero with scan input
│   │   ├── Dashboard.tsx       # Main dashboard view
│   │   ├── ScanPanel.tsx       # Deep scan interface
│   │   ├── AlertsFeed.tsx      # Security alerts feed
│   │   ├── NetworkStats.tsx    # Stellar network stats
│   │   └── X402Panel.tsx       # x402 API documentation
│   ├── lib/
│   │   ├── stellar-monitor.ts  # Stellar Horizon integration
│   │   ├── threat-detector.ts  # Threat detection engine
│   │   ├── ai-agent.ts         # AI analysis engine
│   │   └── x402-payment.ts     # x402 payment protocol
│   └── contracts/
│       └── security_registry/
│           ├── lib.rs           # Soroban smart contract
│           └── Cargo.toml       # Rust dependencies
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🏆 Hackathon Tracks

This project addresses multiple hackathon themes:

- **Agents**: AI security agent that autonomously monitors and protects Stellar wallets
- **x402**: Full x402 protocol implementation for pay-per-scan micropayments
- **Claude**: Claude AI-powered threat analysis and natural language security reports
- **Blockchain/Crypto**: Deep Stellar network integration with Soroban smart contracts
- **OpenClaw**: Compatible with OpenClaw agent framework for autonomous security monitoring

## 🔮 Future Roadmap

- [ ] Live Stellar mainnet deployment
- [ ] Real-time WebSocket streaming for continuous monitoring
- [ ] Claude API integration for natural language threat explanations
- [ ] Browser extension for wallet-level protection
- [ ] Community-driven threat intelligence via the Soroban registry
- [ ] Cross-chain monitoring via Chainlink CCIP
- [ ] Mobile app with push notifications for alerts
- [ ] Integration with Stellar Disbursement Platform

## 📄 License

MIT License — Built with ❤️ for the Stellar ecosystem.

---

**StellarShield AI** — *Securing the Stellar network, one transaction at a time.*
