/**
 * MangaDex API Client
 *
 * All manhwa content is fetched live from MangaDex's free public API.
 * No API key required. Base URL: https://api.mangadex.org
 *
 * Caching is delegated to Next.js's Data Cache via `fetch({ next: { revalidate } })`.
 *
 * Docs: https://api.mangadex.org/docs/
 */

const BASE_URL = 'https://api.mangadex.org';

// Rate limiting: simple delay between requests
let lastRequestTime = 0;
const MIN_INTERVAL = 220; // ~5 requests per second

async function rateLimitedFetch(
  url: string,
  options?: RequestInit & { next?: { revalidate?: number } }
): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_INTERVAL) {
    await new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  const response = await fetch(url, {
    ...options,
    next: {
      revalidate: 300,
      ...options?.next,
    },
    headers: {
      'User-Agent': 'TappytoonWebsite/1.0',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`MangaDex API error: HTTP ${response.status} for ${url}`);
  }

  return response;
}

// ============================================================
// Types
// ============================================================

export interface MangaDexManga {
  id: string;
  title: string;
  altTitles: string[];
  description: string;
  author: string;
  artist: string;
  status: string;
  year: number | null;
  contentRating: string;
  tags: { id: string; name: string; group: string }[];
  coverUrl: string;
  coverFileName: string;
  originalLanguage: string;
  lastChapter: string;
  demographicTag: string;
  // Optional SEO overrides from Admin
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

export interface MangaDexChapter {
  id: string;
  title: string;
  chapter: string;
  volume: string | null;
  pages: number;
  publishAt: string;
  scanlationGroup: string;
  translatedLanguage: string;
  externalUrl?: string | null;
}

export interface MangaDexTag {
  id: string;
  name: string;
  group: string;
}

// ============================================================
// Helpers
// ============================================================

function extractTitle(attributes: any): string {
  return (
    attributes.title?.en ||
    attributes.title?.ja ||
    attributes.title?.['ja-ro'] ||
    attributes.title?.ko ||
    attributes.title?.['ko-ro'] ||
    (Object.values(attributes.title || {})[0] as string) ||
    'Untitled'
  );
}

function extractAltTitles(attributes: any): string[] {
  return (attributes.altTitles || [])
    .map((alt: any) => alt.en || Object.values(alt)[0])
    .filter(Boolean)
    .slice(0, 5);
}

function extractDescription(attributes: any): string {
  return (
    attributes.description?.en ||
    (Object.values(attributes.description || {})[0] as string) ||
    'No description available.'
  );
}

function extractRelationship(relationships: any[], type: string): any {
  return relationships?.find((r: any) => r.type === type);
}

function buildCoverUrl(
  mangaId: string,
  coverFileName: string,
  size: 'original' | '512' | '256' = '512'
): string {
  if (!coverFileName) return 'https://placehold.co/400x600/1a1a2e/ffffff?text=No+Cover';
  const rawUrl =
    size === 'original'
      ? `https://uploads.mangadex.org/covers/${mangaId}/${coverFileName}`
      : `https://uploads.mangadex.org/covers/${mangaId}/${coverFileName}.${size}.jpg`;
  // Encode URL to base64 so the source domain is not visible in HTML/network tab
  const encoded = Buffer.from(rawUrl).toString('base64');
  return `/api/img?s=${encoded}`;
}

function parseMangaData(manga: any): MangaDexManga {
  const attr = manga.attributes || {};
  const relationships = manga.relationships || [];

  const authorRel = extractRelationship(relationships, 'author');
  const authorName = authorRel?.attributes?.name || 'Unknown';

  const artistRel = extractRelationship(relationships, 'artist');
  const artistName = artistRel?.attributes?.name || authorName;

  const coverRel = extractRelationship(relationships, 'cover_art');
  const coverFileName = coverRel?.attributes?.fileName || '';

  const tags = (attr.tags || []).map((t: any) => ({
    id: t.id,
    name: t.attributes?.name?.en || Object.values(t.attributes?.name || {})[0] || 'Unknown',
    group: t.attributes?.group || 'theme',
  }));

  const statusMap: Record<string, string> = {
    ongoing: 'Ongoing',
    completed: 'Completed',
    hiatus: 'Hiatus',
    cancelled: 'Cancelled',
  };

  return {
    id: manga.id,
    title: extractTitle(attr),
    altTitles: extractAltTitles(attr),
    description: extractDescription(attr),
    author: authorName,
    artist: artistName,
    status: statusMap[attr.status] || 'Ongoing',
    year: attr.year || null,
    contentRating: attr.contentRating || 'safe',
    tags,
    coverUrl: buildCoverUrl(manga.id, coverFileName),
    coverFileName,
    originalLanguage: attr.originalLanguage || 'ko',
    lastChapter: attr.lastChapter || '',
    demographicTag: attr.publicationDemographic || '',
  };
}

function parseChapterData(chapter: any): MangaDexChapter {
  const attr = chapter.attributes || {};
  const relationships = chapter.relationships || [];

  const groupRel = extractRelationship(relationships, 'scanlation_group');

  return {
    id: chapter.id,
    title: attr.title || '',
    chapter: attr.chapter || '0',
    volume: attr.volume || null,
    pages: attr.pages || 0,
    publishAt: attr.publishAt || attr.createdAt || new Date().toISOString(),
    scanlationGroup: groupRel?.attributes?.name || 'Unknown Group',
    translatedLanguage: attr.translatedLanguage || 'en',
    externalUrl: attr.externalUrl || null,
  };
}

// ============================================================
// API Functions
// ============================================================

export async function searchManga(query: string, limit: number = 15): Promise<MangaDexManga[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    title: query,
    limit: limit.toString(),
    'includes[]': 'cover_art',
    'order[relevance]': 'desc',
    'contentRating[]': 'safe',
  });
  params.append('includes[]', 'author');

  const response = await rateLimitedFetch(`${BASE_URL}/manga?${params}`, {
    next: { revalidate: 60 },
  });
  const result = await response.json();
  return (result.data || []).map(parseMangaData);
}

export async function getMangaDetails(mangaId: string): Promise<MangaDexManga | null> {
  try {
    const params = new URLSearchParams();
    params.append('includes[]', 'cover_art');
    params.append('includes[]', 'author');
    params.append('includes[]', 'artist');

    const response = await rateLimitedFetch(`${BASE_URL}/manga/${mangaId}?${params}`, {
      next: { revalidate: 1200 },
    });
    const result = await response.json();
    if (!result.data) return null;

    const manga = parseMangaData(result.data);

    // Apply admin overrides if present
    try {
      const { getManhwasAction } = await import('@/lib/actions');
      const localDb = await getManhwasAction();
      const override = localDb.find((m: any) => m.id === mangaId);

      if (override) {
        if (override.title) manga.title = override.title;
        if (override.description) manga.description = override.description;
        if (override.status) manga.status = override.status;
        if (override.cover_image_url && override.cover_image_url.trim() !== '') {
          manga.coverUrl = override.cover_image_url;
        }

        manga.seo_title = override.seo_title;
        manga.seo_description = override.seo_description;
        manga.seo_keywords = override.seo_keywords;
      }
    } catch (dbError) {
      console.error('Error fetching local overrides:', dbError);
    }

    return manga;
  } catch (error) {
    console.error(`Error fetching manga ${mangaId}:`, error);
    return null;
  }
}

export async function getMangaChapters(
  mangaId: string,
  limit: number = 100,
  offset: number = 0
): Promise<{ chapters: MangaDexChapter[]; total: number }> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
    'translatedLanguage[]': 'en',
    'order[chapter]': 'asc',
    'includes[]': 'scanlation_group',
  });

  const response = await rateLimitedFetch(`${BASE_URL}/manga/${mangaId}/feed?${params}`, {
    next: { revalidate: 300 },
  });
  const result = await response.json();
  const chapters = (result.data || []).map(parseChapterData);

  // Deduplicate by chapter number (keep first)
  const seen = new Map<string, MangaDexChapter>();
  for (const ch of chapters) {
    if (!seen.has(ch.chapter)) seen.set(ch.chapter, ch);
  }

  const deduplicated = Array.from(seen.values());
  return { chapters: deduplicated, total: result.total || deduplicated.length };
}

export async function getChapterPages(
  chapterId: string,
  quality: 'data' | 'dataSaver' = 'data'
): Promise<string[]> {
  const response = await rateLimitedFetch(`${BASE_URL}/at-home/server/${chapterId}`, {
    next: { revalidate: 600 },
  });
  const result = await response.json();

  const baseUrl = result.baseUrl;
  const hash = result.chapter?.hash;
  const filenames = quality === 'data' ? result.chapter?.data || [] : result.chapter?.dataSaver || [];

  if (!hash || filenames.length === 0) {
    throw new Error('No pages found for this chapter.');
  }

  const qualityPath = quality === 'data' ? 'data' : 'data-saver';
  return filenames.map((filename: string) => `${baseUrl}/${qualityPath}/${hash}/${filename}`);
}

export async function getPopularManga(limit: number = 20): Promise<MangaDexManga[]> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    'order[followedCount]': 'desc',
    'contentRating[]': 'safe',
    'availableTranslatedLanguage[]': 'en',
  });
  params.append('includes[]', 'cover_art');
  params.append('includes[]', 'author');

  const response = await rateLimitedFetch(`${BASE_URL}/manga?${params}`, {
    next: { revalidate: 900 },
  });
  const result = await response.json();
  return (result.data || []).map(parseMangaData);
}

export async function getRecentlyUpdated(limit: number = 15): Promise<MangaDexManga[]> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    'order[latestUploadedChapter]': 'desc',
    'contentRating[]': 'safe',
    'availableTranslatedLanguage[]': 'en',
    hasAvailableChapters: 'true',
  });
  params.append('includes[]', 'cover_art');
  params.append('includes[]', 'author');

  const response = await rateLimitedFetch(`${BASE_URL}/manga?${params}`, {
    next: { revalidate: 300 },
  });
  const result = await response.json();
  return (result.data || []).map(parseMangaData);
}

export async function getMangaByTags(
  tagIds: string[],
  limit: number = 20,
  order: 'followedCount' | 'latestUploadedChapter' | 'relevance' = 'followedCount'
): Promise<MangaDexManga[]> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    'contentRating[]': 'safe',
    'availableTranslatedLanguage[]': 'en',
    hasAvailableChapters: 'true',
    [`order[${order}]`]: 'desc',
  });

  for (const tagId of tagIds) params.append('includedTags[]', tagId);
  params.append('includes[]', 'cover_art');
  params.append('includes[]', 'author');

  const response = await rateLimitedFetch(`${BASE_URL}/manga?${params}`, {
    next: { revalidate: 600 },
  });
  const result = await response.json();
  return (result.data || []).map(parseMangaData);
}

export async function getAllTags(): Promise<MangaDexTag[]> {
  const response = await rateLimitedFetch(`${BASE_URL}/manga/tag`, {
    next: { revalidate: 86400 },
  });
  const result = await response.json();
  return (result.data || []).map((t: any) => ({
    id: t.id,
    name: t.attributes?.name?.en || Object.values(t.attributes?.name || {})[0] || 'Unknown',
    group: t.attributes?.group || 'theme',
  }));
}

export async function findTagIdsBySlug(slug: string): Promise<string[]> {
  const tags = await getAllTags();

  const slugToMangaDexMap: Record<string, string[]> = {
    action: ['Action'],
    romance: ['Romance'],
    fantasy: ['Fantasy'],
    'martial-arts': ['Martial Arts'],
    murim: ['Martial Arts'],
    'school-life': ['School Life'],
    horror: ['Horror'],
    thriller: ['Thriller'],
    comedy: ['Comedy'],
    isekai: ['Isekai'],
    adventure: ['Adventure'],
    drama: ['Drama'],
    psychological: ['Psychological'],
    mystery: ['Mystery'],
    supernatural: ['Supernatural'],
    'sci-fi': ['Sci-Fi'],
    'slice-of-life': ['Slice of Life'],
    historical: ['Historical'],
    reincarnation: ['Reincarnation'],
    survival: ['Survival'],
    tragedy: ['Tragedy'],
    sports: ['Sports'],
    medical: ['Medical'],
    magic: ['Mahou Shoujo'],
    crime: ['Crime'],
    military: ['Military'],
    'time-travel': ['Time Travel'],
    harem: ['Harem'],
  };

  const targetNames = slugToMangaDexMap[slug] || [slug.replace(/-/g, ' ')];

  return tags
    .filter((t) => targetNames.some((name) => t.name.toLowerCase() === name.toLowerCase()))
    .map((t) => t.id);
}

export async function getKoreanManhwa(limit: number = 20): Promise<MangaDexManga[]> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    'order[followedCount]': 'desc',
    'contentRating[]': 'safe',
    'availableTranslatedLanguage[]': 'en',
    hasAvailableChapters: 'true',
    'originalLanguage[]': 'ko',
  });
  params.append('includes[]', 'cover_art');
  params.append('includes[]', 'author');

  const response = await rateLimitedFetch(`${BASE_URL}/manga?${params}`, {
    next: { revalidate: 900 },
  });
  const result = await response.json();
  return (result.data || []).map(parseMangaData);
}

export async function getChapterContext(chapterId: string): Promise<{
  chapter: MangaDexChapter | null;
  mangaId: string | null;
}> {
  try {
    const params = new URLSearchParams();
    params.append('includes[]', 'scanlation_group');
    params.append('includes[]', 'manga');

    const response = await rateLimitedFetch(`${BASE_URL}/chapter/${chapterId}?${params}`, {
      next: { revalidate: 600 },
    });
    const result = await response.json();
    if (!result.data) return { chapter: null, mangaId: null };

    const chapter = parseChapterData(result.data);
    const mangaRel = extractRelationship(result.data.relationships, 'manga');
    const mangaId = mangaRel?.id || null;

    return { chapter, mangaId };
  } catch (error) {
    console.error(`Error fetching chapter ${chapterId}:`, error);
    return { chapter: null, mangaId: null };
  }
}
