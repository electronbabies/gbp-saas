import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StepIndicatorProps {
  steps: {
    title: string;
    icon: LucideIcon;
  }[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex justify-center">
      <div className="flex items-center space-x-4 md:space-x-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <React.Fragment key={step.title}>
              {index > 0 && (
                <div 
                  className={`hidden md:block h-0.5 w-12 ${
                    isComplete ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                />
              )}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : isComplete
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${
                    isActive ? 'text-indigo-600' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}