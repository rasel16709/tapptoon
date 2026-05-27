import Image from 'next/image';
import Link from 'next/link';
import { getPopularManga } from '@/lib/mangadex';
import { Flame, ChevronRight, Trophy } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Most Popular Manhwa & Manga - Tappytoon.org',
  description: 'Discover the most popular and trending manhwa and manga on Tappytoon.org. Solo Leveling, Tower of God, and thousands more - all free to read.',
  keywords: 'popular manhwa, popular manga, trending webtoon, best manhwa, top manga, most read',
  alternates: { canonical: '/popular' },
  openGraph: {
    title: 'Most Popular Manhwa & Manga - Tappytoon.org',
    description: 'Discover the most popular and trending manhwa and manga. Updated in real-time.',
    url: '/popular',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Most Popular Manhwa & Manga - Tappytoon.org',
    description: 'Discover the most popular and trending manhwa and manga. Updated in real-time.',
  },
};

export default async function PopularPage() {
  let popularManga: any[] = [];
  
  try {
    popularManga = await getPopularManga(30);
  } catch (error) {
    console.error('Error fetching popular manga:', error);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tappytoon.org';

  const itemListJsonLd = popularManga.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Most Popular Manhwa & Manga',
    numberOfItems: popularManga.length,
    itemListElement: popularManga.slice(0, 20).map((manga: any, idx: number) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${siteUrl}/manhwa/${manga.id}`,
      name: manga.title,
    })),
  } : null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <Flame className="w-4 h-4" />
            Most Popular
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            Most Popular Series
          </h1>
          <p className="text-gray-500 font-medium mt-3 max-w-lg mx-auto">
            The most followed and popular manhwa & manga on Tappytoon.org, updated in real-time.
          </p>
        </div>

        {/* Manga Grid with Ranking */}
        {popularManga.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {popularManga.map((manga, idx) => (
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Ranking Badge */}
                    <div className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg ${
                      idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                      idx === 1 ? 'bg-gray-300 text-gray-700' :
                      idx === 2 ? 'bg-orange-400 text-orange-900' :
                      'bg-black/70 text-white backdrop-blur-sm'
                    }`}>
                      {idx < 3 ? <Trophy className="w-3.5 h-3.5" /> : `#${idx + 1}`}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute bottom-2 right-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${
                        manga.status === 'Ongoing' ? 'bg-primary/80 text-white' : 'bg-blue-500/80 text-white'
                      }`}>
                        {manga.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors text-base">
                      {manga.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium mt-0.5">{manga.author}</p>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {manga.tags.filter((t: any) => t.group === 'genre').slice(0, 2).map((tag: any) => (
                        <span key={tag.id} className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-500 font-medium text-lg">Loading popular manga...</p>
          </div>
        )}

        {/* Source Attribution */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-400 font-medium">
            Rankings based on community popularity • Data refreshes every 15 minutes
          </p>
        </div>
      </div>
    </div>
  );
}
