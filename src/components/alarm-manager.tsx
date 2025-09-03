
"use client";
import { useEffect, useState } from 'react';
import { useSchedule } from '@/hooks/use-schedule';
import { reasoningAlarmScheduler } from '@/ai/flows/reasoning-alarm-scheduler';
import { consecutiveClassNotification } from '@/ai/flows/consecutive-class-notifications';
import { useToast } from '@/hooks/use-toast';
import FullScreenReminder from './full-screen-reminder';
import type { Class, Schedule } from '@/lib/types';
import { parse, differenceInMinutes, add, format, getDay, isValid } from 'date-fns';
import { convertTo24Hour } from '@/lib/utils';


type ActiveReminder = {
  type: 'alarm' | 'consecutive';
  classInfo: Class;
  message: string;
};

export default function AlarmManager() {
  const { schedule } = useSchedule();
  const [activeReminder, setActiveReminder] = useState<ActiveReminder | null>(null);
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Check every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkAlarms = async () => {
      if (!currentTime || activeReminder) return; // Don't check if a reminder is already active

      const dayIndex = getDay(currentTime);
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex];
      const todayClasses = schedule[dayOfWeek as keyof Schedule] || [];

      for (const [index, classInfo] of todayClasses.entries()) {
        if (classInfo.isFreePeriod || !classInfo.alarmEnabled) continue;
        
        try {
          const startTime24 = convertTo24Hour(classInfo.startTime);
          if(!startTime24) continue;
          
          const classStartTime = parse(startTime24, 'HH:mm', currentTime);

          if(!isValid(classStartTime)) continue;

          // Standard alarm logic (11 to 10 minutes before)
          const minutesToClass = differenceInMinutes(classStartTime, currentTime);
          if (minutesToClass >= 10 && minutesToClass < 11) {
             const result = await reasoningAlarmScheduler({
              className: classInfo.subject,
              roomNumber: classInfo.roomNumber,
              startTime: startTime24,
              currentTime: format(currentTime, 'HH:mm'),
            });
            if (result.shouldSetAlarm && result.alarmTime) {
              setActiveReminder({ type: 'alarm', classInfo, message: result.reason });
              break; // Show first alarm and stop checking
            }
          }
          
          // Consecutive class logic (2 minutes before end time of a consecutive class)
          if (classInfo.isConsecutive) {
            const endTime24 = convertTo24Hour(classInfo.endTime);
            if(!endTime24) continue;
            
            const classEndTime = parse(endTime24, 'HH:mm', currentTime);
            if(!isValid(classEndTime)) continue;

            const minutesFromEnd = differenceInMinutes(currentTime, classEndTime);
            
            if (minutesFromEnd >= -2 && minutesFromEnd <= 0) {
              const nextClass = todayClasses.find((c, i) => i > index && !c.isFreePeriod);
              if (nextClass) {
                const nextStartTime = parse(nextClass.startTime, 'p', new Date());
                const currentParsedEndTime = parse(classInfo.endTime, 'p', new Date());

                if(isValid(nextStartTime) && isValid(currentParsedEndTime)){
                  const result = await consecutiveClassNotification({
                    isConsecutive: true,
                    currentClass: { subject: classInfo.subject, room: classInfo.roomNumber, endTime: format(currentParsedEndTime, 'p') },
                    nextClass: { subject: nextClass.subject, room: nextClass.roomNumber, startTime: format(nextStartTime, 'p'), endTime: '' },
                  });

                  if (result.notificationType === 'soft_notification') {
                    toast({ title: 'Next Class', description: result.message });
                  } else if (result.notificationType === 'full_screen_reminder') {
                    setActiveReminder({ type: 'consecutive', classInfo: nextClass, message: result.message });
                    break; // Show reminder and stop
                  }
                }
              }
            }
          }
        } catch (e) {
          console.error("Error during alarm check:", e);
          toast({ title: 'AI Error', description: 'Could not process an alarm.', variant: 'destructive'});
        }
      }
    };
    
    checkAlarms();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime, schedule]);

  return (
    <>
      {activeReminder && (
        <FullScreenReminder
          reminder={activeReminder}
          onDismiss={() => setActiveReminder(null)}
        />
      )}
    </>
  );
}
