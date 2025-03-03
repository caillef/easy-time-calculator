
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getDiscordAvatarUrl } from '@/services/discordService';

interface DiscordAvatarProps {
  name: string;
  userId: string;
  avatarId: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const DiscordAvatar: React.FC<DiscordAvatarProps> = ({ 
  name, 
  userId, 
  avatarId,
  size = 'md'
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
  
  return (
    <Avatar className={`${sizeClasses[size]} border-2 border-green-200 bg-green-100`}>
      <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
      <AvatarFallback className="bg-green-100 text-green-800">{initials}</AvatarFallback>
    </Avatar>
  );
};

export default DiscordAvatar;
