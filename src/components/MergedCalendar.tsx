import React from 'react';
import { cn } from '@/lib/utils';
import TransitionWrapper from './TransitionWrapper';
import { useCalendar } from '@/context/CalendarContext';
import { SlotStatus } from './TimeSlot';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MergedCalendarProps {
  className?: string;
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const TIMES = [
  '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', 
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

const PEOPLE = [
  { name: 'Léo', emoji: '🦤', color: '#FFB6C1' }, // Light Pink
  { name: 'Hervé', emoji: '🚀', color: '#ADD8E6' }, // Light Blue
  { name: 'Benoit', emoji: '💎', color: '#90EE90' }, // Light Green
  { name: 'Corentin', emoji: '🥳', color: '#FFFFE0' }  // Light Yellow
];

const getStatusClass = (status: SlotStatus | undefined, personColor: string) => {
  switch (status) {
    case 'available':
      return 'bg-available text-white';
    case 'unavailable':
      return 'bg-unavailable text-white';
    default:
      return `bg-neutral border border-gray-300`;
  }
};

const MergedCalendar: React.FC<MergedCalendarProps> = ({ className }) => {
  const { 
    calendarData, 
    isLoading, 
    nextWeek, 
    prevWeek, 
    weekDates,
    formatWeekRange,
    currentWeekId
  } = useCalendar();

  const areAllAvailable = (day: string, time: string): boolean => {
    return PEOPLE.every(person => 
      calendarData[currentWeekId]?.[person.name]?.[day]?.[time] === 'available'
    );
  };

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Vue Combinée</h3>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={prevWeek}
              className="rounded-full p-1.5 hover:bg-gray-200 transition-colors"
              aria-label="Semaine précédente"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <span className="text-sm font-medium">{formatWeekRange()}</span>
            
            <button 
              onClick={nextWeek}
              className="rounded-full p-1.5 hover:bg-gray-200 transition-colors"
              aria-label="Semaine suivante"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-4 justify-center">
          {PEOPLE.map((person) => (
            <div 
              key={person.name} 
              className="flex items-center gap-1.5"
            >
              <span className="text-lg">{person.emoji}</span>
              <span className="text-sm font-medium">{person.name}</span>
            </div>
          ))}
        </div>
        
        <div className="overflow-x-auto">
          <div className="merged-calendar-grid min-w-[700px]">
            <div className="col-start-1"></div>
            {weekDates.map(({ day, date }) => (
              <div 
                key={day} 
                className="flex flex-col items-center justify-center font-medium p-2 text-sm text-center"
              >
                <span>{day}</span>
                <span className="text-xs text-muted-foreground">
                  {format(date, 'd MMM', { locale: fr })}
                </span>
              </div>
            ))}
            
            {TIMES.map((time, index) => (
              <React.Fragment key={time}>
                {time === '18:00' && (
                  <React.Fragment>
                    <div className="col-span-1 border-t border-gray-300 my-4"></div>
                    {DAYS.map((day, dayIndex) => (
                      <div 
                        key={`separator-${day}`} 
                        className="col-span-1 border-t border-gray-300 my-4"
                      ></div>
                    ))}
                  </React.Fragment>
                )}
                
                <div className="flex items-center justify-end pr-4 text-xs text-muted-foreground">
                  {time}
                </div>
                
                {DAYS.map((day) => {
                  const allAvailable = areAllAvailable(day, time);
                  
                  return (
                    <div
                      key={`${day}-${time}`}
                      className={cn(
                        "merged-time-slot rounded-md h-10 m-1 flex items-center justify-center",
                        allAvailable ? "bg-available/20" : "bg-gray-50"
                      )}
                    >
                      <div className="flex items-center space-x-2 p-1">
                        {PEOPLE.map((person) => {
                          const status = calendarData[currentWeekId]?.[person.name]?.[day]?.[time];
                          return (
                            <div 
                              key={person.emoji}
                              className={cn(
                                "h-6 w-6 flex items-center justify-center rounded-full",
                                getStatusClass(status, person.color)
                              )}
                              style={{ 
                                backgroundColor: status === 'available' ? '#4CAF50' : 
                                               status === 'unavailable' ? '#FF5A5A' : 
                                               person.color,
                                opacity: status ? 1 : 0.6
                              }}
                              title={`${person.name}: ${status || 'Non défini'}`}
                            >
                              <span>{person.emoji}</span>
                            </div>
                          );
                        })}
                      </div>
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
