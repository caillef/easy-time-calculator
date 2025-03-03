
import React from 'react';
import { cn } from '@/lib/utils';
import TransitionWrapper from './TransitionWrapper';
import { useCalendar } from '@/context/CalendarContext';
import { SlotStatus } from './TimeSlot';
import { Loader2 } from 'lucide-react';

interface MergedCalendarProps {
  className?: string;
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const TIMES = [
  '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', 
  '16:00', '17:00', '18:00', '19:00', '20:00'
];

const PEOPLE = [
  { name: 'Léo', initial: 'L' },
  { name: 'Hervé', initial: 'H' },
  { name: 'Benoit', initial: 'B' },
  { name: 'Corentin', initial: 'C' }
];

// Helper function to get status class
const getStatusClass = (status: SlotStatus | undefined) => {
  switch (status) {
    case 'available':
      return 'bg-available text-white';
    case 'unavailable':
      return 'bg-unavailable text-white';
    default:
      return 'bg-neutral border border-gray-300';
  }
};

const MergedCalendar: React.FC<MergedCalendarProps> = ({ className }) => {
  const { calendarData, isLoading } = useCalendar();

  if (isLoading) {
    return (
      <TransitionWrapper delay={50} className={cn('mb-8', className)}>
        <div className="glass rounded-xl p-5 flex justify-center items-center" style={{ minHeight: '200px' }}>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Chargement des données...</p>
          </div>
        </div>
      </TransitionWrapper>
    );
  }

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
                
                {DAYS.map((day) => (
                  <div
                    key={`${day}-${time}`}
                    className="merged-time-slot rounded-md h-10 m-1 flex items-center justify-center bg-gray-50"
                  >
                    <div className="grid grid-cols-2 gap-1">
                      {PEOPLE.map((person) => {
                        const status = calendarData[person.name]?.[day]?.[time];
                        return (
                          <div 
                            key={person.initial}
                            className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium",
                              getStatusClass(status)
                            )}
                            title={`${person.name}: ${status || 'Non défini'}`}
                          >
                            {person.initial}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </TransitionWrapper>
  );
};

export default MergedCalendar;
