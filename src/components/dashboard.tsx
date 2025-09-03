"use client";

import { useState } from 'react';
import { useSchedule } from '@/hooks/use-schedule';
import Header from '@/components/header';
import ScheduleDisplay from '@/components/schedule-display';
import UploadDialog from '@/components/upload-dialog';
import Welcome from '@/components/welcome';
import AlarmManager from '@/components/alarm-manager';
import { hasSchedule } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

export function Dashboard() {
  const { schedule, isLoaded } = useSchedule();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  if (!isLoaded) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header onUploadClick={() => setIsUploadDialogOpen(true)} />
        <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
           <Skeleton className="h-10 w-1/3" />
           <Skeleton className="h-10 w-full" />
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
           </div>
        </main>
      </div>
    );
  }

  const scheduleExists = hasSchedule(schedule);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onUploadClick={() => setIsUploadDialogOpen(true)} />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        {scheduleExists ? (
          <ScheduleDisplay />
        ) : (
          <Welcome onUploadClick={() => setIsUploadDialogOpen(true)} />
        )}
      </main>
      <UploadDialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen} />
      {scheduleExists && <AlarmManager />}
    </div>
  );
}
