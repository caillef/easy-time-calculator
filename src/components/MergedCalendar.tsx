
import React from 'react';
import { useCalendar } from '@/context/CalendarContext';
import TransitionWrapper from './TransitionWrapper';
import { useQuery } from '@tanstack/react-query';
import { fetchDiscordUsers } from '@/services/discordService';
import { useMergedAvailability } from '@/hooks/useMergedAvailability';
import CalendarDayColumn from './CalendarDayColumn';

const MergedCalendar = () => {
  const { calendarData, weekDates, currentWeekId } = useCalendar();

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
        <h2 className="text-xl font-bold mb-2">Disponibilités du groupe</h2>
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
