
import React from 'react';
import { SlotStatus } from './TimeSlot';
import { Person } from '@/types/calendar';
import { DiscordUser } from '@/services/discordService';
import DiscordAvatar from './DiscordAvatar';

interface CalendarTimeSlotProps {
  timeSlot: string;
  persons: Person[];
  statuses: Record<SlotStatus, Person[]>;
  discordUsers: DiscordUser[];
}

const findDiscordUser = (name: string, discordUsers: DiscordUser[]): DiscordUser | undefined => {
  return discordUsers.find(user => user.name === name);
};

const CalendarTimeSlot: React.FC<CalendarTimeSlotProps> = ({ 
  timeSlot, 
  persons, 
  statuses, 
  discordUsers 
}) => {
  // Check if all persons are available
  const allAvailable = statuses.available.length === persons.length;
  
  return (
    <div className={`flex items-center text-sm py-4 ${allAvailable ? 'bg-green-100 rounded-md' : ''}`}>
      <div className="w-12 text-gray-500 text-center">{timeSlot}</div>
      
      <div className="flex-1 flex justify-center items-center space-x-3">
        {persons.map(person => {
          const discordUser = findDiscordUser(person, discordUsers);
          let status: SlotStatus = 'neutral';
          
          if (statuses.available.includes(person)) {
            status = 'available';
          } else if (statuses.unavailable.includes(person)) {
            status = 'unavailable';
          }
          
          return (
            <div 
              key={`${person}-${status}`} 
              className="relative" 
              title={`${person} (${status === 'available' ? 'Disponible' : status === 'unavailable' ? 'Indisponible' : 'Pas encore décidé'})`}
            >
              {discordUser ? (
                <DiscordAvatar 
                  name={person} 
                  userId={discordUser.discord_user_id} 
                  avatarId={discordUser.avatar} 
                  size="sm" 
                  status={status}
                />
              ) : (
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs
                  ${status === 'available' ? 'border-4 border-green-500 bg-green-100 text-green-800' : 
                    status === 'unavailable' ? 'border-4 border-red-500 bg-red-100 text-red-800' : 
                    'border-2 border-gray-300 bg-gray-100 text-gray-800 opacity-30'}
                `}>
                  {person.charAt(0)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarTimeSlot;
