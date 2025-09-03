
"use client";
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSchedule } from '@/hooks/use-schedule';
import { reasoningAlarmScheduler } from '@/ai/flows/reasoning-alarm-scheduler';
import { consecutiveClassNotification } from '@/ai/flows/consecutive-class-notifications';
import { useToast } from '@/hooks/use-toast';
import FullScreenReminder from './full-screen-reminder';
import type { Class, Schedule, DayOfWeek } from '@/lib/types';
import { parse, differenceInMinutes, format, getDay, isValid, isSameMinute, addMinutes, subMinutes } from 'date-fns';
import { convertTo24Hour } from '@/lib/utils';


type ActiveReminder = {
  type: 'alarm' | 'consecutive';
  classInfo: Class;
  message: string;
};

export default function AlarmManager() {
  const { schedule, isLoaded } = useSchedule();
  const [activeReminder, setActiveReminder] = useState<ActiveReminder | null>(null);
  const { toast } = useToast();
  // Using a ref to track which alarms have already been triggered for a given class today
  // to prevent duplicate notifications. The key is class ID, value is the date it was triggered.
  const triggeredAlarms = useRef<Map<string, Date>>(new Map());

  const getTodayClasses = useCallback(() => {
    const now = new Date();
    const dayIndex = getDay(now);
    const dayOfWeek: DayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex];
    return schedule[dayOfWeek] || [];
  }, [schedule]);

  // Function to clear expired alarm triggers from our ref
  const clearExpiredTriggers = useCallback(() => {
    const now = new Date();
    for (const [classId, triggerDate] of triggeredAlarms.current.entries()) {
      // If the trigger date is not today, remove it.
      if (triggerDate.getDate() !== now.getDate()) {
        triggeredAlarms.current.delete(classId);
      }
    }
  }, []);

  const checkAlarms = useCallback(async (currentTime: Date) => {
    if (activeReminder) return; // Don't check if a reminder is already active

    clearExpiredTriggers();

    const todayClasses = getTodayClasses();

    for (const [index, classInfo] of todayClasses.entries()) {
      if (classInfo.isFreePeriod || !classInfo.alarmEnabled) continue;
      
      const wasTriggeredToday = triggeredAlarms.current.has(classInfo.id);
      if (wasTriggeredToday) continue;

      try {
        // --- Standard Alarm Logic ---
        const startTime24 = convertTo24Hour(classInfo.startTime);
        if (!startTime24) continue;
        
        const classStartTime = parse(startTime24, 'HH:mm', currentTime);
        if (!isValid(classStartTime)) continue;
        
        const alarmTime = subMinutes(classStartTime, 10);
        
        if (isSameMinute(currentTime, alarmTime)) {
          const result = await reasoningAlarmScheduler({
            className: classInfo.subject,
            roomNumber: classInfo.roomNumber,
            startTime: startTime24,
            currentTime: format(currentTime, 'HH:mm'),
          });
          if (result.shouldSetAlarm && result.alarmTime) {
            setActiveReminder({ type: 'alarm', classInfo, message: result.reason });
            triggeredAlarms.current.set(classInfo.id, new Date());
            return; // Show first alarm and stop checking
          }
        }
        
        // --- Consecutive Class Logic ---
        const nextClass = todayClasses.find((c, i) => i > index && !c.isFreePeriod);
        if (classInfo.isConsecutive && nextClass) {
          const endTime24 = convertTo24Hour(classInfo.endTime);
          if(!endTime24) continue;
          
          const classEndTime = parse(endTime24, 'HH:mm', currentTime);
          if(!isValid(classEndTime)) continue;

          // Trigger reminder 2 minutes before the end of the current class
          const reminderTime = subMinutes(classEndTime, 2);

          if (isSameMinute(currentTime, reminderTime)) {
            const result = await consecutiveClassNotification({
                isConsecutive: true,
                currentClass: { subject: classInfo.subject, room: classInfo.roomNumber, endTime: classInfo.endTime },
                nextClass: { subject: nextClass.subject, room: nextClass.roomNumber, startTime: nextClass.startTime, endTime: nextClass.endTime },
            });

            if (result.notificationType === 'soft_notification') {
                toast({ title: 'Next Class', description: result.message });
            } else if (result.notificationType === 'full_screen_reminder') {
                setActiveReminder({ type: 'consecutive', classInfo: nextClass, message: result.message });
                triggeredAlarms.current.set(classInfo.id, new Date()); // Mark current class alarm as triggered
                return;
            }
          }
        }
      } catch (e) {
        console.error("Error during alarm check for class:", classInfo.subject, e);
        toast({ title: 'AI Error', description: 'Could not process an alarm.', variant: 'destructive'});
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeReminder, getTodayClasses, toast, clearExpiredTriggers]);

  useEffect(() => {
    if (!isLoaded) return;

    // Run once on load
    checkAlarms(new Date());

    // Set up the interval to run every minute
    const timer = setInterval(() => {
      checkAlarms(new Date());
    }, 60000); 

    return () => clearInterval(timer);
  }, [isLoaded, checkAlarms]);

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
