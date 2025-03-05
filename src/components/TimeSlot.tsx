
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
          <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
              'time-slot rounded-md h-10 m-1 flex items-center justify-center group relative',
              statusClasses[status],
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {statusIcons[status]}
            
            {/* Bouton de récurrence intégré qui apparaît au survol */}
            {showRecurrenceOption && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                onClick={(e) => {
                  e.stopPropagation();
                  onRecurrenceClick();
                }}
              >
                <div className="bg-white/90 rounded-md p-1.5">
                  <Repeat className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {showRecurrenceOption ? (
            <p>Cliquez pour changer le statut, survolez pour appliquer à toutes les semaines futures</p>
          ) : (
            <p>Cliquez pour changer le statut</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TimeSlot;
