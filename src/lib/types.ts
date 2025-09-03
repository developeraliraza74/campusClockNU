export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const ALL_DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export interface Class {
  id: string;
  subject: string;
  roomNumber: string;
  duration: string;
  startTime: string; // "HH:MM" 24-hour format
  dayOfWeek: DayOfWeek;
  alarmEnabled: boolean;
  isConsecutive: boolean;
  isFreePeriod?: boolean;
}

export type Schedule = Record<DayOfWeek, Class[]>;
