import Image from 'next/image';
import Link from 'next/link';
import { getMangaByTags } from '@/lib/mangadex';
import { ChevronRight, ArrowLeft, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ name?: string }>;
}): Promise<Metadata> {
  const resolvedSearch = await searchParams;
  const genreName = resolvedSearch.name || 'Genre';

  const { slug } = await params;
  return {
    title: `${genreName} Manhwa & Manga - Read Online | Tappytoon.org`,
    description: `Browse the best ${genreName} manhwa and manga. Read the latest ${genreName} comics online for free on Tappytoon.org.`,
    keywords: `${genreName.toLowerCase()} manga, ${genreName.toLowerCase()} manhwa, ${genreName.toLowerCase()} webtoon, read online`,
    alternates: { canonical: `/genres/${slug}` },
  };
}

export default async function GenreDetail({ 
  params,
  searchParams,
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ name?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  
  const slug = resolvedParams.slug;
  const genreName = resolvedSearch.name || (slug.includes('-') && slug.length !== 36 ? slug.replace(/-/g, ' ') : 'Genre');

  let manhwas: any[] = [];
  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug);
    
    if (isUUID) {
      // It's already a MangaDex tag UUID (came from /genres page)
      manhwas = await getMangaByTags([slug], 30);
    } else {
      // It's a text slug (came from manual URL or header link, e.g. /genres/romance)
      const { findTagIdsBySlug } = await import('@/lib/mangadex');
      const tagIds = await findTagIdsBySlug(slug);
      
      if (tagIds.length > 0) {
        manhwas = await getMangaByTags(tagIds, 30);
      }
    }
  } catch (error) {
    console.error('Error fetching genre manhwas:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb + Header */}
        <div className="mb-8">
          <Link href="/genres">
            <Button variant="ghost" size="sm" className="rounded-full font-bold text-gray-500 hover:text-primary mb-4">
              <ArrowLeft className="w-4 h-4 mr-1" />
              All Genres
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight uppercase">
                {genreName}
              </h1>
              <p className="text-gray-500 font-medium text-sm mt-0.5">
                {manhwas.length} titles found
              </p>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {manhwas.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {manhwas.map((manga) => (
              <Link href={`/manhwa/${manga.id}`} key={manga.id} className="group">
                <div className="flex flex-col gap-3 cursor-pointer">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm border border-gray-100 group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                    <Image
                      src={manga.coverUrl}
                      alt={manga.title}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors text-base">
                      {manga.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium mt-0.5">{manga.author}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-500 font-medium text-lg">No titles found for this genre.</p>
            <Link href="/genres">
              <Button variant="outline" className="rounded-full font-bold mt-4">
                Browse Other Genres
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
