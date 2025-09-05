import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ScheduleProvider } from '@/components/providers/ScheduleProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import Footer from '@/components/footer';

export const metadata: Metadata = {
  title: 'CampusClock',
  description: 'Intelligent timetable and alarm management.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@700,500&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ScheduleProvider>
            <div className="flex-grow">
              {children}
            </div>
            <Footer />
          </ScheduleProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
