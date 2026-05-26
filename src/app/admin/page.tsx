import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getCategoriesAction, getManhwasAction, getChaptersAction } from '@/lib/actions';
import { BookOpen, FileText, Layers, TrendingUp, PlusCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export const revalidate = 0; // Force dynamic rendering on every request

export default async function AdminDashboard() {
  const manhwas = await getManhwasAction();
  const chapters = await getChaptersAction();
  const categories = await getCategoriesAction();

  // Get last 4 recent chapters
  const recentChapters = [...chapters]
    .sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-green-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure Console Active
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Welcome to Tappytoon.org Control Center</h2>
            <p className="text-white/80 font-medium text-sm md:text-base max-w-[600px]">
              Publish new chapters, edit series metadata, configure SEO keywords, and audit all webtoon metrics in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50/50">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Manhwas</CardTitle>
            <div className="p-2 bg-green-50 text-primary rounded-xl">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black text-gray-900">{manhwas.length}</div>
            <p className="text-xs font-bold text-gray-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-primary" /> Active series on portal
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50/50">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Chapters</CardTitle>
            <div className="p-2 bg-green-50 text-primary rounded-xl">
              <FileText className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black text-gray-900">{chapters.length}</div>
            <p className="text-xs font-bold text-gray-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-primary" /> PDF-stitched chapters
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50/50">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Categories</CardTitle>
            <div className="p-2 bg-green-50 text-primary rounded-xl">
              <Layers className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black text-gray-900">{categories.length}</div>
            <p className="text-xs font-bold text-gray-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-primary" /> Active searchable genres
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Recent Uploads Table (Takes 8 Cols on desktop) */}
        <Card className="md:col-span-8 rounded-3xl border-gray-200 shadow-sm overflow-hidden bg-white">
          <CardHeader className="border-b bg-gray-50/50 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black text-gray-900">Recent Chapter Releases</CardTitle>
              <CardDescription className="font-medium text-gray-400 mt-0.5">The latest chapters published by you.</CardDescription>
            </div>
            <Link href="/admin/manhwas">
              <Button size="sm" variant="ghost" className="rounded-full font-bold text-xs text-primary hover:bg-green-50">
                View All Series
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentChapters.map((chapter) => {
                const parentManhwa = manhwas.find((m: any) => m.id === chapter.manhwa_id);
                return (
                  <div key={chapter.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-2xl hover:bg-green-50/5 transition-colors">
                    <div className="flex items-center gap-4">
                      {parentManhwa && (
                        <div className="relative w-9 h-12 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                          <Image
                            src={parentManhwa.cover_image_url}
                            alt="parent cover"
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900 text-sm md:text-base">
                          {parentManhwa ? parentManhwa.title : 'Series'} - {chapter.title}
                        </p>
                        <p className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <span>Chapter {chapter.chapter_number}</span>
                          <span>•</span>
                          <span>{chapter.pdf_urls.length} PDF(s)</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-gray-500">
                        {new Date(chapter.published_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                      <Link href={`/admin/manhwas/${chapter.manhwa_id}`}>
                        <span className="text-[10px] font-bold text-primary hover:underline cursor-pointer">Manage</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
              {recentChapters.length === 0 && (
                <div className="py-12 text-center text-gray-400 font-semibold">No recent chapters found.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Panel (Takes 4 Cols on desktop) */}
        <Card className="md:col-span-4 rounded-3xl border-gray-200 shadow-sm overflow-hidden bg-white">
          <CardHeader className="border-b bg-gray-50/50 pb-4">
            <CardTitle className="text-lg font-black text-gray-900">Quick Console Actions</CardTitle>
            <CardDescription className="font-medium text-gray-400 mt-0.5">Instant dashboard shortcuts.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Link href="/admin/manhwas" className="block">
              <div className="flex items-center gap-3 p-3 rounded-2xl border border-dashed border-gray-200 hover:border-primary hover:bg-green-50/20 transition-all cursor-pointer group">
                <PlusCircle className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                <div>
                  <p className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors">Add New Manhwa</p>
                  <p className="text-[10px] text-gray-400 font-semibold">Create a new comic series & custom SEO</p>
                </div>
              </div>
            </Link>

            <Link href="/admin/categories" className="block">
              <div className="flex items-center gap-3 p-3 rounded-2xl border border-dashed border-gray-200 hover:border-primary hover:bg-green-50/20 transition-all cursor-pointer group">
                <PlusCircle className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                <div>
                  <p className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors">Add Genre / Category</p>
                  <p className="text-[10px] text-gray-400 font-semibold">Create clean searchable categories</p>
                </div>
              </div>
            </Link>

            <div className="bg-yellow-50/50 border border-yellow-100 rounded-2xl p-4 space-y-2 mt-2">
              <h5 className="text-xs font-bold text-yellow-800 uppercase tracking-wider flex items-center gap-1.5">
                ⚡ Local Storage Active
              </h5>
              <p className="text-[11px] font-semibold text-yellow-700 leading-relaxed">
                All changes you make here are automatically compiled and saved in real-time to your local harddisk. Ready to export to your production Supabase database!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
