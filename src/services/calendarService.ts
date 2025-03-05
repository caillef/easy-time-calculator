
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarData } from "@/types/calendar";
import { transformDatabaseData, getWeekId } from "@/utils/calendarUtils";
import { addWeeks, format, parseISO } from 'date-fns';
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
    console.log(`Applying recurring status: ${person}, ${day}, ${timeSlot}, ${status}`);
    
    // Parse the starting week ID to get year and week number
    const [yearStr, weekStr] = startWeekId.split('-');
    const year = parseInt(yearStr);
    const week = parseInt(weekStr);
    
    // Create a date for the current week (approximate)
    // This is just to have a base date, we'll calculate actual weeks from this
    const currentDate = new Date();
    currentDate.setFullYear(year);
    
    // Create updates batch for future weeks
    const updates = [];
    
    // Start with the current week
    updates.push({
      week_id: startWeekId,
      person,
      day,
      time_slot: timeSlot,
      status
    });
    
    // Add future weeks
    for (let i = 1; i <= weeksToApply; i++) {
      // Calculate the date for the future week
      const futureDate = addWeeks(currentDate, i);
      const futureWeekId = getWeekId(futureDate);
      
      // Add to batch updates - make sure we're not adding duplicates
      if (futureWeekId !== startWeekId) {
        updates.push({
          week_id: futureWeekId,
          person,
          day,
          time_slot: timeSlot,
          status
        });
      }
    }
    
    console.log(`Generated ${updates.length} recurring updates`);
    
    // Process each update individually instead of batching them
    // This avoids the "ON CONFLICT DO UPDATE command cannot affect row a second time" error
    for (const update of updates) {
      const { error } = await supabase
        .from('calendar_data')
        .upsert(
          update,
          { onConflict: 'week_id,person,day,time_slot' }
        );
      
      if (error) {
        console.error('Error updating entry', update, error);
        // Continue with other updates even if one fails
      }
    }
    
    toast({
      title: "Récurrence activée",
      description: `Ce statut sera appliqué à toutes les semaines futures (${day}, ${timeSlot})`,
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
