
import React from 'react';
import { cn } from '@/lib/utils';
import TransitionWrapper from './TransitionWrapper';
import TimeSlot, { SlotStatus } from './TimeSlot';
import { useCalendar } from '@/context/CalendarContext';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { DAYS } from '@/utils/calendarUtils';

interface CalendarProps {
  className?: string;
}

const TIMES = [
  '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', 
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

const Calendar = ({ className }: CalendarProps) => {
  const { 
    selectedPerson, 
    calendarData, 
    setCalendarData, 
    isLoading, 
    nextWeek, 
    prevWeek, 
    weekDates,
    formatWeekRange,
    currentWeekId
  } = useCalendar();

  const getSlotStatus = (day: string, time: string): SlotStatus => {
    if (!selectedPerson || !calendarData[currentWeekId]?.[selectedPerson]) return 'neutral';
    
    return calendarData[currentWeekId]?.[selectedPerson]?.[day]?.[time] || 'neutral';
  };

  const handleSlotClick = (day: string, time: string) => {
    if (!selectedPerson) return;

    setCalendarData(prev => {
      // Make sure we have the week data structure
      const weekData = prev[currentWeekId] || {
        'Léo': {},
        'Hervé': {},
        'Benoit': {},
        'Corentin': {},
      };
      
      const personData = weekData[selectedPerson] || {};
      const dayData = personData[day] || {};
      
      // Get current status or default to neutral
      const currentStatus = dayData[time] || 'neutral';
      
      // Cycle through statuses: neutral -> available -> unavailable -> neutral
      let newStatus: SlotStatus;
      if (currentStatus === 'neutral') {
        newStatus = 'available';
      } else if (currentStatus === 'available') {
        newStatus = 'unavailable';
      } else {
        newStatus = 'neutral';
      }
      
      const updatedDayData = {
        ...dayData,
        [time]: newStatus
      };
      
      return {
        ...prev,
        [currentWeekId]: {
          ...weekData,
          [selectedPerson]: {
            ...personData,
            [day]: updatedDayData
          }
        }
      };
    });
  };

  if (isLoading) {
    return (
      <TransitionWrapper delay={200} className={cn('flex justify-center items-center p-10', className)}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </TransitionWrapper>
    );
  }

  return (
    <TransitionWrapper delay={200} className={cn('', className)}>
      <div className="overflow-x-auto">
        <div className="calendar-grid min-w-[700px] glass rounded-xl p-4">
          {/* Week navigation */}
          <div className="col-span-full mb-4 flex items-center justify-between">
            <button 
              onClick={prevWeek}
              className="rounded-full p-1.5 hover:bg-gray-200 transition-colors"
              aria-label="Semaine précédente"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <h3 className="text-lg font-medium">{formatWeekRange()}</h3>
            
            <button 
              onClick={nextWeek}
              className="rounded-full p-1.5 hover:bg-gray-200 transition-colors"
              aria-label="Semaine suivante"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          {/* Header row with day names and dates */}
          <div className="col-start-1"></div>
          {weekDates.map(({ day, date }) => (
            <TimeSlot 
              key={day} 
              day={day} 
              time="" 
              status="neutral" 
              isHeader={true} 
              date={date}
            />
          ))}
          
          {/* Time slots */}
          {TIMES.map((time, index) => (
            <React.Fragment key={time}>
              {/* Time slot row */}
              <TimeSlot
                day=""
                time={time}
                status="neutral"
                isTimeLabel={true}
              />
              
              {DAYS.map((day) => (
                <TimeSlot
                  key={`${day}-${time}`}
                  day={day}
                  time={time}
                  status={getSlotStatus(day, time)}
                  onClick={() => handleSlotClick(day, time)}
                  disabled={!selectedPerson}
                />
              ))}
              
              {/* Add separator after 17:00 and before 18:00 */}
              {time === '17:00' && (
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
            </React.Fragment>
          ))}
        </div>
      </div>
    </TransitionWrapper>
  );
};

export default Calendar;
