
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SlotStatus } from '@/components/TimeSlot';

type Person = 'Léo' | 'Hervé' | 'Benoit' | 'Corentin' | '';

export type TimeSlotData = {
  [day: string]: {
    [time: string]: SlotStatus;
  };
};

export type CalendarData = {
  [person in Exclude<Person, ''>]?: TimeSlotData;
};

interface CalendarContextType {
  selectedPerson: Person;
  setSelectedPerson: (person: Person) => void;
  calendarData: CalendarData;
  setCalendarData: React.Dispatch<React.SetStateAction<CalendarData>>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

interface CalendarProviderProps {
  children: ReactNode;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const [selectedPerson, setSelectedPerson] = useState<Person>('');
  const [calendarData, setCalendarData] = useState<CalendarData>({
    'Léo': {},
    'Hervé': {},
    'Benoit': {},
    'Corentin': {},
  });

  return (
    <CalendarContext.Provider value={{ 
      selectedPerson, 
      setSelectedPerson, 
      calendarData, 
      setCalendarData 
    }}>
      {children}
    </CalendarContext.Provider>
  );
};
