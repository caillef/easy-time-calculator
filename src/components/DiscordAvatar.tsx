
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getDiscordAvatarUrl } from '@/services/discordService';
import { SlotStatus } from './TimeSlot';

interface DiscordAvatarProps {
  name: string;
  userId: string;
  avatarId: string | null;
  size?: 'sm' | 'md' | 'lg';
  status?: SlotStatus;
}

const DiscordAvatar: React.FC<DiscordAvatarProps> = ({ 
  name, 
  userId, 
  avatarId,
  size = 'md',
  status = 'neutral'
}) => {
  const avatarUrl = getDiscordAvatarUrl(userId, avatarId);
  
  // Get initials for the fallback
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
  
  // Size mappings with additional classes for different contexts
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };
  
  // Status style mappings with thicker borders and opacity adjustment for neutral
  const statusStyles = {
    available: 'border-5 border-green-500 bg-green-100 text-green-800',
    unavailable: 'border-5 border-red-500 bg-red-100 text-red-800',
    neutral: 'border-2 border-gray-300 bg-gray-100 text-gray-800 opacity-30'
  };
  
  return (
    <div className="rounded-full bg-white">
      <Avatar className={`${sizeClasses[size]} ${statusStyles[status]}`}>
        <AvatarImage src={avatarUrl} alt={name} className="object-cover bg-white" />
        <AvatarFallback className={`bg-white ${status === 'neutral' ? 'opacity-30' : ''}`}>{initials}</AvatarFallback>
      </Avatar>
    </div>
  );
};

export default DiscordAvatar;
