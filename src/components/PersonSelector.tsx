
import React, { useEffect, useState } from 'react';
import { useCalendar } from '@/context/CalendarContext';
import { cn } from '@/lib/utils';
import TransitionWrapper from './TransitionWrapper';
import { Person } from '@/types/calendar';
import { DiscordUser, fetchDiscordUsers, getDiscordAvatarUrl, refreshDiscordUsers } from '@/services/discordService';
import { Loader2 } from 'lucide-react';

interface PersonSelectorProps {
  className?: string;
}

const PersonSelector: React.FC<PersonSelectorProps> = ({ className }) => {
  const { selectedPerson, setSelectedPerson } = useCalendar();
  const [discordUsers, setDiscordUsers] = useState<DiscordUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDiscordUsers = async () => {
      setIsLoading(true);
      const users = await fetchDiscordUsers();
      setDiscordUsers(users);
      setIsLoading(false);
      
      // Refresh Discord data in the background
      refreshDiscordUsers().then((success) => {
        if (success) {
          // Reload the data after refresh
          fetchDiscordUsers().then(setDiscordUsers);
        }
      });
    };
    
    loadDiscordUsers();
  }, []);

  const getPersonUser = (personName: Person): DiscordUser | undefined => {
    return discordUsers.find(user => user.name === personName);
  };

  return (
    <TransitionWrapper delay={150} className={cn('mb-8', className)}>
      <div className="glass rounded-xl p-5">
        <h3 className="text-md font-medium mb-4">Sélectionnez une personne:</h3>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {discordUsers.map(user => (
              <button
                key={user.id}
                className={cn(
                  'px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2',
                  selectedPerson === user.name 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'bg-secondary hover:bg-secondary/80'
                )}
                onClick={() => setSelectedPerson(user.name as Person)}
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200">
                  <img 
                    src={getDiscordAvatarUrl(user.discord_user_id, user.avatar)}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initial if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerText = user.name.charAt(0);
                      e.currentTarget.parentElement!.style.display = 'flex';
                      e.currentTarget.parentElement!.style.justifyContent = 'center';
                      e.currentTarget.parentElement!.style.alignItems = 'center';
                    }}
                  />
                </div>
                <span>{user.name}</span>
              </button>
            ))}
          </div>
        )}
        {!selectedPerson && (
          <p className="text-sm text-muted-foreground mt-3">
            Veuillez sélectionner une personne pour modifier son calendrier
          </p>
        )}
      </div>
    </TransitionWrapper>
  );
};

export default PersonSelector;
