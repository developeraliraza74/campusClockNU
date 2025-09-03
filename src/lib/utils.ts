import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Schedule } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hasSchedule(schedule: Schedule): boolean {
  if (!schedule) return false;
  return Object.values(schedule).some(day => Array.isArray(day) && day.length > 0);
}

export function convertTo24Hour(time12h: string): string {
  if (!time12h || !time12h.includes(' ')) {
    const parts = time12h.split(':');
    if (parts.length === 2 && !isNaN(parseInt(parts[0])) && !isNaN(parseInt(parts[1]))) {
      return `${parts[0].padStart(2, '0')}:${parts[1]}`;
    }
    return '00:00';
  }
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');

  if (!hours || !minutes) return '00:00';

  if (hours === '12') {
    hours = '00';
  }

  if (modifier && modifier.toUpperCase() === 'PM') {
    hours = (parseInt(hours, 10) + 12).toString();
  }

  return `${hours.padStart(2, '0')}:${minutes}`;
}
