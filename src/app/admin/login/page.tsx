import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck } from 'lucide-react';
import { loginAction } from './actions';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const resolved = await searchParams;
  const nextUrl = resolved.next || '/admin';
  const errorMessage = resolved.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Admin Login</h1>
          <p className="text-sm text-gray-500 font-medium">
            Authorized personnel only.
          </p>
        </div>

        {errorMessage && (
          <div className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {errorMessage}
          </div>
        )}

        <form action={loginAction} className="space-y-4">
          <input type="hidden" name="next" value={nextUrl} />

          <div className="space-y-2">
            <Label htmlFor="email" className="font-bold text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="rounded-xl border-gray-200 focus-visible:ring-primary h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-bold text-gray-700">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-xl border-gray-200 focus-visible:ring-primary h-10"
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-full font-bold h-11 shadow-lg shadow-primary/20"
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
