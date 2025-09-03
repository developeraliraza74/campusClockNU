"use client";

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Schedule, Class, DayOfWeek } from '@/lib/types';
import { ALL_DAYS } from '@/lib/types';
import { convertTo24Hour } from '@/lib/utils';
import { add, parse, differenceInMinutes } from 'date-fns';

const SCHEDULE_STORAGE_KEY = 'chronosage-schedule';

function useScheduleStore() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [schedule, setSchedule] = useState<Schedule>(() => {
    const emptySchedule: Schedule = {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [],
    };
    return emptySchedule;
  });

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
        setSchedule(parsed);
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
    const newSchedule: Schedule = {
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

    for (const day of ALL_DAYS) {
      newSchedule[day].sort((a, b) => a.startTime.localeCompare(b.startTime));

      for (let i = 0; i < newSchedule[day].length - 1; i++) {
        try {
          const currentClass = newSchedule[day][i];
          const nextClass = newSchedule[day][i+1];
          const currentEndTime = add(parse(currentClass.startTime, 'HH:mm', new Date()), { minutes: parseInt(currentClass.duration.split(' ')[0]) || 50 });
          const nextStartTime = parse(nextClass.startTime, 'HH:mm', new Date());
          const diff = differenceInMinutes(nextStartTime, currentEndTime);
          if (diff >= 0 && diff <= 10) {
            newSchedule[day][i].isConsecutive = true;
          }
        } catch (e) {
          console.error("Error calculating consecutive classes", e);
        }
      }
    }
    setSchedule(newSchedule);
  }, []);

  const updateClass = useCallback((updatedClass: Class) => {
    setSchedule(prevSchedule => {
      const day = updatedClass.dayOfWeek;
      const newDaySchedule = prevSchedule[day].map(c => 
        c.id === updatedClass.id ? updatedClass : c
      ).sort((a, b) => a.startTime.localeCompare(b.startTime));
      return { ...prevSchedule, [day]: newDaySchedule };
    });
  }, []);

  const deleteClass = useCallback((classId: string, day: DayOfWeek) => {
    setSchedule(prevSchedule => {
      const newDaySchedule = prevSchedule[day].filter(c => c.id !== classId);
      return { ...prevSchedule, [day]: newDaySchedule };
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
