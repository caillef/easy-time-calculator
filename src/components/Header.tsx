
import React from 'react';
import { cn } from '@/lib/utils';
import TransitionWrapper from './TransitionWrapper';
import { Calendar as CalendarIcon } from 'lucide-react';
import RefreshDiscordButton from './RefreshDiscordButton';

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <TransitionWrapper delay={100}>
      <header className={cn('py-8 px-6 md:px-10 glass rounded-2xl mb-8 shadow-sm border border-slate-200 mt-6 w-full', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <CalendarIcon className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Goudale Calendar</h1>
          </div>
          <RefreshDiscordButton />
        </div>
        
        <div className="mt-5 text-muted-foreground max-w-3xl">
          <p className="mb-2 font-medium text-slate-700">Instructions pour le calendrier :</p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm">
            <li>
              <span className="text-red-500 font-medium">Indisponible</span> : Indiquez les créneaux où vous êtes absolument pas disponible
            </li>
            <li>
              <span className="text-green-500 font-medium">Disponible</span> : Marquez les créneaux qui vous arrangent le plus
            </li>
            <li>
              <span className="text-slate-500 font-medium">Neutre</span> : Laissez vides les créneaux où vous pouvez vous libérer si nécessaire
            </li>
          </ul>
        </div>
      </header>
    </TransitionWrapper>
  );
};

export default Header;
