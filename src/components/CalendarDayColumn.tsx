
import React from 'react';
import { SlotStatus } from './TimeSlot';
import { Person } from '@/types/calendar';
import { DiscordUser } from '@/services/discordService';
import CalendarTimeSlot from './CalendarTimeSlot';

interface CalendarDayColumnProps {
  day: string;
  date: Date;
  dayAvailability: Record<string, Record<SlotStatus, Person[]>>;
  discordUsers: DiscordUser[];
}

const CalendarDayColumn: React.FC<CalendarDayColumnProps> = ({ 
  day, 
  date, 
  dayAvailability, 
  discordUsers 
}) => {
  const formattedDate = date.getDate().toString().padStart(2, '0');
  const dayName = day.charAt(0).toUpperCase() + day.slice(1);
  const persons: Person[] = ['Léo', 'Hervé', 'Benoit', 'Corentin'];
  
  return (
    <div className="bg-white rounded-lg shadow p-3 w-full min-w-[160px]">
      <div className="text-center mb-2">
        <div className="font-medium">{dayName}</div>
        <div className="text-sm text-gray-500">{formattedDate}</div>
      </div>
      <div className="px-0">
        {Object.entries(dayAvailability || {}).map(([timeSlot, statuses], index, arr) => {
          // Only show time slots that have at least one person with any status
          const hasAnyPerson = Object.values(statuses).some(persons => persons.length > 0);
          if (!hasAnyPerson) return null;
          
          // Check if we need a separator (only between 17:00 and 18:00)
          const showSeparator = timeSlot === '17:00';
          
          return (
            <React.Fragment key={`${day}-${timeSlot}`}>
              {showSeparator && <div className="border-t border-gray-200 my-3"></div>}
              <CalendarTimeSlot
                timeSlot={timeSlot}
                persons={persons}
                statuses={statuses}
                discordUsers={discordUsers}
              />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarDayColumn;
