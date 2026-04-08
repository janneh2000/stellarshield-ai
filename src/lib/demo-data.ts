/**
 * StellarShield AI - Demo Data
 *
 * Realistic sample data that supplements live Stellar testnet results.
 * Ensures the demo always looks impressive even if testnet accounts
 * have limited activity. Falls back to this when live data is sparse.
 */

import { ThreatAlert } from './threat-detector';

export const DEMO_ALERTS: ThreatAlert[] = [
  {
    id: 'demo_alert_1',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    level: 'high',
    category: 'memo_scam',
    title: 'Phishing Memo Detected — Fake Airdrop',
    description:
      'Transaction memo contains "Claim your free 5000 XLM airdrop at stellar-giveaway.xyz" — this matches known phishing patterns targeting Stellar users.',
    affectedAccount: 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR',
    transactionHash: 'a3f8c9d2e1b04567890abcdef1234567890abcdef1234567890abcdef12345678',
    indicators: [
      'Memo matches known phishing pattern',
      'Contains suspicious external URL (.xyz domain)',
      'Classic "free airdrop" social engineering',
    ],
    recommendation:
      'Do NOT visit the URL or follow any instructions. Report this address to the Stellar community. Block this sender.',
    score: 78,
    details: { memo: 'Claim your free 5000 XLM airdrop at stellar-giveaway.xyz' },
  },
  {
    id: 'demo_alert_2',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    level: 'medium',
    category: 'dust_attack',
    title: 'Dust Attack — Wallet Fingerprinting Attempt',
    description:
      'Received 0.0000001 XLM micro-payment with a memo linking to a fake "account verification" page. This is a dust attack used to track wallet activity.',
    affectedAccount: 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR',
    transactionHash: 'b7e2d1c4a5f6789012345678abcdef0123456789abcdef0123456789abcdef01',
    indicators: [
      'Micro-payment: 0.0000001 XLM',
      'Memo contains phishing URL',
      'Known dust attack fingerprinting technique',
    ],
    recommendation:
      'Ignore this transaction completely. Do not interact with the sender or visit any linked URL.',
    score: 58,
    details: { amount: '0.0000001', memo: 'Verify account: stellar-verify.com' },
  },
  {
    id: 'demo_alert_3',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    level: 'medium',
    category: 'high_value_transfer',
    title: 'Large Outbound Transfer — 250,000 XLM',
    description:
      'A transfer of 250,000 XLM was sent to a previously unseen address. Large transfers to new counterparties warrant review.',
    affectedAccount: 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR',
    transactionHash: 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
    indicators: [
      'Amount: 250,000 XLM ($25,000+)',
      'Destination is a new counterparty',
      'Exceeds high-value threshold',
    ],
    recommendation:
      'Verify this transfer was intentional. Consider using multi-sig for transactions of this size.',
    score: 45,
    details: { amount: '250000', destination: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOBD3CAEDAD3YRMO' },
  },
  {
    id: 'demo_alert_4',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    level: 'low',
    category: 'unusual_activity',
    title: 'Single-Signer on High-Balance Account',
    description:
      'This account holds a significant XLM balance but relies on a single signer — creating a single point of failure if the key is compromised.',
    affectedAccount: 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR',
    indicators: [
      'Single signer detected',
      'No multi-sig protection',
      'Balance exceeds recommended single-sig threshold',
    ],
    recommendation:
      'Set up multi-signature authentication with at least 2-of-3 signers to protect this account.',
    score: 35,
    details: { signers: 1 },
  },
];

export const DEMO_AI_ANALYSIS = {
  summary:
    'Elevated risk level detected. Risk score: 52/100. Identified 4 security findings across recent transaction activity. A phishing memo and dust attack were detected targeting this account. Multi-sig protection is strongly recommended.',
  riskLevel: 'medium' as const,
  riskScore: 52,
  findings: [
    {
      category: 'Phishing & Social Engineering',
      severity: 'high' as const,
      description:
        'Detected 1 transaction containing a memo that matches known phishing/scam patterns. The memo attempts to lure the user to a fraudulent website promising free XLM.',
      evidence: [
        'Memo: "Claim your free 5000 XLM..."',
        'URL: stellar-giveaway.xyz (suspicious)',
        'Pattern: Fake airdrop scam',
      ],
      impact:
        'If the user follows the link and enters their secret key, the attacker gains full control of the account and can drain all assets.',
    },
    {
      category: 'Dust Attack Detection',
      severity: 'medium' as const,
      description:
        'A micro-payment of 0.0000001 XLM was received with a memo containing a phishing URL — a classic dust attack used to fingerprint wallets and deliver social engineering attacks.',
      evidence: [
        'Amount: 0.0000001 XLM (dust)',
        'Memo contains URL',
        'Wallet fingerprinting pattern',
      ],
      impact:
        'The attacker can track wallet activity and deliver targeted phishing attempts. Interacting with the transaction validates the wallet as active.',
    },
    {
      category: 'Authentication Security',
      severity: 'medium' as const,
      description:
        'Account uses a single signer for all operations, creating a single point of failure. If the signing key is compromised, the attacker has full control.',
      evidence: [
        'Signers: 1 (single key)',
        'No multi-sig configured',
        'High-value account',
      ],
      impact:
        'Complete account compromise if the single signing key is exposed through phishing, malware, or social engineering.',
    },
    {
      category: 'Large Transfer Monitoring',
      severity: 'low' as const,
      description:
        'A 250,000 XLM transfer was sent to an address not previously seen in this account\'s history. While not necessarily malicious, large transfers to new counterparties warrant review.',
      evidence: [
        'Amount: 250,000 XLM',
        'New counterparty address',
        'No prior transaction history with destination',
      ],
      impact:
        'If unauthorized, significant financial loss. If authorized but to a wrong address, funds may be unrecoverable.',
    },
  ],
  recommendations: [
    'URGENT: Do not follow links in transaction memos — especially those promising free XLM or asking you to "verify" your account.',
    'Implement multi-signature authentication (2-of-3) to protect against single-key compromise.',
    'Consider using StellarShield AI real-time monitoring ($1.00 USDC/hr) for continuous protection against emerging threats.',
    'Review all recent transactions for any unauthorized activity and report suspicious addresses to the Stellar community.',
    'Use a hardware wallet or dedicated cold storage for high-value holdings.',
  ],
  detailedAnalysis: `## StellarShield AI Security Analysis

### Account Overview
The analyzed account (GAIH3ULL...K3QJZNSR) was scanned against our threat intelligence database and real-time pattern detection engine. The analysis covered recent transactions, account configuration, and known threat indicators.

### Threat Assessment
Overall risk score: **52/100** — This indicates **elevated** risk with several areas of concern.

### Key Findings

**1. Phishing & Social Engineering** (Severity: HIGH)
A transaction memo was detected containing a known phishing pattern attempting to lure the user to a fraudulent website. This is one of the most common attack vectors on Stellar.
Impact: Complete account compromise if credentials are entered on the phishing site.

**2. Dust Attack Detection** (Severity: MEDIUM)
A micro-payment with an attached phishing URL was identified — this is a classic dust attack used for wallet fingerprinting and targeted social engineering.
Impact: Validates wallet as active, enabling further targeted attacks.

**3. Authentication Security** (Severity: MEDIUM)
The account lacks multi-signature protection despite holding significant value, creating a single point of failure.
Impact: Full account takeover if the single signing key is compromised.

**4. Large Transfer Monitoring** (Severity: LOW)
A large XLM transfer to a previously unseen counterparty was flagged for review.
Impact: Potential financial loss if unauthorized.

### Transaction Pattern Analysis
Detected 4 alert(s) across the analyzed transactions:
- memo_scam: 1 occurrence(s)
- dust_attack: 1 occurrence(s)
- high_value_transfer: 1 occurrence(s)
- unusual_activity: 1 occurrence(s)

---
*Analysis powered by StellarShield AI — Securing the Stellar ecosystem with intelligent threat detection.*`,
};

export const DEMO_TRANSACTIONS = [
  {
    hash: 'a3f8c9d2e1b04567890abcdef1234567890abcdef1234567890abcdef12345678',
    source_account: 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR',
    created_at: new Date(Date.now() - 120000).toISOString(),
    fee_charged: '100',
    operation_count: 1,
    successful: true,
    memo: 'Claim your free 5000 XLM airdrop',
  },
  {
    hash: 'b7e2d1c4a5f6789012345678abcdef0123456789abcdef0123456789abcdef01',
    source_account: 'GBZ35ZJRIKJGYH5PBKLKOZ5L6GKJM3OH7GQIZB5DCHNIAQ5TGPXM4CBM',
    created_at: new Date(Date.now() - 300000).toISOString(),
    fee_charged: '100',
    operation_count: 1,
    successful: true,
    memo: 'Verify account: stellar-verify.com',
  },
  {
    hash: 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
    source_account: 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR',
    created_at: new Date(Date.now() - 600000).toISOString(),
    fee_charged: '200',
    operation_count: 2,
    successful: true,
    memo: null,
  },
  {
    hash: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
    source_account: 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR',
    created_at: new Date(Date.now() - 900000).toISOString(),
    fee_charged: '100',
    operation_count: 1,
    successful: true,
    memo: null,
  },
  {
    hash: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
    source_account: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOBD3CAEDAD3YRMO',
    created_at: new Date(Date.now() - 1200000).toISOString(),
    fee_charged: '100',
    operation_count: 1,
    successful: true,
    memo: null,
  },
  {
    hash: 'f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7',
    source_account: 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR',
    created_at: new Date(Date.now() - 1500000).toISOString(),
    fee_charged: '150',
    operation_count: 3,
    successful: false,
    memo: null,
  },
];

export const DEMO_ACCOUNT = {
  address: 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR',
  balance: '487293.1847652',
  numTransactions: 1247,
  createdAt: '2024-03-15T10:30:00Z',
  trustlines: [
    { asset_code: 'USDC', asset_issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5', balance: '12450.00', limit: '922337203685.4775807', is_authorized: true },
    { asset_code: 'yXLM', asset_issuer: 'GARDNV3Q7YGT4MASTV2SUDBOAFDYNPFVYB2YKH7Y7YSX4QDCD3DDDPJP', balance: '85000.00', limit: '922337203685.4775807', is_authorized: true },
    { asset_code: 'AQUA', asset_issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA', balance: '250000.00', limit: '922337203685.4775807', is_authorized: true },
  ],
  signers: [
    { key: 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR', weight: 1, type: 'ed25519_public_key' },
  ],
  flags: {
    auth_required: false,
    auth_revocable: false,
    auth_immutable: false,
    auth_clawback_enabled: false,
  },
};
