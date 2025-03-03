
import React from 'react';
import { useCalendar } from '@/context/CalendarContext';
import { cn } from '@/lib/utils';
import TransitionWrapper from './TransitionWrapper';
import { Person } from '@/types/calendar';

interface PersonSelectorProps {
  className?: string;
}

const PEOPLE: { name: Person; emoji: string }[] = [
  { name: 'Léo', emoji: '🦤' },
  { name: 'Hervé', emoji: '🚀' },
  { name: 'Benoit', emoji: '💎' },
  { name: 'Corentin', emoji: '🥳' }
];

const PersonSelector: React.FC<PersonSelectorProps> = ({ className }) => {
  const { selectedPerson, setSelectedPerson } = useCalendar();

  return (
    <TransitionWrapper delay={150} className={cn('mb-8', className)}>
      <div className="glass rounded-xl p-5">
        <h3 className="text-md font-medium mb-4">Sélectionnez une personne:</h3>
        <div className="flex flex-wrap gap-3">
          {PEOPLE.map(person => (
            <button
              key={person.name}
              className={cn(
                'px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2',
                selectedPerson === person.name 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-secondary hover:bg-secondary/80'
              )}
              onClick={() => setSelectedPerson(person.name as any)}
            >
              <span>{person.emoji}</span>
              <span>{person.name}</span>
            </button>
          ))}
        </div>
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
