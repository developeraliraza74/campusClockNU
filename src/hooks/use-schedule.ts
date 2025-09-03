"use client";

import { useContext } from 'react';
import { ScheduleContext } from '@/components/providers/ScheduleProvider';

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}
