
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { addWeeks, subWeeks } from 'date-fns';
import { CalendarContextType, Person, CalendarData } from '@/types/calendar';
import { SlotStatus } from '@/components/TimeSlot';
import { 
  getWeekId, 
  getWeekDates, 
  formatWeekRange as formatWeekRangeUtil, 
  SELECTED_PERSON_KEY,
  initializeCalendarWeek
} from '@/utils/calendarUtils';
import { fetchCalendarData, updateCalendarEntry } from '@/services/calendarService';
import useLocalStorage from '@/hooks/useLocalStorage';

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
  // Initialize selectedPerson from localStorage using our custom hook
  const [selectedPerson, setSelectedPerson] = useLocalStorage<Person>(SELECTED_PERSON_KEY, '');
  
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());

  const currentWeekId = getWeekId(currentWeek);
  const weekDates = getWeekDates(currentWeek);

  // Navigate to next/previous weeks
  const nextWeek = () => {
    setCurrentWeek(prevDate => addWeeks(prevDate, 1));
  };

  const prevWeek = () => {
    setCurrentWeek(prevDate => subWeeks(prevDate, 1));
  };

  // Format the week range for display
  const formatWeekRange = () => formatWeekRangeUtil(currentWeek);

  // Initialize calendar data structure if needed
  useEffect(() => {
    setCalendarData(prev => initializeCalendarWeek(currentWeekId, prev));
  }, [currentWeekId]);

  // Fetch initial data from Supabase
  useEffect(() => {
    const loadCalendarData = async () => {
      setIsLoading(true);
      const data = await fetchCalendarData();
      if (data) {
        setCalendarData(data);
      }
      setIsLoading(false);
    };

    loadCalendarData();
  }, []);

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
                    updateCalendarEntry(weekId, person, day, timeSlot, status);
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
