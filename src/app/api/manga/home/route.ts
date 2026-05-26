import { type NextRequest } from 'next/server';
import { 
  getPopularManga, 
  getRecentlyUpdated, 
  getMangaByTags, 
  findTagIdsBySlug 
} from '@/lib/mangadex';

/**
 * Homepage Sections API
 * Returns manga for different homepage sections.
 * 
 * Usage: GET /api/manga/home?section=popular|recent|action|romance
 */

// Revalidate at most every 5 minutes — sections refresh infrequently
export const revalidate = 300;

export async function GET(request: NextRequest) {
  const section = request.nextUrl.searchParams.get('section') || 'popular';

  try {
    let results: any[] = [];

    switch (section) {
      case 'featured': {
        const { getManhwasAction } = await import('@/lib/actions');
        const localManhwas = await getManhwasAction();
        // Map local format to MangaDexManga format so frontend components don't break
        results = localManhwas.map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          author: m.author,
          coverUrl: m.cover_image_url,
          status: m.status,
          tags: m.categories?.map((c: string) => ({ id: c, name: c, group: 'genre' })) || [],
          seo_title: m.seo_title,
          seo_description: m.seo_description,
          seo_keywords: m.seo_keywords
        }));
        break;
      }
      
      case 'popular':
        results = await getPopularManga(20);
        break;
      
      case 'recent':
        results = await getRecentlyUpdated(15);
        break;
      
      case 'action': {
        const actionTagIds = await findTagIdsBySlug('action');
        const martialArtsTagIds = await findTagIdsBySlug('martial-arts');
        const allTagIds = [...actionTagIds, ...martialArtsTagIds].filter(Boolean);
        if (allTagIds.length > 0) {
          results = await getMangaByTags([allTagIds[0]], 15); // Use first tag to avoid over-filtering
        }
        break;
      }
      
      case 'romance': {
        const romanceTagIds = await findTagIdsBySlug('romance');
        if (romanceTagIds.length > 0) {
          results = await getMangaByTags(romanceTagIds, 15);
        }
        break;
      }
      
      default:
        results = await getPopularManga(20);
    }

    return Response.json({ results });
  } catch (error: any) {
    console.error(`Home section "${section}" error:`, error);
    return Response.json({ results: [], error: error.message }, { status: 500 });
  }
}
