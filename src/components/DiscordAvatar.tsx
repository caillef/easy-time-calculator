
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
  
  // Size mappings
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };
  
  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={avatarUrl} alt={name} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
};

export default DiscordAvatar;
