
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
    <div className="bg-white rounded-lg shadow p-3">
      <div className="text-center mb-2">
        <div className="font-medium">{dayName}</div>
        <div className="text-sm text-gray-500">{formattedDate}</div>
      </div>
      <div className="space-y-4">
        {Object.entries(dayAvailability || {}).map(([timeSlot, statuses]) => {
          // Only show time slots that have at least one person with any status
          const hasAnyPerson = Object.values(statuses).some(persons => persons.length > 0);
          if (!hasAnyPerson) return null;
          
          return (
            <CalendarTimeSlot
              key={`${day}-${timeSlot}`}
              timeSlot={timeSlot}
              persons={persons}
              statuses={statuses}
              discordUsers={discordUsers}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CalendarDayColumn;
