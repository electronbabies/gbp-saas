import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Business } from '../pages/BusinessScanner';

interface ScanningStepProps {
  business: Business;
  onScanComplete: () => void;
}

export default function ScanningStep({ business, onScanComplete }: ScanningStepProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing scan...');

  useEffect(() => {
    const steps = [
      { message: 'Analyzing business profile...', duration: 1000 },
      { message: 'Checking online presence...', duration: 1000 },
      { message: 'Evaluating customer reviews...', duration: 500 },
      { message: 'Generating recommendations...', duration: 500 }
    ];

    let currentStep = 0;
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    const progressIncrement = 100 / steps.length;

    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setStatus(steps[currentStep].message);
        setProgress((currentStep + 1) * progressIncrement);
        currentStep++;
      } else {
        clearInterval(interval);
        onScanComplete();
      }
    }, totalDuration / steps.length);

    return () => clearInterval(interval);
  }, [onScanComplete]);

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="flex justify-center mb-8">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Analyzing Your Business Profile
      </h2>
      <p className="text-gray-600 mb-8">
        We're scanning {business.name}'s Google Business Profile for optimization opportunities.
      </p>
      
      <div className="mt-8 space-y-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <p className="text-sm text-gray-500">{status}</p>
      </div>
    </div>
  );
}