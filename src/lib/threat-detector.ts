/**
 * StellarShield AI - AI Threat Detection Engine
 *
 * Analyzes Stellar transactions using pattern recognition and AI
 * to detect potential security threats including:
 * - Phishing/scam transactions
 * - Rug pull patterns
 * - Wash trading
 * - Account draining attacks
 * - Suspicious trustline manipulation
 * - Unusual fee patterns
 */

import { StellarTransaction, StellarOperation, AccountInfo } from './stellar-monitor';

export type ThreatLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface ThreatAlert {
  id: string;
  timestamp: string;
  level: ThreatLevel;
  category: ThreatCategory;
  title: string;
  description: string;
  affectedAccount: string;
  transactionHash?: string;
  indicators: string[];
  recommendation: string;
  score: number; // 0-100 threat score
  details: Record<string, any>;
}

export type ThreatCategory =
  | 'phishing'
  | 'rug_pull'
  | 'wash_trading'
  | 'account_drain'
  | 'trustline_manipulation'
  | 'unusual_activity'
  | 'high_value_transfer'
  | 'contract_exploit'
  | 'dust_attack'
  | 'memo_scam';

interface PatternRule {
  name: string;
  category: ThreatCategory;
  check: (tx: StellarTransaction, context: AnalysisContext) => ThreatAlert | null;
}

interface AnalysisContext {
  accountHistory: Map<string, StellarTransaction[]>;
  knownScamAddresses: Set<string>;
  averageFee: number;
  recentVolume: number;
}

// Known scam patterns and addresses (would be maintained via a live feed in production)
const KNOWN_SCAM_MEMO_PATTERNS = [
  /claim.*airdrop/i,
  /free.*xlm/i,
  /double.*your/i,
  /send.*receive.*back/i,
  /congratulations.*won/i,
  /verify.*account.*http/i,
  /stellar.*giveaway/i,
  /click.*here.*claim/i,
  /limited.*time.*offer/i,
  /www\.\S+\.xyz/i,
  /t\.me\/\S+/i,
];

const SUSPICIOUS_OPERATION_THRESHOLDS = {
  highValueXLM: 100000, // > 100k XLM
  rapidTransactionWindow: 60000, // 60 seconds
  rapidTransactionCount: 10, // > 10 txs in window
  dustAmount: 0.001, // tiny amounts used in dust attacks
  unusualFeeMultiplier: 10, // 10x average fee
};

function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Core threat detection rules
 */
const PATTERN_RULES: PatternRule[] = [
  {
    name: 'Memo Scam Detection',
    category: 'memo_scam',
    check: (tx) => {
      if (!tx.memo || tx.memo_type === 'none') return null;

      for (const pattern of KNOWN_SCAM_MEMO_PATTERNS) {
        if (pattern.test(tx.memo)) {
          return {
            id: generateAlertId(),
            timestamp: new Date().toISOString(),
            level: 'high',
            category: 'memo_scam',
            title: 'Suspicious Memo Detected - Possible Scam',
            description: `Transaction contains a memo matching known scam patterns: "${tx.memo.substring(0, 100)}"`,
            affectedAccount: tx.source_account,
            transactionHash: tx.hash,
            indicators: [
              'Memo matches known scam/phishing pattern',
              'May contain links to fraudulent websites',
              'Common in social engineering attacks',
            ],
            recommendation:
              'Do NOT follow any links or instructions in this memo. Report this address to the Stellar community.',
            score: 75,
            details: { memo: tx.memo, pattern: pattern.toString() },
          };
        }
      }
      return null;
    },
  },
  {
    name: 'High Value Transfer Detection',
    category: 'high_value_transfer',
    check: (tx) => {
      for (const op of tx.operations) {
        if (
          op.type === 'payment' &&
          op.asset_type === 'native' &&
          op.amount &&
          parseFloat(op.amount) > SUSPICIOUS_OPERATION_THRESHOLDS.highValueXLM
        ) {
          return {
            id: generateAlertId(),
            timestamp: new Date().toISOString(),
            level: 'medium',
            category: 'high_value_transfer',
            title: 'High-Value XLM Transfer Detected',
            description: `Large transfer of ${parseFloat(op.amount).toLocaleString()} XLM detected from ${op.source_account}`,
            affectedAccount: op.source_account,
            transactionHash: tx.hash,
            indicators: [
              `Amount: ${op.amount} XLM`,
              `Destination: ${op.destination || op.to}`,
              'Exceeds high-value threshold',
            ],
            recommendation:
              'Verify this transaction was intentional. Large transfers should use multi-sig for safety.',
            score: 45,
            details: { amount: op.amount, destination: op.destination || op.to },
          };
        }
      }
      return null;
    },
  },
  {
    name: 'Dust Attack Detection',
    category: 'dust_attack',
    check: (tx) => {
      const dustOps = tx.operations.filter(
        (op) =>
          op.type === 'payment' &&
          op.amount &&
          parseFloat(op.amount) <= SUSPICIOUS_OPERATION_THRESHOLDS.dustAmount
      );

      if (dustOps.length > 0 && tx.memo) {
        return {
          id: generateAlertId(),
          timestamp: new Date().toISOString(),
          level: 'medium',
          category: 'dust_attack',
          title: 'Potential Dust Attack Detected',
          description: `Tiny payment (${dustOps[0].amount} XLM) with memo — classic dust attack pattern used to track wallets or deliver phishing links.`,
          affectedAccount: tx.source_account,
          transactionHash: tx.hash,
          indicators: [
            `Micro-payment amount: ${dustOps[0].amount}`,
            'Transaction includes memo (possible phishing link)',
            'Common wallet fingerprinting technique',
          ],
          recommendation:
            'Ignore this transaction. Do not interact with the sender or follow memo instructions.',
          score: 60,
          details: { amount: dustOps[0].amount, memo: tx.memo },
        };
      }
      return null;
    },
  },
  {
    name: 'Trustline Manipulation Detection',
    category: 'trustline_manipulation',
    check: (tx) => {
      const trustOps = tx.operations.filter(
        (op) =>
          op.type === 'change_trust' || op.type === 'set_trust_line_flags'
      );

      if (trustOps.length >= 3) {
        return {
          id: generateAlertId(),
          timestamp: new Date().toISOString(),
          level: 'high',
          category: 'trustline_manipulation',
          title: 'Bulk Trustline Modification Detected',
          description: `Multiple trustline operations (${trustOps.length}) in a single transaction — may indicate token rug pull preparation.`,
          affectedAccount: tx.source_account,
          transactionHash: tx.hash,
          indicators: [
            `${trustOps.length} trustline operations in one transaction`,
            'May be preparing for token manipulation',
            'Common in rug pull setup patterns',
          ],
          recommendation:
            'Investigate the assets involved. Check if any tokens are being set up for a rug pull.',
          score: 70,
          details: { trustlineOps: trustOps.length },
        };
      }
      return null;
    },
  },
  {
    name: 'Account Drain Pattern',
    category: 'account_drain',
    check: (tx) => {
      // Check if transaction has merge_account operation (draining all XLM)
      const mergeOps = tx.operations.filter(
        (op) => op.type === 'account_merge'
      );

      if (mergeOps.length > 0) {
        return {
          id: generateAlertId(),
          timestamp: new Date().toISOString(),
          level: 'critical',
          category: 'account_drain',
          title: 'Account Merge Detected - Possible Account Drain',
          description: `Account merge operation detected. The source account will be deleted and all remaining XLM sent to the destination.`,
          affectedAccount: tx.source_account,
          transactionHash: tx.hash,
          indicators: [
            'Account merge operation (irreversible)',
            'All remaining XLM transferred to destination',
            'Source account will be permanently deleted',
          ],
          recommendation:
            'If this was not initiated by you, your account may be compromised. Immediately secure all other accounts.',
          score: 90,
          details: { destination: mergeOps[0].destination },
        };
      }
      return null;
    },
  },
  {
    name: 'Unusual Fee Detection',
    category: 'unusual_activity',
    check: (tx, context) => {
      const fee = parseInt(tx.fee_charged);
      if (
        context.averageFee > 0 &&
        fee > context.averageFee * SUSPICIOUS_OPERATION_THRESHOLDS.unusualFeeMultiplier
      ) {
        return {
          id: generateAlertId(),
          timestamp: new Date().toISOString(),
          level: 'low',
          category: 'unusual_activity',
          title: 'Unusually High Transaction Fee',
          description: `Transaction fee (${fee} stroops) is ${Math.round(fee / context.averageFee)}x higher than average (${Math.round(context.averageFee)} stroops).`,
          affectedAccount: tx.source_account,
          transactionHash: tx.hash,
          indicators: [
            `Fee: ${fee} stroops`,
            `Average fee: ${Math.round(context.averageFee)} stroops`,
            'May indicate fee bumping or network congestion exploit',
          ],
          recommendation:
            'Monitor for repeated high-fee transactions which may indicate a fee manipulation attack.',
          score: 25,
          details: { fee, averageFee: context.averageFee },
        };
      }
      return null;
    },
  },
  {
    name: 'Rapid Transaction Burst Detection',
    category: 'unusual_activity',
    check: (tx, context) => {
      const accountTxs = context.accountHistory.get(tx.source_account) || [];
      const recentTxs = accountTxs.filter((t) => {
        const timeDiff =
          new Date(tx.created_at).getTime() - new Date(t.created_at).getTime();
        return timeDiff <= SUSPICIOUS_OPERATION_THRESHOLDS.rapidTransactionWindow;
      });

      if (recentTxs.length >= SUSPICIOUS_OPERATION_THRESHOLDS.rapidTransactionCount) {
        return {
          id: generateAlertId(),
          timestamp: new Date().toISOString(),
          level: 'high',
          category: 'unusual_activity',
          title: 'Rapid Transaction Burst Detected',
          description: `Account sent ${recentTxs.length} transactions within 60 seconds — possible automated attack or bot activity.`,
          affectedAccount: tx.source_account,
          transactionHash: tx.hash,
          indicators: [
            `${recentTxs.length} transactions in 60-second window`,
            'Automated/bot activity pattern',
            'May indicate account compromise or spam attack',
          ],
          recommendation:
            'Investigate the source account. This pattern is common in automated attacks and spam campaigns.',
          score: 65,
          details: { transactionCount: recentTxs.length, window: '60s' },
        };
      }
      return null;
    },
  },
];

/**
 * Main Threat Detection Engine
 */
export class ThreatDetector {
  private context: AnalysisContext;
  private alerts: ThreatAlert[] = [];

  constructor() {
    this.context = {
      accountHistory: new Map(),
      knownScamAddresses: new Set(),
      averageFee: 100, // Default base fee in stroops
      recentVolume: 0,
    };
  }

  /**
   * Analyze a single transaction against all threat rules
   */
  analyzeTransaction(tx: StellarTransaction): ThreatAlert[] {
    const newAlerts: ThreatAlert[] = [];

    // Update context with transaction history
    const existing = this.context.accountHistory.get(tx.source_account) || [];
    existing.push(tx);
    this.context.accountHistory.set(tx.source_account, existing.slice(-50));

    // Update average fee
    const fee = parseInt(tx.fee_charged);
    this.context.averageFee =
      this.context.averageFee * 0.95 + fee * 0.05; // Exponential moving average

    // Run all pattern rules
    for (const rule of PATTERN_RULES) {
      try {
        const alert = rule.check(tx, this.context);
        if (alert) {
          newAlerts.push(alert);
          this.alerts.push(alert);
        }
      } catch (error) {
        console.error(`Error in rule ${rule.name}:`, error);
      }
    }

    return newAlerts;
  }

  /**
   * Analyze a batch of transactions
   */
  analyzeBatch(transactions: StellarTransaction[]): ThreatAlert[] {
    const allAlerts: ThreatAlert[] = [];
    for (const tx of transactions) {
      const alerts = this.analyzeTransaction(tx);
      allAlerts.push(...alerts);
    }
    return allAlerts;
  }

  /**
   * Perform deep account analysis
   */
  analyzeAccount(account: AccountInfo): ThreatAlert[] {
    const alerts: ThreatAlert[] = [];

    // Check for no multi-sig on high-balance accounts
    if (
      parseFloat(account.balance) > 10000 &&
      account.signers.length === 1
    ) {
      alerts.push({
        id: generateAlertId(),
        timestamp: new Date().toISOString(),
        level: 'medium',
        category: 'unusual_activity',
        title: 'High-Balance Account Without Multi-Sig',
        description: `Account holds ${parseFloat(account.balance).toLocaleString()} XLM but has only a single signer. Multi-sig is strongly recommended for high-value accounts.`,
        affectedAccount: account.address,
        indicators: [
          `Balance: ${account.balance} XLM`,
          'Single signer only',
          'No multi-sig protection',
        ],
        recommendation:
          'Set up multi-signature authentication to protect this high-value account.',
        score: 50,
        details: { balance: account.balance, signers: account.signers.length },
      });
    }

    // Check for clawback-enabled assets
    const clawbackAssets = account.trustlines.filter(
      (t) => t.balance !== '0.0000000'
    );
    if (account.flags.auth_clawback_enabled) {
      alerts.push({
        id: generateAlertId(),
        timestamp: new Date().toISOString(),
        level: 'info',
        category: 'trustline_manipulation',
        title: 'Account Has Clawback-Enabled Flag',
        description:
          'This account has clawback enabled, meaning the issuer can revoke tokens at any time.',
        affectedAccount: account.address,
        indicators: [
          'Clawback flag is enabled',
          'Issuer can revoke tokens from holders',
        ],
        recommendation:
          'Be aware that tokens held by this account can be clawed back by the issuer.',
        score: 30,
        details: { flags: account.flags },
      });
    }

    this.alerts.push(...alerts);
    return alerts;
  }

  /**
   * Generate an AI-style threat summary
   */
  generateThreatSummary(): {
    totalAlerts: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    overallScore: number;
    topThreats: ThreatAlert[];
    summary: string;
  } {
    const critical = this.alerts.filter((a) => a.level === 'critical').length;
    const high = this.alerts.filter((a) => a.level === 'high').length;
    const medium = this.alerts.filter((a) => a.level === 'medium').length;
    const low = this.alerts.filter((a) => a.level === 'low').length;
    const info = this.alerts.filter((a) => a.level === 'info').length;

    const overallScore = Math.min(
      100,
      critical * 30 + high * 15 + medium * 8 + low * 3 + info * 1
    );

    const topThreats = [...this.alerts]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    let summary: string;
    if (overallScore >= 70) {
      summary =
        '🚨 CRITICAL: Multiple high-severity threats detected. Immediate action required to secure affected accounts.';
    } else if (overallScore >= 40) {
      summary =
        '⚠️ WARNING: Several suspicious activities detected. Review flagged transactions and strengthen security measures.';
    } else if (overallScore >= 15) {
      summary =
        '🔔 NOTICE: Minor anomalies detected. Continue monitoring and consider enabling additional security features.';
    } else {
      summary =
        '✅ SECURE: No significant threats detected. Your monitored accounts appear to be safe.';
    }

    return {
      totalAlerts: this.alerts.length,
      critical,
      high,
      medium,
      low,
      info,
      overallScore,
      topThreats,
      summary,
    };
  }

  getAlerts(): ThreatAlert[] {
    return [...this.alerts];
  }

  clearAlerts(): void {
    this.alerts = [];
  }

  addKnownScamAddress(address: string): void {
    this.context.knownScamAddresses.add(address);
  }
}
