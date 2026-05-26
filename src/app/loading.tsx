import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="py-40 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-gray-500 font-bold text-lg">Loading...</p>
    </div>
  );
}
