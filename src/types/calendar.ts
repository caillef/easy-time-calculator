
import { SlotStatus } from '@/components/TimeSlot';

export type Person = 'Léo' | 'Hervé' | 'Benoit' | 'Corentin' | '';

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

export interface CalendarContextType {
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
