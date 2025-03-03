
import React from 'react';
import { cn } from '@/lib/utils';
import TransitionWrapper from './TransitionWrapper';
import { useCalendar } from '@/context/CalendarContext';
import { SlotStatus } from './TimeSlot';

interface MergedCalendarProps {
  className?: string;
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const TIMES = [
  '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', 
  '16:00', '17:00', '18:00', '19:00', '20:00'
];

type SlotSummary = {
  available: number;
  unavailable: number;
  neutral: number;
  total: number;
};

const MergedCalendar: React.FC<MergedCalendarProps> = ({ className }) => {
  const { calendarData } = useCalendar();

  const getSummaryForSlot = (day: string, time: string): SlotSummary => {
    const summary = {
      available: 0,
      unavailable: 0,
      neutral: 0,
      total: 0
    };

    Object.values(calendarData).forEach(personData => {
      if (personData && personData[day] && personData[day][time]) {
        const status = personData[day][time];
        summary[status]++;
        summary.total++;
      }
    });

    return summary;
  };

  const getSlotColor = (summary: SlotSummary) => {
    // If everyone is available
    if (summary.available === summary.total && summary.total > 0) {
      return 'bg-available/80';
    }
    // If everyone is unavailable
    if (summary.unavailable === summary.total && summary.total > 0) {
      return 'bg-unavailable/80';
    }
    // Mixed or neutral cases
    return 'bg-neutral';
  };

  return (
    <TransitionWrapper delay={50} className={cn('mb-8', className)}>
      <div className="glass rounded-xl p-5">
        <h3 className="text-lg font-medium mb-4">Vue Combinée</h3>
        <div className="overflow-x-auto">
          <div className="merged-calendar-grid min-w-[700px]">
            {/* Header row with day names */}
            <div className="col-start-1"></div>
            {DAYS.map((day) => (
              <div 
                key={day} 
                className="flex items-center justify-center font-medium p-2 text-sm text-center"
              >
                {day}
              </div>
            ))}
            
            {/* Time slots */}
            {TIMES.map((time) => (
              <React.Fragment key={time}>
                <div className="flex items-center justify-end pr-4 text-xs text-muted-foreground">
                  {time}
                </div>
                
                {DAYS.map((day) => {
                  const summary = getSummaryForSlot(day, time);
                  const baseColor = getSlotColor(summary);
                  
                  return (
                    <div
                      key={`${day}-${time}`}
                      className={cn(
                        'merged-time-slot rounded-md h-10 m-1 flex items-center justify-center',
                        baseColor
                      )}
                    >
                      {summary.total > 0 && (
                        <div className="flex gap-1">
                          {summary.available > 0 && (
                            <span className="h-3 w-3 bg-available rounded-full" 
                                  title={`${summary.available} personnes disponibles`} />
                          )}
                          {summary.unavailable > 0 && (
                            <span className="h-3 w-3 bg-unavailable rounded-full" 
                                  title={`${summary.unavailable} personnes non disponibles`} />
                          )}
                          {summary.neutral > 0 && (
                            <span className="h-3 w-3 bg-neutral border border-gray-300 rounded-full" 
                                  title={`${summary.neutral} personnes peuvent se libérer`} />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </TransitionWrapper>
  );
};

export default MergedCalendar;
