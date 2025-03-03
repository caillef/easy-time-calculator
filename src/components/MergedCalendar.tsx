
import React, { useMemo } from 'react';
import { useCalendar } from '@/context/CalendarContext';
import { SlotStatus } from './TimeSlot';
import TransitionWrapper from './TransitionWrapper';
import { Person } from '@/types/calendar';
import { Badge } from '@/components/ui/badge';
import { fetchDiscordUsers, DiscordUser } from '@/services/discordService';
import { useQuery } from '@tanstack/react-query';
import DiscordAvatar from './DiscordAvatar';

const MergedCalendar = () => {
  const { calendarData, weekDates, currentWeekId } = useCalendar();

  // Fetch discord users
  const { data: discordUsers = [] } = useQuery({
    queryKey: ['discord-users'],
    queryFn: fetchDiscordUsers,
  });

  // Get the merged availability for each time slot
  const mergedAvailability = useMemo(() => {
    if (!calendarData[currentWeekId]) return {};

    const timeSlots = [
      '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
      '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
      '21:00', '22:00', '23:00'
    ];
    const days = weekDates.map(date => date.day);
    const persons: Person[] = ['Léo', 'Hervé', 'Benoit', 'Corentin'];
    
    const result: Record<string, Record<string, Record<SlotStatus, Person[]>>> = {};
    
    days.forEach(day => {
      result[day] = {};
      
      timeSlots.forEach(timeSlot => {
        result[day][timeSlot] = {
          'available': [],
          'unavailable': [],
          'neutral': []
        };
        
        persons.forEach(person => {
          const status = calendarData[currentWeekId]?.[person]?.[day]?.[timeSlot];
          if (status) {
            result[day][timeSlot][status].push(person);
          }
        });
      });
    });
    
    return result;
  }, [calendarData, currentWeekId, weekDates]);
  
  const findDiscordUser = (name: string): DiscordUser | undefined => {
    return discordUsers.find(user => user.name === name);
  };

  if (Object.keys(mergedAvailability).length === 0) {
    return null;
  }

  return (
    <TransitionWrapper>
      <div className="mb-8 overflow-x-auto">
        <h2 className="text-xl font-bold mb-2">Disponibilités du groupe</h2>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2 min-w-[700px]">
          {weekDates.map(({ day, date }) => {
            const formattedDate = date.getDate().toString().padStart(2, '0');
            const dayName = day.charAt(0).toUpperCase() + day.slice(1);
            
            return (
              <div key={day} className="bg-white rounded-lg shadow p-3">
                <div className="text-center mb-2">
                  <div className="font-medium">{dayName}</div>
                  <div className="text-sm text-gray-500">{formattedDate}</div>
                </div>
                <div className="space-y-2">
                  {Object.entries(mergedAvailability[day] || {}).map(([timeSlot, statuses]) => {
                    if (statuses.available.length === 0) return null;
                    
                    return (
                      <div key={`${day}-${timeSlot}`} className="flex items-center text-sm p-1 border-b">
                        <span className="w-10 text-gray-500">{timeSlot}</span>
                        <div className="ml-2 flex flex-wrap gap-1">
                          {statuses.available.map(person => {
                            const discordUser = findDiscordUser(person);
                            return (
                              <Badge 
                                key={person} 
                                className="flex items-center space-x-1 bg-green-100 text-green-800 hover:bg-green-200"
                              >
                                {discordUser ? (
                                  <DiscordAvatar 
                                    name={person} 
                                    userId={discordUser.discord_user_id} 
                                    avatarId={discordUser.avatar} 
                                    size="sm" 
                                  />
                                ) : (
                                  <span className="w-4 h-4 rounded-full bg-green-200 flex items-center justify-center text-green-800 text-xs">
                                    {person.charAt(0)}
                                  </span>
                                )}
                                <span>{person}</span>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TransitionWrapper>
  );
};

export default MergedCalendar;
