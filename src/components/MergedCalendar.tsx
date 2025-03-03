
import React from 'react';
import { useCalendar } from '@/context/CalendarContext';
import TransitionWrapper from './TransitionWrapper';
import { useQuery } from '@tanstack/react-query';
import { fetchDiscordUsers } from '@/services/discordService';
import { useMergedAvailability } from '@/hooks/useMergedAvailability';
import CalendarDayColumn from './CalendarDayColumn';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MergedCalendar = () => {
  const { calendarData, weekDates, currentWeekId, nextWeek, prevWeek, formatWeekRange } = useCalendar();

  // Fetch discord users
  const { data: discordUsers = [] } = useQuery({
    queryKey: ['discord-users'],
    queryFn: fetchDiscordUsers,
  });

  // Get the merged availability for each time slot
  const mergedAvailability = useMergedAvailability(calendarData, currentWeekId, weekDates);

  if (Object.keys(mergedAvailability).length === 0) {
    return null;
  }

  return (
    <TransitionWrapper>
      <div className="mb-8 overflow-x-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Disponibilités du groupe</h2>
          
          {/* Week navigation controls */}
          <div className="flex items-center space-x-2">
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
        
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2 min-w-[700px]">
          {weekDates.map(({ day, date }) => (
            <CalendarDayColumn
              key={day}
              day={day}
              date={date}
              dayAvailability={mergedAvailability[day] || {}}
              discordUsers={discordUsers}
            />
          ))}
        </div>
      </div>
    </TransitionWrapper>
  );
};

export default MergedCalendar;
