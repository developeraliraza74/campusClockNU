"use client";

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Class } from '@/lib/types';
import { ALL_DAYS } from '@/lib/types';
import { useSchedule } from '@/hooks/use-schedule';
import { useToast } from '@/hooks/use-toast';

const classSchema = z.object({
  subject: z.string().min(1, "Subject is required."),
  roomNumber: z.string().min(1, "Room number is required."),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM 24-hour)."),
  duration: z.string().min(1, "Duration is required."),
  dayOfWeek: z.enum(ALL_DAYS),
});

type EditClassSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classInfo: Class;
};

export default function EditClassSheet({ open, onOpenChange, classInfo }: EditClassSheetProps) {
  const { updateClass } = useSchedule();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof classSchema>>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      subject: classInfo.subject,
      roomNumber: classInfo.roomNumber,
      startTime: classInfo.startTime,
      duration: classInfo.duration,
      dayOfWeek: classInfo.dayOfWeek,
    },
  });

  // Reset form when classInfo changes to avoid stale data
  useEffect(() => {
    form.reset({
      subject: classInfo.subject,
      roomNumber: classInfo.roomNumber,
      startTime: classInfo.startTime,
      duration: classInfo.duration,
      dayOfWeek: classInfo.dayOfWeek,
    });
  }, [classInfo, form]);
  
  const onSubmit = (values: z.infer<typeof classSchema>) => {
    updateClass({ ...classInfo, ...values });
    toast({ title: "Class Updated", description: `${values.subject} has been updated.` });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Class</SheetTitle>
          <SheetDescription>Make changes to your class details here. Click save when you're done.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="subject" render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="roomNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>Room Number</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="startTime" render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time (24-hour)</FormLabel>
                <FormControl><Input {...field} placeholder="e.g., 09:00 or 14:30" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="duration" render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <FormControl><Input {...field} placeholder="e.g., 50 minutes" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="dayOfWeek" render={({ field }) => (
              <FormItem>
                <FormLabel>Day of Week</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a day" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ALL_DAYS.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <SheetFooter className="pt-4">
              <SheetClose asChild><Button type="button" variant="outline">Cancel</Button></SheetClose>
              <Button type="submit">Save Changes</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
