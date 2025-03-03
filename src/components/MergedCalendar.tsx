
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

  // Style maps for different status types
  const statusStyles = {
    available: "border-green-300 bg-green-100",
    unavailable: "border-red-300 bg-red-100",
    neutral: "border-gray-300 bg-gray-100"
  };

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
                    // Only show time slots that have at least one person with any status
                    const hasAnyPerson = Object.values(statuses).some(persons => persons.length > 0);
                    if (!hasAnyPerson) return null;
                    
                    return (
                      <div key={`${day}-${timeSlot}`} className="flex items-center text-sm p-1 border-b">
                        <span className="w-10 text-gray-500">{timeSlot}</span>
                        
                        {/* Show available people */}
                        {statuses.available.length > 0 && (
                          <div className="ml-2 flex flex-wrap gap-1">
                            {statuses.available.map(person => {
                              const discordUser = findDiscordUser(person);
                              return (
                                <div 
                                  key={`available-${person}`} 
                                  className="relative"
                                  title={`${person} (Disponible)`}
                                >
                                  {discordUser ? (
                                    <DiscordAvatar 
                                      name={person} 
                                      userId={discordUser.discord_user_id} 
                                      avatarId={discordUser.avatar} 
                                      size="sm" 
                                      status="available"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center text-green-800 text-xs">
                                      {person.charAt(0)}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Show unavailable people */}
                        {statuses.unavailable.length > 0 && (
                          <div className="ml-2 flex flex-wrap gap-1">
                            {statuses.unavailable.map(person => {
                              const discordUser = findDiscordUser(person);
                              return (
                                <div 
                                  key={`unavailable-${person}`} 
                                  className="relative"
                                  title={`${person} (Indisponible)`}
                                >
                                  {discordUser ? (
                                    <DiscordAvatar 
                                      name={person} 
                                      userId={discordUser.discord_user_id} 
                                      avatarId={discordUser.avatar} 
                                      size="sm" 
                                      status="unavailable"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center text-red-800 text-xs">
                                      {person.charAt(0)}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Show neutral people */}
                        {statuses.neutral.length > 0 && (
                          <div className="ml-2 flex flex-wrap gap-1">
                            {statuses.neutral.map(person => {
                              const discordUser = findDiscordUser(person);
                              return (
                                <div 
                                  key={`neutral-${person}`} 
                                  className="relative"
                                  title={`${person} (Pas encore décidé)`}
                                >
                                  {discordUser ? (
                                    <DiscordAvatar 
                                      name={person} 
                                      userId={discordUser.discord_user_id} 
                                      avatarId={discordUser.avatar} 
                                      size="sm" 
                                      status="neutral"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center text-gray-800 text-xs">
                                      {person.charAt(0)}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
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
    </TransitionWrapper>
  );
};

export default MergedCalendar;
