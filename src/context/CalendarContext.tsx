
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { SlotStatus } from '@/components/TimeSlot';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { addWeeks, subWeeks, startOfWeek, endOfWeek, format } from 'date-fns';
import { fr } from 'date-fns/locale';

type Person = 'Léo' | 'Hervé' | 'Benoit' | 'Corentin' | '';

export type TimeSlotData = {
  [day: string]: {
    [time: string]: SlotStatus;
  };
};

export type CalendarData = {
  [weekId: string]: {
    [person in Exclude<Person, ''>]?: TimeSlotData;
  };
};

interface CalendarContextType {
  selectedPerson: Person;
  setSelectedPerson: (person: Person) => void;
  calendarData: CalendarData;
  setCalendarData: React.Dispatch<React.SetStateAction<CalendarData>>;
  isLoading: boolean;
  currentWeek: Date;
  nextWeek: () => void;
  prevWeek: () => void;
  weekDates: { day: string; date: Date }[];
  formatWeekRange: () => string;
  currentWeekId: string;
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

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// LocalStorage key for selected person
const SELECTED_PERSON_KEY = 'goudale-calendar-selected-person';

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  // Initialize selectedPerson from localStorage if available
  const [selectedPerson, setSelectedPerson] = useState<Person>(() => {
    const storedPerson = localStorage.getItem(SELECTED_PERSON_KEY);
    return (storedPerson as Person) || '';
  });
  
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());

  // Save selectedPerson to localStorage whenever it changes
  useEffect(() => {
    if (selectedPerson) {
      localStorage.setItem(SELECTED_PERSON_KEY, selectedPerson);
    } else {
      localStorage.removeItem(SELECTED_PERSON_KEY);
    }
  }, [selectedPerson]);

  // Function to get week ID in YYYY-WW format
  const getWeekId = (date: Date) => {
    // Get week number and year
    const year = format(date, 'yyyy', { locale: fr });
    const week = format(date, 'ww', { locale: fr });
    return `${year}-${week}`;
  };

  const currentWeekId = getWeekId(currentWeek);

  // Calculate dates for each day of the current week
  const getWeekDates = (baseDate: Date) => {
    const start = startOfWeek(baseDate, { weekStartsOn: 1 }); // Week starts on Monday (1)
    
    return DAYS.map((day, index) => {
      const date = new Date(start);
      date.setDate(date.getDate() + index);
      return { day, date };
    });
  };

  const weekDates = getWeekDates(currentWeek);

  // Navigate to next/previous weeks
  const nextWeek = () => {
    setCurrentWeek(prevDate => {
      const newDate = addWeeks(prevDate, 1);
      return newDate;
    });
  };

  const prevWeek = () => {
    setCurrentWeek(prevDate => {
      const newDate = subWeeks(prevDate, 1);
      return newDate;
    });
  };

  // Format the week range for display
  const formatWeekRange = () => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
    
    // If same month, show "1-7 January 2024"
    if (format(weekStart, 'MMMM', { locale: fr }) === format(weekEnd, 'MMMM', { locale: fr })) {
      return `${format(weekStart, 'd', { locale: fr })}-${format(weekEnd, 'd MMMM yyyy', { locale: fr })}`;
    }
    
    // If different months, show "28 January - 3 February 2024"
    return `${format(weekStart, 'd MMMM', { locale: fr })} - ${format(weekEnd, 'd MMMM yyyy', { locale: fr })}`;
  };

  // Initialize calendar data structure if needed
  useEffect(() => {
    if (!calendarData[currentWeekId]) {
      setCalendarData(prev => ({
        ...prev,
        [currentWeekId]: {
          'Léo': {},
          'Hervé': {},
          'Benoit': {},
          'Corentin': {},
        }
      }));
    }
  }, [currentWeekId, calendarData]);

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
        const transformedData: CalendarData = {};

        data.forEach(entry => {
          const { person, day, time_slot, status, week_id } = entry;
          
          // Initialize nested objects if they don't exist
          if (!transformedData[week_id]) {
            transformedData[week_id] = {};
          }
          if (!transformedData[week_id][person as Person]) {
            transformedData[week_id][person as Person] = {};
          }
          if (!transformedData[week_id][person as Person]![day]) {
            transformedData[week_id][person as Person]![day] = {};
          }
          
          transformedData[week_id][person as Person]![day][time_slot] = status as SlotStatus;
        });

        // Make sure current week exists in data structure
        if (!transformedData[currentWeekId]) {
          transformedData[currentWeekId] = {
            'Léo': {},
            'Hervé': {},
            'Benoit': {},
            'Corentin': {},
          };
        }

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
  const updateDatabaseEntry = async (weekId: string, person: Person, day: string, timeSlot: string, status: SlotStatus) => {
    try {
      const { error } = await supabase
        .from('calendar_data')
        .upsert(
          { week_id: weekId, person, day, time_slot: timeSlot, status },
          { onConflict: 'week_id,person,day,time_slot' }
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
      currentWeek,
      nextWeek,
      prevWeek,
      weekDates,
      formatWeekRange,
      currentWeekId,
      setCalendarData: (newData) => {
        // If it's a function, execute it to get the new state
        if (typeof newData === 'function') {
          const updatedData = newData(calendarData);
          
          // Find the differences and update Supabase
          Object.entries(updatedData).forEach(([weekId, weekData]) => {
            Object.entries(weekData).forEach(([person, personData]) => {
              if (person === '') return; // Skip empty person
              
              Object.entries(personData).forEach(([day, dayData]) => {
                Object.entries(dayData).forEach(([timeSlot, status]) => {
                  const oldStatus = calendarData[weekId]?.[person as Person]?.[day]?.[timeSlot];
                  
                  if (oldStatus !== status) {
                    // Only update if the status has changed
                    updateDatabaseEntry(weekId, person as Person, day, timeSlot, status);
                  }
                });
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
