import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex h-16 items-center justify-center text-center px-4">
        <p className="text-sm text-muted-foreground">
          Built with ❤️ by{' '}
          <a
            href="https://developeraliraza.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4 hover:text-primary"
          >
            Ali Raza
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
