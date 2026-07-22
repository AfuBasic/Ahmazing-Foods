import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center p-4">
      <div className="text-center bg-card p-12 rounded-[2rem] border border-border shadow-sm max-w-md w-full">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-8">
          We couldn't find the page you were looking for. It might have been moved or removed.
        </p>
        <Button asChild className="rounded-full px-8 h-12">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}