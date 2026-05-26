import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookX } from 'lucide-react';

export default function ManhwaNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 gap-6 bg-gray-50">
      <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <BookX className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-gray-900">Manhwa not found</h1>
        <p className="text-gray-500 font-medium max-w-md">
          This title may have been removed from MangaDex or the URL is incorrect.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/popular">
          <Button variant="outline" className="rounded-full font-bold">
            Browse popular
          </Button>
        </Link>
        <Link href="/">
          <Button className="rounded-full font-bold px-6">Back to home</Button>
        </Link>
      </div>
    </div>
  );
}
