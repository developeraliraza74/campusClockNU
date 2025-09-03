"use client";

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Schedule, Class, DayOfWeek } from '@/lib/types';
import { ALL_DAYS } from '@/lib/types';
import { convertTo24Hour } from '@/lib/utils';
import { add, parse, differenceInMinutes, format } from 'date-fns';

const SCHEDULE_STORAGE_KEY = 'chronosage-schedule';

function useScheduleStore() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [schedule, setSchedule] = useState<Schedule>(() => {
    const emptySchedule: Schedule = {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [],
    };
    return emptySchedule;
  });

  const processSchedule = (newSchedule: Schedule): Schedule => {
    for (const day of ALL_DAYS) {
      const daySchedule = newSchedule[day] || [];
      daySchedule.sort((a, b) => a.startTime.localeCompare(b.startTime));

      const processedDay: Class[] = [];
      let lastClassEndTime: Date | null = null;

      for (let i = 0; i < daySchedule.length; i++) {
        const currentClass = daySchedule[i];
        if (currentClass.isFreePeriod) continue; // Skip already processed free periods

        const currentStartTime = parse(currentClass.startTime, 'HH:mm', new Date());

        // Add free period if there's a gap
        if (lastClassEndTime && differenceInMinutes(currentStartTime, lastClassEndTime) > 15) {
          const freePeriodDuration = differenceInMinutes(currentStartTime, lastClassEndTime);
          processedDay.push({
            id: `free-${day}-${format(lastClassEndTime, 'HH:mm')}`,
            subject: 'Free Period',
            roomNumber: '',
            startTime: format(lastClassEndTime, 'HH:mm'),
            duration: `${freePeriodDuration} minutes`,
            dayOfWeek: day,
            isFreePeriod: true,
            alarmEnabled: false,
            isConsecutive: false,
          });
        }
        
        // Add current class
        processedDay.push(currentClass);
        
        // Update last class end time
        lastClassEndTime = add(currentStartTime, { minutes: parseInt(currentClass.duration.split(' ')[0]) || 50 });
      }

      // Consectutive logic
      for (let i = 0; i < processedDay.length - 1; i++) {
        try {
          const currentClass = processedDay[i];
          const nextClass = processedDay[i+1];

          if(currentClass.isFreePeriod || nextClass.isFreePeriod) {
            currentClass.isConsecutive = false;
            continue;
          };

          const currentEndTime = add(parse(currentClass.startTime, 'HH:mm', new Date()), { minutes: parseInt(currentClass.duration.split(' ')[0]) || 50 });
          const nextStartTime = parse(nextClass.startTime, 'HH:mm', new Date());
          const diff = differenceInMinutes(nextStartTime, currentEndTime);
          if (diff >= 0 && diff <= 10) {
            processedDay[i].isConsecutive = true;
          } else {
            processedDay[i].isConsecutive = false;
          }
        } catch (e) {
          console.error("Error calculating consecutive classes", e);
        }
      }
      if(processedDay.length > 0 && !processedDay[processedDay.length-1].isFreePeriod) {
        processedDay[processedDay.length-1].isConsecutive = false;
      }


      newSchedule[day] = processedDay;
    }
    return newSchedule;
  }

  useEffect(() => {
    const emptySchedule: Schedule = {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [],
    };
    try {
      const storedSchedule = localStorage.getItem(SCHEDULE_STORAGE_KEY);
      if (storedSchedule) {
        const parsed = JSON.parse(storedSchedule);
        ALL_DAYS.forEach(day => {
          if (!parsed[day]) parsed[day] = [];
        });
        setSchedule(processSchedule(parsed));
      }
    } catch (error) {
      console.error("Failed to parse schedule from localStorage", error);
      setSchedule(emptySchedule);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
      } catch (error) {
        console.error("Failed to save schedule to localStorage", error);
      }
    }
  }, [schedule, isLoaded]);

  const setFullSchedule = useCallback((newClasses: Omit<Class, 'id' | 'alarmEnabled' | 'isConsecutive'>[]) => {
    let newSchedule: Schedule = {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [],
    };
    
    newClasses.forEach(c => {
      const day = c.dayOfWeek as DayOfWeek;
      if (newSchedule[day] && c.startTime) {
        newSchedule[day].push({
          ...c,
          id: `${day}-${c.startTime}-${c.subject}-${Math.random()}`,
          startTime: convertTo24Hour(c.startTime),
          alarmEnabled: true,
          isConsecutive: false,
        });
      }
    });

    setSchedule(processSchedule(newSchedule));
  }, []);

  const updateClass = useCallback((updatedClass: Class) => {
    setSchedule(prevSchedule => {
      let daySchedule = prevSchedule[updatedClass.dayOfWeek].map(c => 
        c.id === updatedClass.id ? updatedClass : c
      );

      // If day changed, remove from old day
      if (updatedClass.dayOfWeek !== Object.entries(prevSchedule).find(([,classes]) => classes.some(c => c.id === updatedClass.id))?.[0]) {
         for(const day of ALL_DAYS) {
           if(day !== updatedClass.dayOfWeek) {
             prevSchedule[day] = prevSchedule[day].filter(c => c.id !== updatedClass.id);
           }
         }
      }
      
      const newSchedule = { ...prevSchedule, [updatedClass.dayOfWeek]: daySchedule };
      return processSchedule(newSchedule);
    });
  }, []);

  const deleteClass = useCallback((classId: string, day: DayOfWeek) => {
    setSchedule(prevSchedule => {
      const newDaySchedule = prevSchedule[day].filter(c => c.id !== classId);
      const newSchedule = { ...prevSchedule, [day]: newDaySchedule };
      return processSchedule(newSchedule);
    });
  }, []);
  
  const clearSchedule = useCallback(() => {
     const emptySchedule: Schedule = {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [],
    };
    setSchedule(emptySchedule);
  }, []);

  return { schedule, isLoaded, setFullSchedule, updateClass, deleteClass, clearSchedule };
}

type ScheduleContextType = ReturnType<typeof useScheduleStore> | undefined;

export const ScheduleContext = createContext<ScheduleContextType>(undefined);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const scheduleData = useScheduleStore();
  return (
    <ScheduleContext.Provider value={scheduleData}>
      {children}
    </ScheduleContext.Provider>
  );
}
