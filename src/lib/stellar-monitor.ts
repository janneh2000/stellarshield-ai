/**
 * StellarShield AI - Stellar Transaction Monitor
 *
 * Real-time monitoring engine that connects to the Stellar Horizon API
 * to stream and analyze transactions for security threats.
 */

import * as StellarSdk from '@stellar/stellar-sdk';

export interface StellarTransaction {
  id: string;
  hash: string;
  source_account: string;
  created_at: string;
  fee_charged: string;
  operation_count: number;
  memo_type: string;
  memo?: string;
  operations: StellarOperation[];
  ledger: number;
  successful: boolean;
}

export interface StellarOperation {
  id: string;
  type: string;
  source_account: string;
  amount?: string;
  asset_type?: string;
  asset_code?: string;
  asset_issuer?: string;
  from?: string;
  to?: string;
  destination?: string;
  trustor?: string;
  trustee?: string;
  authorize?: boolean;
  selling_asset?: string;
  buying_asset?: string;
  offer_id?: string;
}

export interface MonitorConfig {
  network: 'testnet' | 'mainnet';
  watchAddresses: string[];
  streamOperations: boolean;
}

export interface AccountInfo {
  address: string;
  balance: string;
  numTransactions: number;
  createdAt: string;
  trustlines: TrustlineInfo[];
  signers: SignerInfo[];
  flags: AccountFlags;
}

export interface TrustlineInfo {
  asset_code: string;
  asset_issuer: string;
  balance: string;
  limit: string;
  is_authorized: boolean;
}

export interface SignerInfo {
  key: string;
  weight: number;
  type: string;
}

export interface AccountFlags {
  auth_required: boolean;
  auth_revocable: boolean;
  auth_immutable: boolean;
  auth_clawback_enabled: boolean;
}

const HORIZON_URLS = {
  testnet: 'https://horizon-testnet.stellar.org',
  mainnet: 'https://horizon.stellar.org',
};

export class StellarMonitor {
  private server: StellarSdk.Horizon.Server;
  private network: 'testnet' | 'mainnet';
  private watchAddresses: Set<string>;

  constructor(config: MonitorConfig) {
    this.network = config.network;
    this.server = new StellarSdk.Horizon.Server(HORIZON_URLS[config.network]);
    this.watchAddresses = new Set(config.watchAddresses);
  }

  /**
   * Fetch recent transactions for a given account
   */
  async getAccountTransactions(
    accountId: string,
    limit: number = 20
  ): Promise<StellarTransaction[]> {
    try {
      const txResponse = await this.server
        .transactions()
        .forAccount(accountId)
        .limit(limit)
        .order('desc')
        .call();

      const transactions: StellarTransaction[] = [];

      for (const record of txResponse.records) {
        const opsResponse = await record.operations();
        const operations: StellarOperation[] = opsResponse.records.map(
          (op: any) => ({
            id: op.id,
            type: op.type,
            source_account: op.source_account,
            amount: op.amount,
            asset_type: op.asset_type,
            asset_code: op.asset_code,
            asset_issuer: op.asset_issuer,
            from: op.from,
            to: op.to,
            destination: op.destination || op.to,
            trustor: op.trustor,
            trustee: op.trustee,
            authorize: op.authorize,
          })
        );

        transactions.push({
          id: record.id,
          hash: record.hash,
          source_account: record.source_account,
          created_at: record.created_at,
          fee_charged: String(record.fee_charged),
          operation_count: record.operation_count,
          memo_type: record.memo_type,
          memo: record.memo as string | undefined,
          operations,
          ledger: record.ledger_attr,
          successful: record.successful,
        });
      }

      return transactions;
    } catch (error: any) {
      console.error(`Error fetching transactions for ${accountId}:`, error.message);
      return [];
    }
  }

  /**
   * Fetch account details including balances, trustlines, and signers
   */
  async getAccountInfo(accountId: string): Promise<AccountInfo | null> {
    try {
      const account = await this.server.accounts().accountId(accountId).call();

      const xlmBalance = account.balances.find(
        (b: any) => b.asset_type === 'native'
      );

      const trustlines: TrustlineInfo[] = account.balances
        .filter((b: any) => b.asset_type !== 'native')
        .map((b: any) => ({
          asset_code: b.asset_code,
          asset_issuer: b.asset_issuer,
          balance: b.balance,
          limit: b.limit,
          is_authorized: b.is_authorized || false,
        }));

      const signers: SignerInfo[] = account.signers.map((s: any) => ({
        key: s.key,
        weight: s.weight,
        type: s.type,
      }));

      return {
        address: accountId,
        balance: xlmBalance ? xlmBalance.balance : '0',
        numTransactions: account.last_modified_ledger,
        createdAt: account.last_modified_time || 'Unknown',
        trustlines,
        signers,
        flags: {
          auth_required: account.flags?.auth_required || false,
          auth_revocable: account.flags?.auth_revocable || false,
          auth_immutable: account.flags?.auth_immutable || false,
          auth_clawback_enabled: account.flags?.auth_clawback_enabled || false,
        },
      };
    } catch (error: any) {
      console.error(`Error fetching account info for ${accountId}:`, error.message);
      return null;
    }
  }

  /**
   * Fetch recent network-wide transactions for general monitoring
   */
  async getRecentNetworkTransactions(limit: number = 50): Promise<StellarTransaction[]> {
    try {
      const txResponse = await this.server
        .transactions()
        .limit(limit)
        .order('desc')
        .call();

      return txResponse.records.map((record: any) => ({
        id: record.id,
        hash: record.hash,
        source_account: record.source_account,
        created_at: record.created_at,
        fee_charged: record.fee_charged,
        operation_count: record.operation_count,
        memo_type: record.memo_type,
        memo: record.memo,
        operations: [],
        ledger: record.ledger_attr,
        successful: record.successful,
      }));
    } catch (error: any) {
      console.error('Error fetching network transactions:', error.message);
      return [];
    }
  }

  /**
   * Check if an account exists and is active
   */
  async isAccountActive(accountId: string): Promise<boolean> {
    try {
      await this.server.accounts().accountId(accountId).call();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get network statistics
   */
  async getNetworkStats() {
    try {
      const ledger = await this.server.ledgers().limit(1).order('desc').call();
      const latest = ledger.records[0];
      return {
        latestLedger: latest.sequence,
        closedAt: latest.closed_at,
        txCount: latest.successful_transaction_count,
        failedTxCount: latest.failed_transaction_count,
        operationCount: latest.operation_count,
        baseFee: latest.base_fee_in_stroops,
        protocolVersion: latest.protocol_version,
      };
    } catch (error: any) {
      console.error('Error fetching network stats:', error.message);
      return null;
    }
  }

  addWatchAddress(address: string) {
    this.watchAddresses.add(address);
  }

  removeWatchAddress(address: string) {
    this.watchAddresses.delete(address);
  }

  getWatchAddresses(): string[] {
    return Array.from(this.watchAddresses);
  }
}
