
import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export type SlotStatus = 'unavailable' | 'available' | 'neutral';

interface TimeSlotProps {
  day: string;
  time: string;
  status: SlotStatus;
  isHeader?: boolean;
  isTimeLabel?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  date?: Date;
}

const TimeSlot = ({ 
  day, 
  time, 
  status, 
  isHeader = false, 
  isTimeLabel = false,
  disabled = false,
  onClick,
  date
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
      <div className="flex flex-col items-center justify-center font-medium p-2 text-sm text-center">
        <span>{day}</span>
        {date && (
          <span className="text-xs text-muted-foreground">
            {format(date, 'd MMM', { locale: fr })}
          </span>
        )}
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
      disabled={disabled}
      className={cn(
        'time-slot rounded-md h-10 m-1 flex items-center justify-center',
        statusClasses[status],
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {statusIcons[status]}
    </button>
  );
};

export default TimeSlot;
