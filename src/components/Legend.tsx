
import React from 'react';
import { cn } from '@/lib/utils';
import TransitionWrapper from './TransitionWrapper';
import { Check, X, Minus } from 'lucide-react';

interface LegendProps {
  className?: string;
}

const Legend = ({ className }: LegendProps) => {
  return (
    <TransitionWrapper delay={300} className={cn('mb-8', className)}>
      <div className="flex flex-col md:flex-row gap-4 justify-center items-center glass rounded-xl p-5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-unavailable/80 flex items-center justify-center">
            <X className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium">Impossible</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-available/80 flex items-center justify-center">
            <Check className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium">Disponible</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-neutral flex items-center justify-center">
            <Minus className="h-4 w-4 text-gray-500" />
          </div>
          <span className="text-sm font-medium">Je peux me libérer</span>
        </div>
      </div>
    </TransitionWrapper>
  );
};

export default Legend;
