import { getCategoriesAction } from './actions';

export interface ScrapedManhwa {
  title: string;
  author: string;
  description: string;
  cover_image_url: string;
  status: 'Ongoing' | 'Completed';
  categories: string[];
  source_id?: string;
}

export interface ScrapedChapter {
  title: string;
  chapter_number: number;
  pdf_urls: string[];
  images?: string[];
  source_chapter_uuid?: string;
  published_date: string;
}

async function mapCategories(scrapedGenres: string[]): Promise<string[]> {
  const localCategories = await getCategoriesAction();
  const matchedSlugs: string[] = [];

  for (const genre of scrapedGenres) {
    const normalized = genre
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');

    const found = localCategories.find(
      (c: any) => c.slug === normalized || c.name.toLowerCase() === genre.toLowerCase()
    );
    if (found) {
      matchedSlugs.push(found.slug);
    } else if (normalized === 'martial-art' || normalized === 'martial-arts') {
      matchedSlugs.push('martial-arts');
    } else if (normalized === 'reincarnation' || normalized === 'reborn') {
      matchedSlugs.push('reincarnation');
    } else if (normalized === 'web-comic' || normalized === 'long-strip') {
      matchedSlugs.push('webtoon');
    }
  }

  return Array.from(new Set(matchedSlugs));
}

export async function scrapeMangaDex(url: string): Promise<ScrapedManhwa> {
  const uuidMatch = url.match(/\/title\/([a-f0-9-]{36})/i);
  if (!uuidMatch) {
    throw new Error('Invalid MangaDex URL format. Must contain a 36-character UUID.');
  }
  const uuid = uuidMatch[1];

  const response = await fetch(
    `https://api.mangadex.org/manga/${uuid}?includes[]=cover_art&includes[]=author`
  );
  if (!response.ok) {
    throw new Error(`Failed to query MangaDex API: HTTP ${response.status}`);
  }

  const result = await response.json();
  const manga = result.data;
  if (!manga) {
    throw new Error('Manga details not found on MangaDex API.');
  }

  const attributes = manga.attributes || {};

  const title =
    attributes.title?.en || (Object.values(attributes.title || {})[0] as string) || 'Untitled';
  const description =
    attributes.description?.en ||
    (Object.values(attributes.description || {})[0] as string) ||
    'No description available.';
  const mdStatus = (attributes.status || '').toLowerCase();
  const status: 'Ongoing' | 'Completed' = mdStatus === 'completed' ? 'Completed' : 'Ongoing';

  const authorRelationship = (manga.relationships || []).find((r: any) => r.type === 'author');
  const author = authorRelationship?.attributes?.name || 'Unknown';

  const coverRelationship = (manga.relationships || []).find((r: any) => r.type === 'cover_art');
  const fileName = coverRelationship?.attributes?.fileName;
  const cover_image_url = fileName
    ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}`
    : 'https://placehold.co/400x600?text=No+Cover';

  const tags = (attributes.tags || [])
    .map((t: any) => t.attributes?.name?.en)
    .filter(Boolean);
  const categories = await mapCategories(tags);

  return {
    title,
    author,
    description,
    cover_image_url,
    status,
    categories,
    source_id: manga.id,
  };
}

export async function fetchMangaDexChapters(uuid: string): Promise<ScrapedChapter[]> {
  const response = await fetch(
    `https://api.mangadex.org/manga/${uuid}/feed?limit=100&translatedLanguage[]=en&order[chapter]=asc`
  );
  if (!response.ok) {
    throw new Error(`Failed to query MangaDex Chapters API: HTTP ${response.status}`);
  }

  const result = await response.json();
  const chapters = result.data || [];

  return chapters.map((c: any) => {
    const attr = c.attributes || {};
    const chNum = parseFloat(attr.chapter || '1');
    const title = attr.title ? `Chapter ${chNum}: ${attr.title}` : `Chapter ${chNum}`;

    return {
      title,
      chapter_number: isNaN(chNum) ? 1 : chNum,
      pdf_urls: [],
      images: [],
      source_chapter_uuid: c.id,
      published_date: attr.publishAt || new Date().toISOString(),
    };
  });
}

export async function fetchMangaDexChapterPages(chapterUuid: string): Promise<string[]> {
  const response = await fetch(`https://api.mangadex.org/at-home/server/${chapterUuid}`);
  if (!response.ok) {
    throw new Error(`Failed to query MangaDex @Home server: HTTP ${response.status}`);
  }

  const result = await response.json();
  const hash = result.chapter?.hash;
  const filenames = result.chapter?.data || [];
  const baseUrl = result.baseUrl || 'https://uploads.mangadex.org';

  if (!hash || filenames.length === 0) {
    throw new Error('No pages or hash returned from MangaDex server.');
  }

  return filenames.map((filename: string) => `${baseUrl}/data/${hash}/${filename}`);
}

export async function scrapeChapters(url: string): Promise<ScrapedChapter[]> {
  if (!url.includes('mangadex.org')) {
    throw new Error('Unsupported URL for chapters syncing.');
  }
  const uuidMatch = url.match(/\/title\/([a-f0-9-]{36})/i);
  if (!uuidMatch) throw new Error('Invalid MangaDex URL format.');
  return fetchMangaDexChapters(uuidMatch[1]);
}
