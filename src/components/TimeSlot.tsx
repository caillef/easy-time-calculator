
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
          <div className="relative">
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
            
            {/* Bouton de récurrence positionné à droite */}
            {showRecurrenceOption && (
              <button 
                className="absolute top-1/2 -translate-y-1/2 right-0 w-6 h-6 flex items-center justify-center bg-white/90 rounded-full shadow-sm opacity-0 hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onRecurrenceClick?.();
                }}
                title="Appliquer à toutes les semaines futures"
              >
                <Repeat className="h-3 w-3 text-gray-600" />
              </button>
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
