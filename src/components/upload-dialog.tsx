"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { timetableOcrAnalysis } from '@/ai/flows/timetable-ocr-analysis';
import { useSchedule } from '@/hooks/use-schedule';
import { Loader2, UploadCloud, FileImage } from 'lucide-react';

type UploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { setFullSchedule } = useSchedule();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an image file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const result = await timetableOcrAnalysis({ timetableImageDataUri: base64 });
        if (result && result.schedule && result.schedule.length > 0) {
          setFullSchedule(result.schedule);
          toast({
            title: "Success!",
            description: "Your schedule has been imported.",
          });
          onOpenChange(false);
          setFile(null);
        } else {
          throw new Error("Failed to parse schedule from image. The result was empty.");
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Upload Failed",
          description: "Could not extract a schedule from the image. Please try a clearer one.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = (error) => {
        console.error("File reading error: ", error);
        toast({
          title: "File Error",
          description: "There was an error reading the file.",
          variant: "destructive",
        });
        setIsLoading(false);
    };
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!isLoading) onOpenChange(o); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Timetable</DialogTitle>
          <DialogDescription>
            Select a clear image of your weekly class schedule. We'll analyze it and set up everything for you.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input id="timetable-file" type="file" accept="image/*" onChange={handleFileChange} disabled={isLoading} />
          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground border p-2 rounded-md">
              <FileImage className="h-4 w-4" />
              <span>{file.name}</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
          <Button type="submit" onClick={handleUpload} disabled={isLoading || !file}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Upload & Analyze
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
