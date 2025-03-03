
import { useMemo } from 'react';
import { SlotStatus } from '@/components/TimeSlot';
import { Person, CalendarData } from '@/types/calendar';

export function useMergedAvailability(
  calendarData: CalendarData,
  currentWeekId: string,
  weekDates: { day: string; date: Date }[]
) {
  const mergedAvailability = useMemo(() => {
    if (!calendarData[currentWeekId]) return {};

    const timeSlots = [
      '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
      '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
      '21:00', '22:00', '23:00'
    ];
    const days = weekDates.map(date => date.day);
    const persons: Person[] = ['Léo', 'Hervé', 'Benoit', 'Corentin'];
    
    const result: Record<string, Record<string, Record<SlotStatus, Person[]>>> = {};
    
    days.forEach(day => {
      result[day] = {};
      
      timeSlots.forEach(timeSlot => {
        result[day][timeSlot] = {
          'available': [],
          'unavailable': [],
          'neutral': []
        };
        
        persons.forEach(person => {
          const status = calendarData[currentWeekId]?.[person]?.[day]?.[timeSlot];
          if (status) {
            result[day][timeSlot][status].push(person);
          } else {
            // If no status is set, consider it as neutral
            result[day][timeSlot]['neutral'].push(person);
          }
        });
      });
    });
    
    return result;
  }, [calendarData, currentWeekId, weekDates]);

  return mergedAvailability;
}
