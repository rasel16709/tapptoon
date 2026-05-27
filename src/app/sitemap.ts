import { MetadataRoute } from 'next';
import { getPopularManga, getRecentlyUpdated, getAllTags } from '@/lib/mangadex';

export const revalidate = 3600;

const STATIC_GENRE_SLUGS = [
  'action',
  'romance',
  'fantasy',
  'martial-arts',
  'school-life',
  'horror',
  'thriller',
  'comedy',
  'isekai',
  'adventure',
  'drama',
  'mystery',
  'supernatural',
  'sci-fi',
  'slice-of-life',
  'historical',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tappytoon.org';

  const staticUrls: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'always', priority: 1 },
    { url: `${baseUrl}/popular`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/genres`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/dmca`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  const staticGenreUrls: MetadataRoute.Sitemap = STATIC_GENRE_SLUGS.map((slug) => ({
    url: `${baseUrl}/genres/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  try {
    const [popularManga, recentManga, allTags] = await Promise.all([
      getPopularManga(100),
      getRecentlyUpdated(100),
      getAllTags().catch(() => []),
    ]);

    const uniqueManga = new Map<string, { id: string }>();
    [...popularManga, ...recentManga].forEach((manga) => {
      if (!uniqueManga.has(manga.id)) uniqueManga.set(manga.id, manga);
    });

    const mangaUrls: MetadataRoute.Sitemap = Array.from(uniqueManga.values()).map((manga) => ({
      url: `${baseUrl}/manhwa/${manga.id}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }));

    const tagUrls: MetadataRoute.Sitemap = allTags
      .filter((t) => t.group === 'genre' || t.group === 'theme')
      .slice(0, 50)
      .map((t) => ({
        url: `${baseUrl}/genres/${t.id}?name=${encodeURIComponent(t.name)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      }));

    return [...staticUrls, ...staticGenreUrls, ...mangaUrls, ...tagUrls];
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    return [...staticUrls, ...staticGenreUrls];
  }
}
