
import React, { useEffect, useRef, useState } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [spacing, setSpacing] = useState<number>(-3); // Default spacing
  
  // Check if all persons are available
  const allAvailable = statuses.available.length === persons.length;

  // Adjust spacing based on container width
  useEffect(() => {
    const updateSpacing = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth;
      const avatarSize = 32; // 8 * 4 (size sm is 8rem with border)
      const totalAvatars = persons.length;
      
      // Determine available width
      const availableWidth = containerWidth - 20; // subtract padding
      
      // Calculate max width needed for fully separated avatars
      const maxWidthNeeded = avatarSize * totalAvatars;
      
      // Adjust spacing based on available width
      if (availableWidth >= maxWidthNeeded + 16) {
        // If too much space: completely separated (avatar-size apart)
        setSpacing(8); // positive spacing
      } else if (availableWidth >= maxWidthNeeded - 16) {
        // If enough space: slightly apart (half-avatar spacing)
        setSpacing(4);
      } else if (availableWidth >= maxWidthNeeded - 48) {
        // If not enough space: slight overlap
        setSpacing(-8);
      } else {
        // If much not enough space: more overlap
        setSpacing(-16);
      }
    };
    
    // Initial calculation
    updateSpacing();
    
    // Recalculate on window resize
    window.addEventListener('resize', updateSpacing);
    return () => window.removeEventListener('resize', updateSpacing);
  }, [persons.length]);
  
  return (
    <div className={`flex items-center text-sm py-4 ${allAvailable ? 'bg-green-100 rounded-md' : ''}`}>
      <div className="w-12 min-w-[48px] text-gray-500 text-center">{timeSlot}</div>
      
      <div ref={containerRef} className="flex-1 flex justify-center items-center px-2">
        <div className="flex" style={{ gap: `${spacing}px` }}>
          {persons.map((person, index) => {
            const discordUser = findDiscordUser(person, discordUsers);
            let status: SlotStatus = 'neutral';
            
            if (statuses.available.includes(person)) {
              status = 'available';
            } else if (statuses.unavailable.includes(person)) {
              status = 'unavailable';
            }
            
            // Apply z-index based on position (higher index = lower z-index)
            // This ensures the leftmost avatar is on top
            const zIndex = persons.length - index;
            
            return (
              <div 
                key={`${person}-${status}`} 
                className="relative" 
                style={{ zIndex }}
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
    </div>
  );
};

export default CalendarTimeSlot;
