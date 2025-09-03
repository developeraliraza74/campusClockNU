import Image from 'next/image';
import { Linkedin, Instagram, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onUploadClick={() => {}} />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <Image
                src="https://picsum.photos/200"
                alt="Developer Profile"
                width={128}
                height={128}
                className="rounded-full mx-auto mb-4 border-4 border-primary"
                data-ai-hint="profile picture"
              />
              <CardTitle className="font-headline text-3xl">Ali Raza</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                This application was born from a desire to simplify the chaotic life of a student. Juggling classes, assignments, and personal time is a challenge, and I wanted to create a smart, simple tool to help manage it all. CampusClock is designed to be an intelligent companion that takes the stress out of schedule management, so you can focus on what truly matters: learning and growing.
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild variant="outline" size="icon">
                  <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-5 w-5" />
                    <span className="sr-only">LinkedIn</span>
                  </a>
                </Button>
                <Button asChild variant="outline" size="icon">
                  <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-5 w-5" />
                    <span className="sr-only">Instagram</span>
                  </a>
                </Button>
                <Button asChild variant="outline" size="icon">
                  <a href="https://www.github.com" target="_blank" rel="noopener noreferrer">
                    <Github className="h-5 w-5" />
                    <span className="sr-only">GitHub</span>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
