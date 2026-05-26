import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Play, BookOpen, User, Calendar, Tag } from 'lucide-react';
import type { Metadata } from 'next';
import { getMangaDetails, getMangaChapters } from '@/lib/mangadex';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tappytoon.org';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const manga = await getMangaDetails(resolvedParams.id);

  if (!manga) return {};

  const seoTitle = manga.seo_title || `${manga.title} - Read ${manga.title} Manhwa Online | Tappytoon.org`;
  const seoDesc = manga.seo_description || `Read the latest chapters of ${manga.title} online on Tappytoon.org. ${manga.description.substring(0, 120)}...`;
  const seoKeywords = manga.seo_keywords || `${manga.title.toLowerCase()}, read ${manga.title.toLowerCase()}, webtoon, manhwa, manga, online reader`;
  const canonical = `${SITE_URL}/manhwa/${resolvedParams.id}`;

  return {
    title: seoTitle,
    description: seoDesc,
    keywords: seoKeywords,
    alternates: { canonical },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url: canonical,
      images: [{ url: manga.coverUrl }],
      type: 'book',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDesc,
      images: [manga.coverUrl],
    },
  };
}

export default async function ManhwaDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  // Fetch manga details and chapters from MangaDex
  const [manga, chaptersData] = await Promise.all([
    getMangaDetails(resolvedParams.id),
    getMangaChapters(resolvedParams.id, 500),
  ]);
  
  if (!manga) {
    notFound();
  }

  const chapters = chaptersData.chapters;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: manga.title,
    bookFormat: 'https://schema.org/EBook',
    author: { '@type': 'Person', name: manga.author },
    illustrator: manga.artist && manga.artist !== manga.author ? { '@type': 'Person', name: manga.artist } : undefined,
    description: manga.description,
    image: manga.coverUrl,
    inLanguage: manga.originalLanguage,
    datePublished: manga.year ? String(manga.year) : undefined,
    genre: manga.tags
      .filter((t) => t.group === 'genre' || t.group === 'theme')
      .map((t) => t.name),
    url: `${SITE_URL}/manhwa/${resolvedParams.id}`,
    numberOfPages: chapters.length,
  };

  // Genre/tag colors for visual variety
  const tagColors = [
    'bg-blue-50 text-blue-700',
    'bg-purple-50 text-purple-700',
    'bg-pink-50 text-pink-700',
    'bg-amber-50 text-amber-700',
    'bg-emerald-50 text-emerald-700',
    'bg-red-50 text-red-700',
    'bg-cyan-50 text-cyan-700',
    'bg-indigo-50 text-indigo-700',
  ];

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Top Banner Background */}
      <div className="w-full h-[300px] absolute top-0 left-0 z-0 overflow-hidden opacity-20 pointer-events-none">
        <Image
          src={manga.coverUrl}
          alt="bg"
          fill
          className="object-cover blur-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl relative z-10">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Cover Image */}
          <div className="w-[240px] md:w-[280px] shrink-0 mx-auto md:mx-0">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src={manga.coverUrl}
                alt={manga.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Quick info below cover */}
            <div className="mt-4 space-y-2">
              {manga.year && (
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <Calendar className="w-4 h-4" />
                  <span>{manga.year}</span>
                </div>
              )}
              {manga.originalLanguage && (
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <BookOpen className="w-4 h-4" />
                  <span className="uppercase">{manga.originalLanguage === 'ko' ? '🇰🇷 Korean (Manhwa)' : manga.originalLanguage === 'ja' ? '🇯🇵 Japanese (Manga)' : manga.originalLanguage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-5 pt-4 text-center md:text-left">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">{manga.title}</h1>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <User className="w-4 h-4 text-primary" />
                <p className="text-xl text-primary font-bold">{manga.author}</p>
                {manga.artist && manga.artist !== manga.author && (
                  <span className="text-gray-400 font-medium">/ {manga.artist}</span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap justify-center md:justify-start">
              {manga.tags.filter(t => t.group === 'genre' || t.group === 'theme').slice(0, 8).map((tag, i) => (
                <span key={tag.id} className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${tagColors[i % tagColors.length]}`}>
                  {tag.name}
                </span>
              ))}
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${manga.status === 'Ongoing' ? 'bg-primary/10 text-primary' : manga.status === 'Completed' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-700'}`}>
                {manga.status}
              </span>
            </div>

            <div className="pt-2">
              <p className="text-gray-600 leading-relaxed font-medium">
                {manga.description}
              </p>
            </div>

            <div className="pt-6 flex justify-center md:justify-start gap-4">
              {chapters.length > 0 && (
                <Link href={`/read/${chapters[0].id}?manga=${manga.id}`}>
                  <Button size="lg" className="rounded-full px-8 py-6 font-bold text-lg shadow-lg shadow-primary/30 hover:scale-105 transition-transform">
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    Read First Chapter
                  </Button>
                </Link>
              )}
            </div>

            {/* Source Attribution */}
            <div className="pt-2">
              <p className="text-xs text-gray-400 font-medium">
                <Tag className="w-3 h-3 inline mr-1" />
                Support the original creators!
              </p>
            </div>
          </div>
        </div>

        {/* Chapters List */}
        <div className="mt-16">
          <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-6">
            <h2 className="text-2xl font-black text-gray-900 uppercase">Chapters <span className="text-gray-400 font-medium text-lg ml-2">({chapters.length})</span></h2>
          </div>
          
          {chapters.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[...chapters].reverse().map((chapter) => (
                <Link key={chapter.id} href={`/read/${chapter.id}?manga=${manga.id}`} className="block group">
                  <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-primary hover:shadow-md transition-all h-full text-center">
                    <span className="font-black text-gray-900 group-hover:text-primary transition-colors text-lg">
                      Ch. {chapter.chapter}
                    </span>
                    <span className="text-xs text-gray-500 font-medium mt-1">
                      {new Date(chapter.publishAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">No English chapters available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
