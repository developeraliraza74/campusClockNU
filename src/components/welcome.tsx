import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";

type WelcomeProps = {
  onUploadClick: () => void;
};

export default function Welcome({ onUploadClick }: WelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <div className="bg-primary text-primary-foreground rounded-full p-4 mb-6">
        <UploadCloud className="h-10 w-10" />
      </div>
      <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">Welcome to CampusClock</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        Your intelligent assistant for managing class schedules. Get started by uploading a picture of your timetable.
      </p>
      <Button size="lg" className="mt-8" onClick={onUploadClick}>
        <UploadCloud className="mr-2 h-5 w-5" />
        Upload Timetable
      </Button>
    </div>
  );
}
