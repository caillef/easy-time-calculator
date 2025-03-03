
import { addWeeks, subWeeks, startOfWeek, endOfWeek, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarData, Person, TimeSlotData } from '@/types/calendar';
import { SlotStatus } from '@/components/TimeSlot';
import { supabase } from "@/integrations/supabase/client";

export const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// LocalStorage key for selected person
export const SELECTED_PERSON_KEY = 'goudale-calendar-selected-person';

// Function to get week ID in YYYY-WW format
export const getWeekId = (date: Date): string => {
  // Get week number and year
  const year = format(date, 'yyyy', { locale: fr });
  const week = format(date, 'ww', { locale: fr });
  return `${year}-${week}`;
};

// Calculate dates for each day of the current week
export const getWeekDates = (baseDate: Date) => {
  const start = startOfWeek(baseDate, { weekStartsOn: 1 }); // Week starts on Monday (1)
  
  return DAYS.map((day, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    return { day, date };
  });
};

// Format the week range for display
export const formatWeekRange = (currentWeek: Date): string => {
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  
  // If same month, show "1-7 January 2024"
  if (format(weekStart, 'MMMM', { locale: fr }) === format(weekEnd, 'MMMM', { locale: fr })) {
    return `${format(weekStart, 'd', { locale: fr })}-${format(weekEnd, 'd MMMM yyyy', { locale: fr })}`;
  }
  
  // If different months, show "28 January - 3 February 2024"
  return `${format(weekStart, 'd MMMM', { locale: fr })} - ${format(weekEnd, 'd MMMM yyyy', { locale: fr })}`;
};

// Initialize calendar data structure for a given week
export const initializeCalendarWeek = (weekId: string, existingData: CalendarData): CalendarData => {
  if (!existingData[weekId]) {
    return {
      ...existingData,
      [weekId]: {
        'Léo': {},
        'Hervé': {},
        'Benoit': {},
        'Corentin': {},
      }
    };
  }
  return existingData;
};

// Update database entry
export const updateDatabaseEntry = async (
  weekId: string, 
  person: Person, 
  day: string, 
  timeSlot: string, 
  status: SlotStatus
) => {
  try {
    const { error } = await supabase
      .from('calendar_data')
      .upsert(
        { week_id: weekId, person, day, time_slot: timeSlot, status },
        { onConflict: 'week_id,person,day,time_slot' }
      );
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating calendar data:', error);
    return false;
  }
};

// Transform database data to app format
export const transformDatabaseData = (data: any[]): CalendarData => {
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

  return transformedData;
};
