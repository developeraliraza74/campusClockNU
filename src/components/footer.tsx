import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex h-16 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Built with ❤️ by{' '}
          <Link href="/about" className="font-medium underline underline-offset-4 hover:text-primary">
            the developer
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
