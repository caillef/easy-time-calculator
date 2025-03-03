
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
  const [overlapAmount, setOverlapAmount] = useState<number>(10); // Default overlap amount
  
  // Check if all persons are available
  const allAvailable = statuses.available.length === persons.length;

  // Adjust overlap based on container width
  useEffect(() => {
    const updateOverlap = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth;
      const avatarSize = 32; // 8 * 4 (size sm is 8rem with border)
      const totalAvatars = persons.length;
      
      // Determine available width
      const availableWidth = containerWidth - 10; // reduce padding to maximize space
      
      // Calculate width needed with different overlap values
      const fullWidth = totalAvatars * avatarSize;
      
      // Adjust overlap based on available width
      if (availableWidth >= fullWidth) {
        // No overlap needed if there's enough space
        setOverlapAmount(0);
      } else if (availableWidth >= fullWidth - (totalAvatars - 1) * 15) {
        // Small overlap
        setOverlapAmount(15);
      } else if (availableWidth >= fullWidth - (totalAvatars - 1) * 20) {
        // Medium overlap
        setOverlapAmount(20);
      } else {
        // Large overlap for very small screens
        setOverlapAmount(24);
      }
    };
    
    // Initial calculation
    updateOverlap();
    
    // Recalculate on window resize
    window.addEventListener('resize', updateOverlap);
    return () => window.removeEventListener('resize', updateOverlap);
  }, [persons.length]);
  
  return (
    <div className={`flex items-center text-sm py-2 ${allAvailable ? 'bg-green-100 rounded-md' : ''}`}>
      <div className="w-10 min-w-[40px] text-gray-500 text-center">{timeSlot}</div>
      
      <div ref={containerRef} className="flex-1 flex justify-center items-center pl-1">
        <div className="flex">
          {persons.map((person, index) => {
            const discordUser = findDiscordUser(person, discordUsers);
            let status: SlotStatus = 'neutral';
            
            if (statuses.available.includes(person)) {
              status = 'available';
            } else if (statuses.unavailable.includes(person)) {
              status = 'unavailable';
            }
            
            // Apply z-index based on position (lower index = higher z-index)
            // This ensures the leftmost avatar is on top
            const zIndex = persons.length - index;
            
            return (
              <div 
                key={`${person}-${status}`} 
                className="relative" 
                style={{ 
                  zIndex,
                  marginLeft: index > 0 ? `-${overlapAmount}px` : '0' 
                }}
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
                    w-8 h-8 rounded-full flex items-center justify-center text-xs bg-white
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
