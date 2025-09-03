import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlarmClock, School, DoorOpen } from 'lucide-react';
import type { Class } from '@/lib/types';
import { useEffect, useRef } from 'react';

type Reminder = {
  type: 'alarm' | 'consecutive';
  classInfo: Class;
  message: string;
};

type FullScreenReminderProps = {
  reminder: Reminder;
  onDismiss: () => void;
};

export default function FullScreenReminder({ reminder, onDismiss }: FullScreenReminderProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Attempt to play the audio when the component mounts
    audioRef.current?.play().catch(error => {
      // Autoplay is often blocked by browsers until a user interaction.
      // This is expected, but we try anyway.
      console.log("Audio autoplay prevented: ", error);
    });
  }, []);


  return (
    <Dialog open={true} onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent className="sm:max-w-md w-full max-w-[90vw] h-full sm:h-auto flex flex-col justify-center text-center p-8 sm:rounded-lg">
        <DialogHeader>
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-4 w-fit mb-4">
            <AlarmClock className="h-10 w-10 animate-pulse" />
          </div>
          <DialogTitle className="font-headline text-3xl">{reminder.type === 'alarm' ? 'Class Reminder!' : 'Next Class!'}</DialogTitle>
          <DialogDescription className="text-lg">{reminder.message}</DialogDescription>
        </DialogHeader>
        <div className="my-8 p-6 bg-secondary rounded-lg space-y-4">
            <div className="flex items-center justify-center text-2xl font-bold gap-2">
                <School className="h-6 w-6" />
                <span>{reminder.classInfo.subject}</span>
            </div>
             <div className="flex items-center justify-center text-xl gap-2">
                <AlarmClock className="h-5 w-5" />
                <span>{reminder.classInfo.startTime}</span>
            </div>
             <div className="flex items-center justify-center text-xl gap-2">
                <DoorOpen className="h-5 w-5" />
                <span>Room: {reminder.classInfo.roomNumber}</span>
            </div>
        </div>
        <DialogFooter>
          <Button size="lg" className="w-full" onClick={onDismiss}>Dismiss</Button>
        </DialogFooter>
        <audio ref={audioRef} src="/alarm.mp3" loop />
      </DialogContent>
    </Dialog>
  );
}
