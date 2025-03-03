
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import TransitionWrapper from './TransitionWrapper';
import TimeSlot, { SlotStatus } from './TimeSlot';

interface CalendarProps {
  className?: string;
}

type TimeSlotData = {
  [day: string]: {
    [time: string]: SlotStatus;
  };
};

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const TIMES = [
  '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', 
  '16:00', '17:00', '18:00', '19:00', '20:00'
];

const Calendar = ({ className }: CalendarProps) => {
  const [slots, setSlots] = useState<TimeSlotData>(() => {
    const initialSlots: TimeSlotData = {};
    
    DAYS.forEach(day => {
      initialSlots[day] = {};
      TIMES.forEach(time => {
        initialSlots[day][time] = 'neutral';
      });
    });
    
    return initialSlots;
  });

  const handleSlotClick = (day: string, time: string) => {
    setSlots(prev => {
      const currentStatus = prev[day][time];
      let newStatus: SlotStatus;
      
      // Cycle through statuses: neutral -> available -> unavailable -> neutral
      if (currentStatus === 'neutral') {
        newStatus = 'available';
      } else if (currentStatus === 'available') {
        newStatus = 'unavailable';
      } else {
        newStatus = 'neutral';
      }
      
      return {
        ...prev,
        [day]: {
          ...prev[day],
          [time]: newStatus
        }
      };
    });
  };

  return (
    <TransitionWrapper delay={200} className={cn('', className)}>
      <div className="overflow-x-auto">
        <div className="calendar-grid min-w-[700px] glass rounded-xl p-4">
          {/* Header row with day names */}
          <div className="col-start-1"></div>
          {DAYS.map((day, index) => (
            <TimeSlot 
              key={day} 
              day={day} 
              time="" 
              status="neutral" 
              isHeader={true} 
            />
          ))}
          
          {/* Time slots */}
          {TIMES.map((time, timeIndex) => (
            <React.Fragment key={time}>
              <TimeSlot
                day=""
                time={time}
                status="neutral"
                isTimeLabel={true}
              />
              
              {DAYS.map((day, dayIndex) => (
                <TimeSlot
                  key={`${day}-${time}`}
                  day={day}
                  time={time}
                  status={slots[day][time]}
                  onClick={() => handleSlotClick(day, time)}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </TransitionWrapper>
  );
};

export default Calendar;
