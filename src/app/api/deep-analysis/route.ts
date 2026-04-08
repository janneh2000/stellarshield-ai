import { NextRequest, NextResponse } from 'next/server';
import { StellarMonitor } from '@/lib/stellar-monitor';
import { ThreatDetector } from '@/lib/threat-detector';
import { generateAIAnalysis } from '@/lib/ai-agent';
import { X402PaymentGateway } from '@/lib/x402-payment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, network = 'testnet' } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // x402 payment check
    const paymentHeader = request.headers.get('X-Payment');
    const gateway = new X402PaymentGateway();

    if (!paymentHeader) {
      const paymentRequest = gateway.createPaymentRequest(
        '/api/deep-analysis',
        'deepAnalysis',
        'StellarShield AI - Deep security analysis with AI'
      );

      // In production, would return 402
      // For demo, we return the 402 info alongside results
    }

    const monitor = new StellarMonitor({
      network,
      watchAddresses: [address],
      streamOperations: false,
    });

    const detector = new ThreatDetector();

    // Deep analysis: fetch more transactions
    const account = await monitor.getAccountInfo(address);
    const transactions = await monitor.getAccountTransactions(address, 50);

    // Run all detections
    const txAlerts = detector.analyzeBatch(transactions);
    const accountAlerts = account ? detector.analyzeAccount(account) : [];
    const allAlerts = [...txAlerts, ...accountAlerts];

    // Generate comprehensive AI analysis
    const aiAnalysis = generateAIAnalysis(account, allAlerts, transactions.length);

    // Additional deep analysis metrics
    const transactionVolume = transactions.reduce((sum, tx) => {
      const ops = tx.operations || [];
      const payments = ops.filter((op) => op.type === 'payment' && op.amount);
      return (
        sum + payments.reduce((s, p) => s + parseFloat(p.amount || '0'), 0)
      );
    }, 0);

    const uniqueCounterparties = new Set(
      transactions.flatMap((tx) =>
        (tx.operations || [])
          .map((op) => op.destination || op.to)
          .filter(Boolean)
      )
    ).size;

    return NextResponse.json({
      success: true,
      address,
      deepAnalysis: {
        ...aiAnalysis,
        metrics: {
          totalTransactions: transactions.length,
          transactionVolume: transactionVolume.toFixed(2),
          uniqueCounterparties,
          averageFee:
            transactions.length > 0
              ? (
                  transactions.reduce(
                    (sum, tx) => sum + parseInt(tx.fee_charged),
                    0
                  ) / transactions.length
                ).toFixed(0)
              : '0',
          oldestTransaction: transactions[transactions.length - 1]?.created_at,
          newestTransaction: transactions[0]?.created_at,
        },
      },
      alerts: allAlerts,
      x402: {
        pricing: gateway.getPricing(),
        serviceType: 'deepAnalysis',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Deep analysis error:', error);
    return NextResponse.json(
      { error: 'Deep analysis failed', message: error.message },
      { status: 500 }
    );
  }
}
