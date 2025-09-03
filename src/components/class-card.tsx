"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Home, Edit, Trash2, ArrowRight, Coffee } from 'lucide-react';
import type { Class } from '@/lib/types';
import EditClassSheet from './edit-class-sheet';
import { useSchedule } from '@/hooks/use-schedule';
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
} from "@/components/ui/alert-dialog";
import { Badge } from './ui/badge';

type ClassCardProps = {
  classInfo: Class;
};

export default function ClassCard({ classInfo }: ClassCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { deleteClass } = useSchedule();

  const handleDelete = () => {
    deleteClass(classInfo.id, classInfo.dayOfWeek);
  }

  if (classInfo.isFreePeriod) {
    return (
       <Card className="flex flex-col bg-muted/50 border-dashed">
        <CardHeader>
          <CardTitle className="font-headline flex items-center justify-between">
            <span className="break-words">Free Period</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 flex-grow flex flex-col justify-center items-center">
            <Coffee className="h-8 w-8 text-muted-foreground mb-2" />
            <div className="flex items-center text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                <span className="font-medium text-foreground">{classInfo.duration}</span>
            </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline flex items-start justify-between">
            <span className="break-words">{classInfo.subject}</span>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the class "{classInfo.subject}" from your schedule.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardTitle>
          <CardDescription className="flex items-center gap-2 pt-1">
            {classInfo.isConsecutive && (
               <Badge variant="secondary" className="flex items-center gap-1">
                  Consecutive <ArrowRight className="h-3 w-3" />
                </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 flex-grow">
          <div className="flex items-center text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <span className="font-medium text-foreground">{classInfo.startTime}</span>
            <span className="ml-1">({classInfo.duration})</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Home className="mr-2 h-4 w-4" />
            <span className="font-medium text-foreground">Room: {classInfo.roomNumber}</span>
          </div>
        </CardContent>
      </Card>
      <EditClassSheet open={isEditing} onOpenChange={setIsEditing} classInfo={classInfo} />
    </>
  );
}
