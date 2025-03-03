import React, { useMemo } from 'react';
import { useCalendar } from '@/context/CalendarContext';
import { SlotStatus } from './TimeSlot';
import TransitionWrapper from './TransitionWrapper';
import { Person } from '@/types/calendar';
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
          } else {
            // If no status is set, consider it as neutral
            result[day][timeSlot]['neutral'].push(person);
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
                <div className="space-y-4">
                  {Object.entries(mergedAvailability[day] || {}).map(([timeSlot, statuses]) => {
                    // Only show time slots that have at least one person with any status
                    const hasAnyPerson = Object.values(statuses).some(persons => persons.length > 0);
                    if (!hasAnyPerson) return null;
                    
                    // Create an array of all persons with their status
                    const persons: Person[] = ['Léo', 'Hervé', 'Benoit', 'Corentin'];
                    
                    return (
                      <div key={`${day}-${timeSlot}`} className="flex items-center text-sm p-1 border-b">
                        <span className="w-10 text-gray-500">{timeSlot}</span>
                        
                        <div className="ml-2 flex flex-row flex-wrap gap-1">
                          {persons.map(person => {
                            const discordUser = findDiscordUser(person);
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
