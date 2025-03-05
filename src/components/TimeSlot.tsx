
import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Minus, Repeat } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type SlotStatus = 'unavailable' | 'available' | 'neutral';

interface TimeSlotProps {
  day: string;
  time: string;
  status: SlotStatus;
  isHeader?: boolean;
  isTimeLabel?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onRecurrenceClick?: () => void;
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
  onRecurrenceClick,
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

  // Si nous avons une fonction onRecurrenceClick et que le statut n'est pas neutre
  const showRecurrenceOption = status !== 'neutral' && onRecurrenceClick;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center m-1 h-10 rounded-md overflow-hidden">
            {/* Main button - 80% width */}
            <button
              onClick={onClick}
              disabled={disabled}
              className={cn(
                'time-slot-main w-4/5 h-full flex items-center justify-center',
                statusClasses[status],
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {statusIcons[status]}
            </button>
            
            {/* Recurrence button - 20% width */}
            {showRecurrenceOption ? (
              <button 
                className="w-1/5 h-full flex items-center justify-center bg-white/90 hover:bg-gray-200/90 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onRecurrenceClick?.();
                }}
                title="Appliquer à toutes les semaines futures"
              >
                <Repeat className="h-3 w-3 text-gray-600" />
              </button>
            ) : (
              <div className="w-1/5 h-full bg-gray-100/50"></div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {showRecurrenceOption ? (
            <p>Cliquez pour changer le statut, utilisez le bouton à droite pour appliquer à toutes les semaines futures</p>
          ) : (
            <p>Cliquez pour changer le statut</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TimeSlot;
