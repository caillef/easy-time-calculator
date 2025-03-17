
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarData } from "@/types/calendar";
import { transformDatabaseData, getWeekId } from "@/utils/calendarUtils";
import { addWeeks, format, parseISO } from 'date-fns';
import { SlotStatus } from "@/components/TimeSlot";

export const fetchCalendarData = async (): Promise<CalendarData | null> => {
  try {
    // Fetch calendar data without any limits
    const { data, error } = await supabase
      .from('calendar_data')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching calendar data:', error);
      throw error;
    }

    console.log(`Fetched ${data?.length || 0} calendar records from database`);
    
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
  weeksToApply: number = 0 // Set to 0 to automatically calculate remaining weeks in current year
): Promise<boolean> => {
  try {
    console.log(`Applying recurring status: ${person}, ${day}, ${timeSlot}, ${status}`);
    
    // Parse the starting week ID to get year and week number
    const [yearStr, weekStr] = startWeekId.split('-');
    const year = parseInt(yearStr);
    const week = parseInt(weekStr);
    
    // Create a date for the current week (approximate)
    const currentDate = new Date();
    currentDate.setFullYear(year);
    
    // If weeksToApply is 0, calculate remaining weeks in the current year
    if (weeksToApply === 0) {
      // We're limiting to the current year, so calculate how many weeks are left in the year
      const currentYear = year;
      const lastWeekOfYear = 52; // Approximate number of weeks in a year
      
      // Calculate remaining weeks in the year
      weeksToApply = lastWeekOfYear - week;
      console.log(`Auto-calculated ${weeksToApply} remaining weeks in year ${currentYear}`);
    }
    
    // Generate list of all future week IDs including current week
    const futureWeekIds = [];
    futureWeekIds.push(startWeekId);
    
    // Add future week IDs
    for (let i = 1; i <= weeksToApply; i++) {
      const futureDate = addWeeks(currentDate, i);
      const futureWeekId = getWeekId(futureDate);
      if (futureWeekId !== startWeekId) {
        futureWeekIds.push(futureWeekId);
      }
    }
    
    console.log(`Processing recurring update for ${futureWeekIds.length} weeks`);
    
    // Delete all future entries for this timeslot to clean up previous recursions
    for (const weekId of futureWeekIds) {
      await supabase
        .from('calendar_data')
        .delete()
        .match({
          week_id: weekId,
          person,
          day,
          time_slot: timeSlot
        });
    }
    
    // If the status is 'neutral', we don't need to insert anything
    // This effectively resets the status to neutral for all weeks by removing entries
    if (status === 'neutral') {
      console.log(`Reset ${futureWeekIds.length} weeks to neutral by removing all entries`);
      toast({
        title: "Récurrence réinitialisée",
        description: `Tous les créneaux futurs pour ${day} à ${timeSlot} ont été réinitialisés`,
      });
      return true;
    }
    
    // For non-neutral statuses, create and insert new entries for all future weeks
    const updates = [];
    
    for (const weekId of futureWeekIds) {
      updates.push({
        week_id: weekId,
        person,
        day,
        time_slot: timeSlot,
        status
      });
    }
    
    console.log(`Generated ${updates.length} recurring updates with status ${status}`);
    
    // Process each insert
    let successCount = 0;
    for (const update of updates) {
      const { error } = await supabase
        .from('calendar_data')
        .insert(update);
      
      if (error) {
        console.error('Error updating entry', update, error);
      } else {
        successCount++;
      }
    }
    
    console.log(`Successfully processed ${successCount} out of ${updates.length} updates`);
    
    toast({
      title: "Récurrence appliquée",
      description: `Ce statut sera appliqué jusqu'à la fin de l'année (${day}, ${timeSlot})`,
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
