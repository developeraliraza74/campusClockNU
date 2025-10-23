import { Button } from "@/components/ui/button";
import { UploadCloud, BookOpenCheck } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import Link from "next/link";

type HeaderProps = {
  onUploadClick: () => void;
};

export default function Header({ onUploadClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <BookOpenCheck className="h-7 w-7 text-primary" />
          <h1 className="font-headline text-xl sm:text-2xl font-bold">CampusClock</h1>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onUploadClick}>
            <UploadCloud className="mr-0 sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
