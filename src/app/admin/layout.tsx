import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, BookOpen, Layers, LogOut } from 'lucide-react';
import { getCurrentUser } from '@/lib/supabase/server';
import { logoutAction } from './login/actions';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Login page renders its own bare layout — proxy already redirects unauthed visits
  // away from other admin routes, but layout still wraps the login page. Detect that
  // via the absence of a user and render children unwrapped.
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-primary">
            ADMIN CONSOLE
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
            <Link href="/admin">
              <Button variant="ghost" className="w-full justify-start gap-3">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Layers className="h-4 w-4" />
                Categories
              </Button>
            </Link>
            <Link href="/admin/manhwas">
              <Button variant="ghost" className="w-full justify-start gap-3">
                <BookOpen className="h-4 w-4" />
                Manhwas
              </Button>
            </Link>
          </nav>
        </div>
        <div className="border-t p-3 space-y-2">
          <div className="text-xs font-semibold text-gray-500 px-2 truncate">
            {user.email}
          </div>
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64 w-full">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
