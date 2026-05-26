import { type NextRequest } from 'next/server';
import { getChapterPages } from '@/lib/mangadex';

/**
 * Chapter Pages API
 * Fetches page image URLs for a chapter.
 * Returns proxied URLs so the frontend can display them.
 * 
 * Usage: GET /api/manga/chapter-pages?id=<chapter_uuid>
 */

// Chapter page URLs from MangaDex @Home are valid for ~15 minutes
export const revalidate = 600;

export async function GET(request: NextRequest) {
  const chapterId = request.nextUrl.searchParams.get('id');

  if (!chapterId) {
    return Response.json({ error: 'Missing chapter ID' }, { status: 400 });
  }

  try {
    const rawPages = await getChapterPages(chapterId, 'data');
    
    // Convert to proxied URLs with base64 encoding
    const pages = rawPages.map(url => {
      const encoded = Buffer.from(url).toString('base64');
      return `/api/img?s=${encoded}`;
    });

    return Response.json({ pages, total: pages.length });
  } catch (error: any) {
    console.error('Chapter pages error:', error);
    return Response.json(
      { pages: [], error: error.message || 'Failed to fetch chapter pages' }, 
      { status: 500 }
    );
  }
}
