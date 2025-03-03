
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
  
  // Status style mappings
  const statusStyles = {
    available: 'border-green-300 bg-green-100 text-green-800',
    unavailable: 'border-red-300 bg-red-100 text-red-800',
    neutral: 'border-gray-300 bg-gray-100 text-gray-800'
  };
  
  return (
    <Avatar className={`${sizeClasses[size]} border-2 ${statusStyles[status]}`}>
      <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
      <AvatarFallback className={statusStyles[status]}>{initials}</AvatarFallback>
    </Avatar>
  );
};

export default DiscordAvatar;
