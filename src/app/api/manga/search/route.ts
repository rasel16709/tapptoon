import { type NextRequest } from 'next/server';
import { searchManga } from '@/lib/mangadex';

/**
 * Manga Search API Route
 * Searches MangaDex for manga/manhwa titles.
 * 
 * Usage: GET /api/manga/search?q=solo+leveling&limit=10
 */

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') || '';
  const limitStr = request.nextUrl.searchParams.get('limit') || '10';
  const limit = Math.min(parseInt(limitStr, 10) || 10, 25);

  if (!query.trim()) {
    return Response.json({ results: [] });
  }

  try {
    const results = await searchManga(query, limit);
    
    // Return simplified results for the search dropdown
    const simplified = results.map(manga => ({
      id: manga.id,
      title: manga.title,
      author: manga.author,
      coverUrl: manga.coverUrl,
      status: manga.status,
      tags: manga.tags.slice(0, 3).map(t => t.name),
    }));

    return Response.json({ results: simplified });
  } catch (error: any) {
    console.error('Search API error:', error);
    return Response.json(
      { results: [], error: 'Search failed. Please try again.' }, 
      { status: 500 }
    );
  }
}
