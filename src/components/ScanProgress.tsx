'use client';

import { useState, useEffect } from 'react';

interface ScanProgressProps {
  isScanning: boolean;
}

const SCAN_STEPS = [
  { label: 'Connecting to Stellar Horizon', icon: '🌐', duration: 400 },
  { label: 'Fetching account data', icon: '📡', duration: 500 },
  { label: 'Loading transaction history', icon: '📊', duration: 600 },
  { label: 'Running threat pattern analysis', icon: '🔍', duration: 700 },
  { label: 'AI analyzing security posture', icon: '🤖', duration: 800 },
  { label: 'Checking x402 payment status', icon: '💳', duration: 300 },
  { label: 'Generating security report', icon: '📋', duration: 400 },
];

export default function ScanProgress({ isScanning }: ScanProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isScanning) {
      setCurrentStep(0);
      return;
    }

    let step = 0;
    const advance = () => {
      if (step < SCAN_STEPS.length - 1) {
        step++;
        setCurrentStep(step);
        setTimeout(advance, SCAN_STEPS[step].duration);
      }
    };

    setTimeout(advance, SCAN_STEPS[0].duration);

    return () => {
      step = SCAN_STEPS.length; // stop advancing
    };
  }, [isScanning]);

  if (!isScanning) return null;

  return (
    <div className="fixed inset-0 bg-[#0A0E27]/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#111538] border border-gray-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Animated shield */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <span className="text-5xl">🛡️</span>
            <div className="absolute -inset-3 border-2 border-[#00D4AA]/30 rounded-full animate-ping" />
          </div>
          <h3 className="text-lg font-semibold text-white mt-4">
            Scanning Wallet
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Analyzing security posture...
          </p>
        </div>

        {/* Progress steps */}
        <div className="space-y-2">
          {SCAN_STEPS.map((step, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-300 ${
                index < currentStep
                  ? 'opacity-100'
                  : index === currentStep
                    ? 'opacity-100 bg-[#00D4AA]/5'
                    : 'opacity-30'
              }`}
            >
              <span className="text-sm w-5 text-center">
                {index < currentStep ? (
                  <span className="text-[#00D4AA]">✓</span>
                ) : index === currentStep ? (
                  <span className="inline-block animate-spin">⏳</span>
                ) : (
                  <span className="text-gray-600">○</span>
                )}
              </span>
              <span className="text-sm">{step.icon}</span>
              <span
                className={`text-sm ${
                  index <= currentStep ? 'text-gray-200' : 'text-gray-600'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-6 h-1.5 bg-[#0A0E27] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00D4AA] to-[#0057FF] rounded-full transition-all duration-500"
            style={{
              width: `${((currentStep + 1) / SCAN_STEPS.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
