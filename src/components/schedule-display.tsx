
"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSchedule } from '@/hooks/use-schedule';
import type { DayOfWeek } from '@/lib/types';
import { ALL_DAYS } from '@/lib/types';
import ClassCard from './class-card';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CalendarCheck, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ScrollArea, ScrollBar } from './ui/scroll-area';

const getToday = (): DayOfWeek => {
  const dayIndex = new Date().getDay();
  // Adjust because getDay() has Sunday as 0
  const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
}

export default function ScheduleDisplay() {
  const { schedule, clearSchedule } = useSchedule();
  const [currentDay, setCurrentDay] = useState<DayOfWeek | null>(null);

  useEffect(() => {
    // This effect should only run once on the client side
    setCurrentDay(getToday());
  }, []);

  const handleTabChange = (value: string) => {
    setCurrentDay(value as DayOfWeek);
  }
  
  const today = getToday();
  const initialTab = schedule[today]?.length > 0 ? today : (ALL_DAYS.find(d => schedule[d]?.length > 0) || today);

  useEffect(() => {
    if(!currentDay) {
      setCurrentDay(initialTab);
    }
  }, [schedule, currentDay, initialTab]);


  if (!currentDay) {
    return null; // or a loading skeleton
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-headline text-3xl font-bold tracking-tight">Your Weekly Schedule</h2>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/>Clear Schedule</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all your schedule data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={clearSchedule} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Everything</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <Tabs value={currentDay} onValueChange={handleTabChange} className="w-full">
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList>
            {ALL_DAYS.map(day => (
              <TabsTrigger key={day} value={day}>{day}</TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        {ALL_DAYS.map(day => (
          <TabsContent key={day} value={day} className="mt-6">
            {schedule[day] && schedule[day].length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {schedule[day].map(classInfo => (
                  <ClassCard key={classInfo.id} classInfo={classInfo} />
                ))}
              </div>
            ) : (
               <Alert>
                  <CalendarCheck className="h-4 w-4" />
                  <AlertTitle>No Classes Today!</AlertTitle>
                  <AlertDescription>
                    You have no classes scheduled for {day}. Enjoy your free time!
                  </AlertDescription>
                </Alert>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
