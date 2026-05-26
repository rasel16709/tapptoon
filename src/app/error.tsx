'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 gap-6 bg-gray-50">
      <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-gray-900">Something went wrong</h1>
        <p className="text-gray-500 font-medium max-w-md">
          We hit an unexpected error. Try again or head back to the homepage.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => reset()} className="rounded-full font-bold px-6">
          Try again
        </Button>
      </div>
    </div>
  );
}
