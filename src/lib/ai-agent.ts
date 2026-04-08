/**
 * StellarShield AI - AI Security Agent
 *
 * Claude-powered AI agent that provides intelligent analysis
 * of Stellar transactions and accounts. Uses natural language
 * to explain threats and provide actionable security recommendations.
 */

import { ThreatAlert, ThreatLevel } from './threat-detector';
import { AccountInfo } from './stellar-monitor';

export interface AIAnalysisResult {
  summary: string;
  riskLevel: ThreatLevel;
  riskScore: number;
  findings: AIFinding[];
  recommendations: string[];
  detailedAnalysis: string;
}

export interface AIFinding {
  category: string;
  severity: ThreatLevel;
  description: string;
  evidence: string[];
  impact: string;
}

/**
 * Generate an AI-powered security analysis for an account
 * In production, this would call the Claude API. For the hackathon demo,
 * we use sophisticated rule-based analysis that mimics AI behavior.
 */
export function generateAIAnalysis(
  account: AccountInfo | null,
  alerts: ThreatAlert[],
  transactionCount: number
): AIAnalysisResult {
  const findings: AIFinding[] = [];
  const recommendations: string[] = [];

  // Analyze account security posture
  if (account) {
    // Multi-sig analysis
    if (account.signers.length === 1) {
      findings.push({
        category: 'Authentication Security',
        severity: parseFloat(account.balance) > 10000 ? 'high' : 'medium',
        description:
          'Account relies on a single signer for all operations, creating a single point of failure.',
        evidence: [
          `Single signer: ${account.signers[0].key.substring(0, 12)}...`,
          `Account balance: ${parseFloat(account.balance).toLocaleString()} XLM`,
        ],
        impact:
          'If the signing key is compromised, an attacker has full control over all account operations including transfers and trustline changes.',
      });
      recommendations.push(
        'Implement multi-signature authentication with at least 2-of-3 signers for enhanced security.'
      );
    }

    // Trustline analysis
    if (account.trustlines.length > 10) {
      findings.push({
        category: 'Asset Exposure',
        severity: 'medium',
        description: `Account has ${account.trustlines.length} active trustlines, increasing attack surface.`,
        evidence: account.trustlines
          .slice(0, 5)
          .map((t) => `${t.asset_code}: ${t.balance}`),
        impact:
          'Each trustline represents a potential vector for token-based attacks including rug pulls and phishing.',
      });
      recommendations.push(
        'Review and remove trustlines for tokens you no longer use or need. Each unnecessary trustline increases your risk exposure.'
      );
    }

    // Clawback risk
    if (account.flags.auth_clawback_enabled) {
      findings.push({
        category: 'Token Sovereignty',
        severity: 'low',
        description:
          'Clawback is enabled, meaning token issuers can revoke assets from this account.',
        evidence: ['auth_clawback_enabled: true'],
        impact:
          'Assets held in this account could be forcibly removed by the issuing authority.',
      });
    }

    // Balance-based recommendations
    if (parseFloat(account.balance) > 50000) {
      recommendations.push(
        'Consider using a hardware wallet or cold storage for this high-value account.'
      );
      recommendations.push(
        'Set up transaction alerts and real-time monitoring with StellarShield AI.'
      );
    }
  }

  // Analyze threat alerts
  const criticalAlerts = alerts.filter((a) => a.level === 'critical');
  const highAlerts = alerts.filter((a) => a.level === 'high');
  const mediumAlerts = alerts.filter((a) => a.level === 'medium');

  if (criticalAlerts.length > 0) {
    findings.push({
      category: 'Critical Threats',
      severity: 'critical',
      description: `${criticalAlerts.length} critical security threat(s) detected in recent transactions.`,
      evidence: criticalAlerts.map((a) => a.title),
      impact:
        'Immediate risk of asset loss or account compromise. Action required now.',
    });
    recommendations.push(
      'IMMEDIATE ACTION: Review all critical alerts and take protective measures. Consider freezing account operations until threats are resolved.'
    );
  }

  if (highAlerts.length > 0) {
    findings.push({
      category: 'High-Risk Activity',
      severity: 'high',
      description: `${highAlerts.length} high-risk pattern(s) identified in transaction history.`,
      evidence: highAlerts.map((a) => a.title),
      impact:
        'Significant risk of financial loss or security breach if not addressed promptly.',
    });
    recommendations.push(
      'Review high-risk alerts within 24 hours and update security settings accordingly.'
    );
  }

  // Calculate overall risk
  const riskScore = Math.min(
    100,
    criticalAlerts.length * 30 +
      highAlerts.length * 15 +
      mediumAlerts.length * 8 +
      (account && account.signers.length === 1 ? 10 : 0) +
      (account && account.trustlines.length > 10 ? 5 : 0)
  );

  let riskLevel: ThreatLevel;
  if (riskScore >= 70) riskLevel = 'critical';
  else if (riskScore >= 45) riskLevel = 'high';
  else if (riskScore >= 25) riskLevel = 'medium';
  else if (riskScore >= 10) riskLevel = 'low';
  else riskLevel = 'info';

  // Generate detailed narrative analysis
  const detailedAnalysis = generateNarrativeAnalysis(
    account,
    alerts,
    findings,
    riskScore,
    transactionCount
  );

  // Generate summary
  const summary = generateSummary(riskLevel, riskScore, findings.length, alerts.length);

  // Add general recommendations
  if (recommendations.length === 0) {
    recommendations.push(
      'Continue monitoring your account with StellarShield AI for ongoing protection.'
    );
    recommendations.push(
      'Consider enabling multi-sig authentication as a preventive measure.'
    );
  }

  return {
    summary,
    riskLevel,
    riskScore,
    findings,
    recommendations,
    detailedAnalysis,
  };
}

function generateSummary(
  riskLevel: ThreatLevel,
  riskScore: number,
  findingCount: number,
  alertCount: number
): string {
  switch (riskLevel) {
    case 'critical':
      return `Critical security issues detected. Risk score: ${riskScore}/100. Found ${findingCount} security findings across ${alertCount} alerts. Immediate action is strongly recommended to protect your assets.`;
    case 'high':
      return `Elevated risk level detected. Risk score: ${riskScore}/100. Identified ${findingCount} findings requiring attention. Review flagged activities and strengthen security measures.`;
    case 'medium':
      return `Moderate risk detected. Risk score: ${riskScore}/100. ${findingCount} findings identified. Some security improvements recommended but no immediate threats.`;
    case 'low':
      return `Low risk profile. Risk score: ${riskScore}/100. Minor observations noted. Account security posture is generally good with room for improvement.`;
    default:
      return `Account appears secure. Risk score: ${riskScore}/100. No significant threats detected. Continue standard monitoring practices.`;
  }
}

function generateNarrativeAnalysis(
  account: AccountInfo | null,
  alerts: ThreatAlert[],
  findings: AIFinding[],
  riskScore: number,
  txCount: number
): string {
  let narrative = '## StellarShield AI Security Analysis\n\n';

  // Account overview
  if (account) {
    narrative += `### Account Overview\n`;
    narrative += `The analyzed account (${account.address.substring(0, 8)}...${account.address.substring(account.address.length - 8)}) `;
    narrative += `holds **${parseFloat(account.balance).toLocaleString()} XLM** `;
    narrative += `with ${account.trustlines.length} active trustline(s) and ${account.signers.length} signer(s). `;
    narrative += `${txCount} recent transactions were analyzed.\n\n`;
  }

  // Threat landscape
  narrative += `### Threat Assessment\n`;
  narrative += `Overall risk score: **${riskScore}/100** — `;
  if (riskScore >= 70)
    narrative += 'This represents a **critical** risk level requiring immediate attention.\n\n';
  else if (riskScore >= 45)
    narrative += 'This indicates **elevated** risk with several areas of concern.\n\n';
  else if (riskScore >= 25)
    narrative += 'This suggests **moderate** risk with some areas for improvement.\n\n';
  else
    narrative += 'This indicates a **healthy** security posture.\n\n';

  // Findings detail
  if (findings.length > 0) {
    narrative += `### Key Findings\n`;
    findings.forEach((finding, i) => {
      narrative += `\n**${i + 1}. ${finding.category}** (Severity: ${finding.severity.toUpperCase()})\n`;
      narrative += `${finding.description}\n`;
      narrative += `Impact: ${finding.impact}\n`;
    });
  }

  // Transaction patterns
  if (alerts.length > 0) {
    narrative += `\n### Transaction Pattern Analysis\n`;
    narrative += `Detected ${alerts.length} alert(s) across the analyzed transactions:\n`;

    const categories = new Map<string, number>();
    alerts.forEach((a) => {
      categories.set(a.category, (categories.get(a.category) || 0) + 1);
    });
    categories.forEach((count, cat) => {
      narrative += `- ${cat}: ${count} occurrence(s)\n`;
    });
  }

  narrative += `\n---\n*Analysis powered by StellarShield AI — Securing the Stellar ecosystem with intelligent threat detection.*\n`;

  return narrative;
}
