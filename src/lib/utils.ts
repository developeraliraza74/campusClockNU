
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Schedule } from "./types";
import { parse, format, isValid } from 'date-fns';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hasSchedule(schedule: Schedule): boolean {
  if (!schedule) return false;
  return Object.values(schedule).some(day => Array.isArray(day) && day.length > 0);
}

export function convertTo24Hour(time12h: string): string {
    if (!time12h) return '';
    const parsedTime = parse(time12h, 'h:mm a', new Date());
    if (isValid(parsedTime)) {
        return format(parsedTime, 'HH:mm');
    }
    // Fallback for HH:mm format
    const [hours, minutes] = time12h.split(':');
    if(hours && minutes && !isNaN(parseInt(hours)) && !isNaN(parseInt(minutes.split(' ')[0]))) {
        return time12h.split(' ')[0];
    }
    return '';
}

export function formatTo12Hour(time24: string): string {
  if (!time24) return '';
  const parsedTime = parse(time24, 'HH:mm', new Date());
  if (isValid(parsedTime)) {
    return format(parsedTime, 'p').replace(/\s/g, ' '); // 'p' gives e.g. "12:00 PM"
  }
  return time24; // Return original if invalid
}

export function formatDuration(minutes: number): string {
  if (isNaN(minutes) || minutes < 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  
  let result = '';
  if (h > 0) {
    result += `${h}h`;
  }
  if (m > 0) {
    if(result) result += ' ';
    result += `${m}m`;
  }
  return result || '0m';
}
