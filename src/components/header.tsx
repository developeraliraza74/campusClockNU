import { Button } from "@/components/ui/button";
import { UploadCloud, BookOpenCheck } from "lucide-react";

type HeaderProps = {
  onUploadClick: () => void;
};

export default function Header({ onUploadClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpenCheck className="h-7 w-7 text-primary" />
          <h1 className="font-headline text-2xl font-bold">ChronoSage</h1>
        </div>
        <Button variant="outline" onClick={onUploadClick}>
          <UploadCloud className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>
    </header>
  );
}
