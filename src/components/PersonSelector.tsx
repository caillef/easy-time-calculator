
import React from 'react';
import { useCalendar } from '@/context/CalendarContext';
import { cn } from '@/lib/utils';
import TransitionWrapper from './TransitionWrapper';

interface PersonSelectorProps {
  className?: string;
}

const PersonSelector: React.FC<PersonSelectorProps> = ({ className }) => {
  const { selectedPerson, setSelectedPerson } = useCalendar();
  const people = ['Léo', 'Hervé', 'Benoit', 'Corentin'];

  return (
    <TransitionWrapper delay={150} className={cn('mb-8', className)}>
      <div className="glass rounded-xl p-5">
        <h3 className="text-md font-medium mb-4">Sélectionnez une personne:</h3>
        <div className="flex flex-wrap gap-3">
          {people.map(person => (
            <button
              key={person}
              className={cn(
                'px-4 py-2 rounded-lg transition-all duration-300',
                selectedPerson === person 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-secondary hover:bg-secondary/80'
              )}
              onClick={() => setSelectedPerson(person as any)}
            >
              {person}
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
