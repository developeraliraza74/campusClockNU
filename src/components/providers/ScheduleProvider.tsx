
"use client";

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Schedule, Class, DayOfWeek } from '@/lib/types';
import { ALL_DAYS } from '@/lib/types';
import { convertTo24Hour, formatDuration, formatTo12Hour } from '@/lib/utils';
import { add, parse, differenceInMinutes, format, isValid, setHours, setMinutes } from 'date-fns';

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
      let daySchedule = (newSchedule[day] || [])
        .map(c => ({...c, startTime24: convertTo24Hour(c.startTime) }))
        .filter(c => c.startTime24) // Filter out classes with invalid start times
        .sort((a, b) => a.startTime24!.localeCompare(b.startTime24!));

      const processedDay: Class[] = [];
      let lastClassEndTime: Date | null = null;
      const today = new Date();

      for (let i = 0; i < daySchedule.length; i++) {
        const currentClass = daySchedule[i];
        if (currentClass.isFreePeriod) continue; 

        const [hours, minutes] = currentClass.startTime24!.split(':').map(Number);
        const currentStartTime = setMinutes(setHours(today, hours), minutes);

        if (!isValid(currentStartTime)) continue;

        // Add free period if there's a gap
        if (lastClassEndTime && differenceInMinutes(currentStartTime, lastClassEndTime) > 15) {
          const freePeriodStart = lastClassEndTime;
          const freePeriodEnd = currentStartTime;
          const freePeriodDuration = differenceInMinutes(freePeriodEnd, freePeriodStart);
          processedDay.push({
            id: `free-${day}-${format(freePeriodStart, 'HH:mm')}`,
            subject: 'Free Period',
            roomNumber: '',
            startTime: formatTo12Hour(format(freePeriodStart, 'HH:mm')),
            endTime: formatTo12Hour(format(freePeriodEnd, 'HH:mm')),
            duration: formatDuration(freePeriodDuration),
            dayOfWeek: day,
            isFreePeriod: true,
            alarmEnabled: false,
            isConsecutive: false,
          });
        }
        
        // Add current class
        const { startTime24, ...classToAdd } = currentClass; // remove temporary property
        processedDay.push({
          ...classToAdd,
          startTime: formatTo12Hour(classToAdd.startTime),
          endTime: formatTo12Hour(classToAdd.endTime)
        });
        
        // Update last class end time
        const [endHours, endMinutes] = convertTo24Hour(currentClass.endTime).split(':').map(Number);
        if(!isNaN(endHours) && !isNaN(endMinutes)) {
           lastClassEndTime = setMinutes(setHours(today, endHours), endMinutes);
        } else {
            // Fallback for old duration format
            lastClassEndTime = add(currentStartTime, { minutes: parseInt(currentClass.duration.split(' ')[0]) || 50 });
        }
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

          const currentEndTime = parse(convertTo24Hour(currentClass.endTime), 'HH:mm', new Date());
          const nextStartTime = parse(convertTo24Hour(nextClass.startTime), 'HH:mm', new Date());

          if(isValid(currentEndTime) && isValid(nextStartTime)) {
            const diff = differenceInMinutes(nextStartTime, currentEndTime);
            processedDay[i].isConsecutive = (diff >= 0 && diff <= 10);
          } else {
            processedDay[i].isConsecutive = false;
          }
        } catch (e) {
          console.error("Error calculating consecutive classes", e);
          processedDay[i].isConsecutive = false;
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
      } else {
        setSchedule(emptySchedule);
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
        const startTime24 = convertTo24Hour(c.startTime);
        const [startH, startM] = startTime24.split(':').map(Number);
        
        let endTime24;
        let durationMinutes;
        
        if (c.duration && !c.endTime) { // Handle old format
          durationMinutes = parseInt(c.duration.split(' ')[0]);
          const startTimeDate = setMinutes(setHours(new Date(), startH), startM);
          const endTimeDate = add(startTimeDate, { minutes: durationMinutes });
          endTime24 = format(endTimeDate, 'HH:mm');
        } else if (c.endTime) {
            endTime24 = convertTo24Hour(c.endTime)
        } else {
            return; // Skip if no end time or duration
        }
        
        const [endH, endM] = endTime24.split(':').map(Number);
        if(isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return;

        durationMinutes = (endH - startH) * 60 + (endM - startM);
        if (durationMinutes < 0) durationMinutes += 24*60;


        newSchedule[day].push({
          ...c,
          id: `${day}-${c.startTime}-${c.subject}-${Math.random()}`,
          startTime: c.startTime,
          endTime: c.endTime || formatTo12Hour(endTime24),
          duration: formatDuration(durationMinutes),
          alarmEnabled: true,
          isConsecutive: false,
        });
      }
    });

    setSchedule(processSchedule(newSchedule));
  }, []);

  const updateClass = useCallback((updatedClass: Class) => {
    setSchedule(prevSchedule => {
       const startTime24 = convertTo24Hour(updatedClass.startTime);
       const endTime24 = convertTo24Hour(updatedClass.endTime);

       if(!startTime24 || !endTime24) {
         console.error("Invalid time format for update");
         return prevSchedule;
       }

       const [startH, startM] = startTime24.split(':').map(Number);
       const [endH, endM] = endTime24.split(':').map(Number);
       let durationMinutes = (endH - startH) * 60 + (endM - startM);
       if(durationMinutes < 0) durationMinutes += 24*60;

       const classWithDuration = {
         ...updatedClass,
         duration: formatDuration(durationMinutes),
       }

      const newSchedule = { ...prevSchedule };

      // Remove from old day if day changed
      for(const day of ALL_DAYS) {
        newSchedule[day] = newSchedule[day].filter(c => c.id !== updatedClass.id);
      }
      
      // Add to new day
      newSchedule[updatedClass.dayOfWeek] = [...newSchedule[updatedClass.dayOfWeek], classWithDuration];
      
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
