
import React, { useEffect, useState } from 'react';
import { useCalendar } from '@/context/CalendarContext';
import { Person } from '@/types/calendar';
import TransitionWrapper from './TransitionWrapper';
import { fetchDiscordUsers, type DiscordUser } from '@/services/discordService';
import DiscordAvatar from './DiscordAvatar';

const PersonSelector = () => {
  const { selectedPerson, setSelectedPerson } = useCalendar();
  const [discordUsers, setDiscordUsers] = useState<DiscordUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // List of persons
  const persons: Person[] = ['Léo', 'Hervé', 'Benoit', 'Corentin'];

  useEffect(() => {
    const loadDiscordUsers = async () => {
      setIsLoading(true);
      const users = await fetchDiscordUsers();
      setDiscordUsers(users);
      setIsLoading(false);
    };

    loadDiscordUsers();
  }, []);

  const findDiscordUser = (name: string) => {
    return discordUsers.find(user => user.name === name);
  };

  return (
    <div className="mb-6">
      <TransitionWrapper>
        <h2 className="text-xl font-bold mb-2">Sélectionnez une personne</h2>
        <div className="flex flex-wrap gap-3">
          {persons.map((person) => {
            const isSelected = selectedPerson === person;
            const discordUser = findDiscordUser(person);
            
            return (
              <button
                key={person}
                onClick={() => setSelectedPerson(person)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                  isSelected
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                {discordUser ? (
                  <div className="bg-white rounded-full overflow-hidden">
                    <DiscordAvatar 
                      name={person} 
                      userId={discordUser.discord_user_id} 
                      avatarId={discordUser.avatar} 
                      size="sm" 
                      status="neutral"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                    {person.charAt(0)}
                  </div>
                )}
                <span>{person}</span>
              </button>
            );
          })}
        </div>
      </TransitionWrapper>
    </div>
  );
};

export default PersonSelector;
