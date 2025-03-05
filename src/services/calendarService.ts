
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarData } from "@/types/calendar";
import { transformDatabaseData, getWeekId } from "@/utils/calendarUtils";
import { addWeeks, format } from 'date-fns';
import { SlotStatus } from "@/components/TimeSlot";

export const fetchCalendarData = async (): Promise<CalendarData | null> => {
  try {
    const { data, error } = await supabase
      .from('calendar_data')
      .select('*');
    
    if (error) {
      throw error;
    }

    // Transform the data from the database into our app's format
    const transformedData = transformDatabaseData(data);

    // Make sure current week exists in data structure
    const currentWeekId = getWeekId(new Date());
    if (!transformedData[currentWeekId]) {
      transformedData[currentWeekId] = {
        'Léo': {},
        'Hervé': {},
        'Benoit': {},
        'Corentin': {},
      };
    }

    return transformedData;
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    toast({
      title: "Erreur de chargement",
      description: "Impossible de charger les données du calendrier",
      variant: "destructive"
    });
    return null;
  }
};

export const updateCalendarEntry = async (
  weekId: string, 
  person: string, 
  day: string, 
  timeSlot: string, 
  status: string
): Promise<boolean> => {
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
    toast({
      title: "Erreur de sauvegarde",
      description: "Impossible de sauvegarder les modifications",
      variant: "destructive"
    });
    return false;
  }
};

export const applyRecurringStatus = async (
  startWeekId: string,
  person: string,
  day: string,
  timeSlot: string,
  status: SlotStatus,
  weeksToApply: number = 52 // Default to 1 year of future weeks
): Promise<boolean> => {
  try {
    // Parse the starting week ID to get year and week number
    const [yearStr, weekStr] = startWeekId.split('-');
    let year = parseInt(yearStr);
    let week = parseInt(weekStr);
    
    // Create a date for the current week
    let currentWeekDate = new Date();
    
    // Create updates batch for future weeks
    const updates = [];
    
    for (let i = 0; i < weeksToApply; i++) {
      // Calculate the date for the next week
      const futureDate = addWeeks(currentWeekDate, i);
      const futureWeekId = getWeekId(futureDate);
      
      // Add to batch updates
      updates.push({
        week_id: futureWeekId,
        person,
        day,
        time_slot: timeSlot,
        status
      });
    }
    
    // Batch upsert all future entries
    const { error } = await supabase
      .from('calendar_data')
      .upsert(
        updates,
        { onConflict: 'week_id,person,day,time_slot' }
      );
    
    if (error) throw error;
    
    toast({
      title: "Récurrence activée",
      description: "Ce statut sera appliqué aux semaines futures",
    });
    
    return true;
  } catch (error) {
    console.error('Error applying recurring status:', error);
    toast({
      title: "Erreur de récurrence",
      description: "Impossible d'appliquer la récurrence",
      variant: "destructive"
    });
    return false;
  }
};
