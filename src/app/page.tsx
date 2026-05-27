import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Flame, Zap, Heart, Sparkles, ChevronRight } from 'lucide-react';
import {
  getPopularManga,
  getRecentlyUpdated,
  getMangaByTags,
  findTagIdsBySlug,
  type MangaDexManga,
} from '@/lib/mangadex';
import { getManhwasAction } from '@/lib/actions';
import { HeroCarousel } from '@/components/hero-carousel';

export const revalidate = 300;

interface MangaCardProps {
  manga: Pick<MangaDexManga, 'id' | 'title' | 'author' | 'coverUrl' | 'status'>;
}

function MangaCard({ manga }: MangaCardProps) {
  return (
    <Link href={`/manhwa/${manga.id}`} className="group">
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
          <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-[10px] font-bold text-white/90 bg-primary/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
              {manga.status}
            </span>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors text-base">
            {manga.title}
          </h3>
          <p className="text-sm text-gray-500 font-medium mt-0.5">{manga.author}</p>
        </div>
      </div>
    </Link>
  );
}

function SectionSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 animate-pulse">
          <div className="aspect-[3/4] rounded-xl bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function FeaturedSection() {
  const localManhwas = await getManhwasAction();
  if (!localManhwas || localManhwas.length === 0) return null;

  const featured = localManhwas.map((m: any) => ({
    id: m.id,
    title: m.title,
    author: m.author,
    coverUrl: m.cover_image_url,
    status: m.status,
  }));

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-12 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl text-white shadow-lg shadow-orange-500/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900">Editor&apos;s Choice</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {featured.map((manga: MangaCardProps['manga']) => (
          <MangaCard key={manga.id} manga={manga} />
        ))}
      </div>
    </div>
  );
}

async function HeroAndPopular() {
  const popular = await getPopularManga(20);

  return (
    <>
      {popular.length > 0 && <HeroCarousel items={popular.slice(0, 5)} />}

      <section className="w-full py-12 bg-white">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-8 border-b pb-4">
            <h2 className="text-2xl font-black tracking-tight text-black sm:text-3xl flex items-center gap-2">
              <Flame className="text-orange-500 w-7 h-7" />
              TRENDING NOW <ChevronRight className="text-primary w-8 h-8" />
            </h2>
            <Link href="/popular" className="text-sm font-bold text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {popular.slice(0, 10).map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

async function RecentSection() {
  const recent = await getRecentlyUpdated(15);
  return (
    <section className="w-full py-12 bg-gray-50">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-8 border-b pb-4">
          <h2 className="text-2xl font-black tracking-tight text-black sm:text-3xl flex items-center gap-2">
            <Sparkles className="text-yellow-500 w-7 h-7" />
            LATEST UPDATES <ChevronRight className="text-primary w-8 h-8" />
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {recent.slice(0, 10).map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      </div>
    </section>
  );
}

async function GenreSection({
  slug,
  title,
  icon,
  href,
  bg,
}: {
  slug: string;
  title: string;
  icon: React.ReactNode;
  href: string;
  bg: string;
}) {
  const tagIds = await findTagIdsBySlug(slug);
  if (tagIds.length === 0) return null;
  const manga = await getMangaByTags([tagIds[0]], 10);
  if (manga.length === 0) return null;

  return (
    <section className={`w-full py-12 ${bg}`}>
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-8 border-b pb-4">
          <h2 className="text-2xl font-black tracking-tight text-black sm:text-3xl flex items-center gap-2">
            {icon}
            {title} <ChevronRight className="text-primary w-8 h-8" />
          </h2>
          <Link href={href} className="text-sm font-bold text-primary hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {manga.map((m) => (
            <MangaCard key={m.id} manga={m} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionShell({
  title,
  icon,
  bg,
  href,
  count = 10,
}: {
  title: string;
  icon: React.ReactNode;
  bg: string;
  href?: string;
  count?: number;
}) {
  return (
    <section className={`w-full py-12 ${bg}`}>
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-8 border-b pb-4">
          <h2 className="text-2xl font-black tracking-tight text-black sm:text-3xl flex items-center gap-2">
            {icon}
            {title} <ChevronRight className="text-primary w-8 h-8" />
          </h2>
          {href && (
            <Link href={href} className="text-sm font-bold text-primary hover:underline">
              View All
            </Link>
          )}
        </div>
        <SectionSkeleton count={count} />
      </div>
    </section>
  );
}

export default function Home() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tappytoon.org';

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Tappytoon.org',
    url: siteUrl,
    description: 'Read the latest and most popular manhwa, webtoons, and comics for free.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/popular?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tappytoon.org',
    url: siteUrl,
    logo: `${siteUrl}/tapytoonlogo.svg`,
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([websiteJsonLd, orgJsonLd]) }}
      />
      <Suspense fallback={null}>
        <FeaturedSection />
      </Suspense>

      <Suspense
        fallback={
          <SectionShell
            title="TRENDING NOW"
            icon={<Flame className="text-orange-500 w-7 h-7" />}
            bg="bg-white"
            href="/popular"
          />
        }
      >
        <HeroAndPopular />
      </Suspense>

      <Suspense
        fallback={
          <SectionShell
            title="LATEST UPDATES"
            icon={<Sparkles className="text-yellow-500 w-7 h-7" />}
            bg="bg-gray-50"
          />
        }
      >
        <RecentSection />
      </Suspense>

      <Suspense
        fallback={
          <SectionShell
            title="ACTION & MARTIAL ARTS"
            icon={<Zap className="text-red-500 w-7 h-7" />}
            bg="bg-white"
            href="/genres/action"
          />
        }
      >
        <GenreSection
          slug="action"
          title="ACTION & MARTIAL ARTS"
          icon={<Zap className="text-red-500 w-7 h-7" />}
          href="/genres/action"
          bg="bg-white"
        />
      </Suspense>

      <Suspense
        fallback={
          <SectionShell
            title="ROMANCE & DRAMA"
            icon={<Heart className="text-pink-500 w-7 h-7" />}
            bg="bg-gray-50"
            href="/genres/romance"
          />
        }
      >
        <GenreSection
          slug="romance"
          title="ROMANCE & DRAMA"
          icon={<Heart className="text-pink-500 w-7 h-7" />}
          href="/genres/romance"
          bg="bg-gray-50"
        />
      </Suspense>

    </div>
  );
}
