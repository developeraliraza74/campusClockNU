
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const ALL_DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export interface Class {
  id: string;
  subject: string;
  roomNumber: string;
  duration: string; // e.g., "1h 30m" or "50m"
  startTime: string; // "9:00 AM" 12-hour format
  endTime: string; // "10:30 AM" 12-hour format
  dayOfWeek: DayOfWeek;
  alarmEnabled: boolean;
  isConsecutive: boolean;
  isFreePeriod?: boolean;
}

export type Schedule = Record<DayOfWeek, Class[]>;
