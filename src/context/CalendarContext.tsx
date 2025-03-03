
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { SlotStatus } from '@/components/TimeSlot';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

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
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('calendar_data')
          .select('*');
        
        if (error) {
          throw error;
        }

        // Transform the data from the database into our app's format
        const transformedData: CalendarData = {
          'Léo': {},
          'Hervé': {},
          'Benoit': {},
          'Corentin': {},
        };

        data.forEach(entry => {
          const { person, day, time_slot, status } = entry;
          if (!transformedData[person as Person]) {
            transformedData[person as Person] = {};
          }
          if (!transformedData[person as Person]![day]) {
            transformedData[person as Person]![day] = {};
          }
          transformedData[person as Person]![day][time_slot] = status as SlotStatus;
        });

        setCalendarData(transformedData);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les données du calendrier",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarData();
  }, []);

  // Update Supabase when calendarData changes
  const updateDatabaseEntry = async (person: Person, day: string, timeSlot: string, status: SlotStatus) => {
    try {
      const { error } = await supabase
        .from('calendar_data')
        .upsert(
          { person, day, time_slot: timeSlot, status },
          { onConflict: 'person,day,time_slot' }
        );
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating calendar data:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder les modifications",
        variant: "destructive"
      });
    }
  };

  return (
    <CalendarContext.Provider value={{ 
      selectedPerson, 
      setSelectedPerson, 
      calendarData, 
      setCalendarData: (newData) => {
        // If it's a function, execute it to get the new state
        if (typeof newData === 'function') {
          const updatedData = newData(calendarData);
          
          // Find the differences and update Supabase
          Object.entries(updatedData).forEach(([person, personData]) => {
            if (person === '') return; // Skip empty person
            
            Object.entries(personData).forEach(([day, dayData]) => {
              Object.entries(dayData).forEach(([timeSlot, status]) => {
                const oldStatus = calendarData[person as Person]?.[day]?.[timeSlot];
                
                if (oldStatus !== status) {
                  // Only update if the status has changed
                  updateDatabaseEntry(person as Person, day, timeSlot, status);
                }
              });
            });
          });
          
          setCalendarData(updatedData);
        } else {
          setCalendarData(newData);
        }
      },
      isLoading
    }}>
      {children}
    </CalendarContext.Provider>
  );
};
