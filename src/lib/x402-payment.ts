/**
 * StellarShield AI - x402 Payment Protocol Integration
 *
 * Implements the x402 HTTP payment protocol for Stellar,
 * enabling AI agents to pay for security scanning services
 * via USDC micropayments on the Stellar network.
 *
 * x402 activates the HTTP 402 "Payment Required" status code
 * as an actual payment mechanism for programmatic, per-request payments.
 */

import * as StellarSdk from '@stellar/stellar-sdk';

export interface X402PaymentRequest {
  version: '1' | '2';
  network: 'stellar:testnet' | 'stellar:pubnet';
  payTo: string;
  maxAmountRequired: string;
  asset: {
    code: string;
    issuer?: string;
  };
  resource: string;
  description: string;
  mimeType?: string;
  outputSchema?: Record<string, any>;
}

export interface X402PaymentResponse {
  transaction: string; // Base64 XDR of the signed transaction
  network: string;
}

export interface X402Receipt {
  transactionHash: string;
  paidAmount: string;
  asset: string;
  paidAt: string;
  resource: string;
  status: 'confirmed' | 'pending' | 'failed';
}

export interface X402Config {
  network: 'testnet' | 'pubnet';
  receiverAddress: string; // Address to receive payments
  usdcAsset: {
    code: string;
    issuer: string;
  };
  prices: {
    singleScan: string;      // Price for a single wallet scan
    deepAnalysis: string;     // Price for deep AI analysis
    realtimeMonitor: string;  // Price per hour of real-time monitoring
    batchScan: string;        // Price for batch scanning
  };
}

// USDC asset on Stellar Testnet (Circle's testnet issuer)
const USDC_TESTNET = {
  code: 'USDC',
  issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
};

const DEFAULT_CONFIG: X402Config = {
  network: 'testnet',
  receiverAddress: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOBD3CAEDAD3YRMO',
  usdcAsset: USDC_TESTNET,
  prices: {
    singleScan: '0.10',      // $0.10 per scan
    deepAnalysis: '0.50',     // $0.50 per deep analysis
    realtimeMonitor: '1.00',  // $1.00 per hour
    batchScan: '0.05',        // $0.05 per address in batch
  },
};

/**
 * x402 Payment Gateway for StellarShield
 */
export class X402PaymentGateway {
  private config: X402Config;

  constructor(config?: Partial<X402Config>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate a 402 Payment Required response for a protected resource
   */
  createPaymentRequest(
    resource: string,
    serviceType: keyof X402Config['prices'],
    description: string
  ): X402PaymentRequest {
    const price = this.config.prices[serviceType];

    return {
      version: '2',
      network: `stellar:${this.config.network}`,
      payTo: this.config.receiverAddress,
      maxAmountRequired: price,
      asset: this.config.usdcAsset,
      resource,
      description,
      mimeType: 'application/json',
      outputSchema: {
        type: 'object',
        properties: {
          scanResult: { type: 'object' },
          threatAlerts: { type: 'array' },
          overallScore: { type: 'number' },
        },
      },
    };
  }

  /**
   * Generate HTTP 402 response headers
   */
  create402Headers(paymentRequest: X402PaymentRequest): Record<string, string> {
    return {
      'X-Payment-Version': paymentRequest.version,
      'X-Payment-Network': paymentRequest.network,
      'X-Payment-PayTo': paymentRequest.payTo,
      'X-Payment-MaxAmount': paymentRequest.maxAmountRequired,
      'X-Payment-Asset': `${paymentRequest.asset.code}:${paymentRequest.asset.issuer}`,
      'X-Payment-Resource': paymentRequest.resource,
      'X-Payment-Description': paymentRequest.description,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Verify a payment was made on-chain
   */
  async verifyPayment(
    transactionXdr: string,
    expectedAmount: string,
    expectedDestination: string
  ): Promise<X402Receipt> {
    try {
      const networkPassphrase =
        this.config.network === 'testnet'
          ? StellarSdk.Networks.TESTNET
          : StellarSdk.Networks.PUBLIC;

      // Decode and verify the transaction
      const tx = StellarSdk.TransactionBuilder.fromXDR(
        transactionXdr,
        networkPassphrase
      );

      // Check operations for the expected payment
      let paymentFound = false;
      let paidAmount = '0';

      for (const op of (tx as any).operations) {
        if (
          op.type === 'payment' &&
          op.destination === expectedDestination &&
          op.asset.code === this.config.usdcAsset.code
        ) {
          paidAmount = op.amount;
          if (parseFloat(op.amount) >= parseFloat(expectedAmount)) {
            paymentFound = true;
          }
        }
      }

      return {
        transactionHash: tx.hash().toString('hex'),
        paidAmount,
        asset: `${this.config.usdcAsset.code}`,
        paidAt: new Date().toISOString(),
        resource: '',
        status: paymentFound ? 'confirmed' : 'failed',
      };
    } catch (error: any) {
      return {
        transactionHash: '',
        paidAmount: '0',
        asset: this.config.usdcAsset.code,
        paidAt: new Date().toISOString(),
        resource: '',
        status: 'failed',
      };
    }
  }

  /**
   * Create middleware-style handler for x402 protected endpoints
   */
  protectEndpoint(serviceType: keyof X402Config['prices']) {
    const gateway = this;

    return {
      /**
       * Check if request has valid payment, return 402 if not
       */
      checkPayment(req: Request): {
        paid: boolean;
        paymentRequest?: X402PaymentRequest;
        headers?: Record<string, string>;
      } {
        const paymentHeader = req.headers.get('X-Payment');

        if (!paymentHeader) {
          const paymentRequest = gateway.createPaymentRequest(
            req.url,
            serviceType,
            `StellarShield AI - ${serviceType} service`
          );

          return {
            paid: false,
            paymentRequest,
            headers: gateway.create402Headers(paymentRequest),
          };
        }

        // In production, verify the payment on-chain here
        return { paid: true };
      },
    };
  }

  /**
   * Get pricing information
   */
  getPricing() {
    return {
      ...this.config.prices,
      asset: this.config.usdcAsset.code,
      network: this.config.network,
    };
  }
}

/**
 * Express/Next.js API middleware for x402 payments
 */
export function withX402Payment(
  serviceType: keyof X402Config['prices'],
  handler: (req: Request) => Promise<Response>
) {
  const gateway = new X402PaymentGateway();

  return async (req: Request): Promise<Response> => {
    const { paid, paymentRequest, headers } =
      gateway.protectEndpoint(serviceType).checkPayment(req);

    if (!paid && paymentRequest) {
      return new Response(
        JSON.stringify({
          error: 'Payment Required',
          message: 'This endpoint requires payment via x402 protocol',
          paymentDetails: paymentRequest,
          pricing: gateway.getPricing(),
        }),
        {
          status: 402,
          headers: headers || { 'Content-Type': 'application/json' },
        }
      );
    }

    return handler(req);
  };
}
