
import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Minus } from 'lucide-react';

export type SlotStatus = 'unavailable' | 'available' | 'neutral';

interface TimeSlotProps {
  day: string;
  time: string;
  status: SlotStatus;
  isHeader?: boolean;
  isTimeLabel?: boolean;
  onClick?: () => void;
}

const TimeSlot = ({ 
  day, 
  time, 
  status, 
  isHeader = false, 
  isTimeLabel = false,
  onClick 
}: TimeSlotProps) => {
  
  const statusClasses = {
    unavailable: 'time-slot-unavailable',
    available: 'time-slot-available',
    neutral: 'time-slot-neutral',
  };

  const statusIcons = {
    unavailable: <X className="h-4 w-4" />,
    available: <Check className="h-4 w-4" />,
    neutral: <Minus className="h-4 w-4 text-gray-500" />,
  };

  if (isHeader) {
    return (
      <div className="flex items-center justify-center font-medium p-2 text-sm text-center">
        {day}
      </div>
    );
  }

  if (isTimeLabel) {
    return (
      <div className="flex items-center justify-end pr-4 text-xs text-muted-foreground">
        {time}
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'time-slot rounded-md h-10 m-1 flex items-center justify-center',
        statusClasses[status]
      )}
    >
      {statusIcons[status]}
    </button>
  );
};

export default TimeSlot;
