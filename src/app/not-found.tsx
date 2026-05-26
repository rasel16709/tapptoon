import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 gap-6 bg-gray-50">
      <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <Compass className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-gray-900">Page not found</h1>
        <p className="text-gray-500 font-medium max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link href="/">
        <Button className="rounded-full font-bold px-6">Back to home</Button>
      </Link>
    </div>
  );
}
