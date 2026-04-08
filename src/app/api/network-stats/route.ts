import { NextResponse } from 'next/server';
import { StellarMonitor } from '@/lib/stellar-monitor';

export async function GET() {
  try {
    const monitor = new StellarMonitor({
      network: 'testnet',
      watchAddresses: [],
      streamOperations: false,
    });

    const stats = await monitor.getNetworkStats();

    if (!stats) {
      return NextResponse.json(
        { error: 'Failed to fetch network stats' },
        { status: 500 }
      );
    }

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Network stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch network stats', message: error.message },
      { status: 500 }
    );
  }
}
