import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getDiscordAvatarUrl } from '@/services/discordService';

interface PersonSelectorAvatarProps {
  name: string;
  userId: string;
  avatarId: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const PersonSelectorAvatar: React.FC<PersonSelectorAvatarProps> = ({ 
  name, 
  userId, 
  avatarId,
  size = 'sm'
}) => {
  const avatarUrl = getDiscordAvatarUrl(userId, avatarId);
  
  // Get initials for the fallback
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
  
  // Size mappings (keeping the same as DiscordAvatar)
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };
  
  return (
    <div className="rounded-full bg-white">
      <Avatar className={`${sizeClasses[size]} border-2 border-gray-300 bg-white`}>
        <AvatarImage src={avatarUrl} alt={name} className="object-cover bg-white" />
        <AvatarFallback className="bg-white">{initials}</AvatarFallback>
      </Avatar>
    </div>
  );
};

export default PersonSelectorAvatar;
