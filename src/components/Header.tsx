
import React from 'react';
import { cn } from '@/lib/utils';
import TransitionWrapper from './TransitionWrapper';
import { Calendar as CalendarIcon } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <TransitionWrapper delay={100}>
      <header className={cn('py-8 px-6 md:px-10 glass rounded-2xl mb-8', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-medium tracking-tight">Calendrier de Disponibilités</h1>
          </div>
        </div>
        <p className="mt-4 text-muted-foreground max-w-3xl">
          Pour le calendrier de disponibilités, vous mettez les créneaux où vous êtes pas dispo genre impossible, 
          et les créneaux genre "dispo" dans le sens "ça m'arrangerait si ça pouvait être là", et en gros les espaces 
          restants c'est "je peux me libérer".
        </p>
      </header>
    </TransitionWrapper>
  );
};

export default Header;
