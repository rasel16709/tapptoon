import { type NextRequest } from 'next/server';
import { getChapterContext, getMangaDetails, getMangaChapters } from '@/lib/mangadex';

/**
 * Chapter Context API
 * Returns chapter info, manga title, and prev/next chapter for navigation.
 * 
 * Usage: GET /api/manga/chapter-context?id=<chapter_uuid>&manga=<manga_uuid>
 */

export const revalidate = 300;

export async function GET(request: NextRequest) {
  const chapterId = request.nextUrl.searchParams.get('id');
  const mangaIdParam = request.nextUrl.searchParams.get('manga');

  if (!chapterId) {
    return Response.json({ error: 'Missing chapter ID' }, { status: 400 });
  }

  try {
    // Get chapter info + manga ID
    const context = await getChapterContext(chapterId);
    const mangaId = mangaIdParam || context.mangaId || '';
    
    let mangaTitle = '';
    let chapters: any[] = [];
    let prevChapter = null;
    let nextChapter = null;

    if (mangaId) {
      // Get manga title
      const manga = await getMangaDetails(mangaId);
      mangaTitle = manga?.title || '';

      // Get all chapters for prev/next navigation
      const chaptersData = await getMangaChapters(mangaId, 500);
      chapters = chaptersData.chapters;

      // Find current chapter index
      const currentIndex = chapters.findIndex(c => c.id === chapterId);
      if (currentIndex > 0) {
        prevChapter = { id: chapters[currentIndex - 1].id, chapter: chapters[currentIndex - 1].chapter, title: chapters[currentIndex - 1].title };
      }
      if (currentIndex < chapters.length - 1 && currentIndex !== -1) {
        nextChapter = { id: chapters[currentIndex + 1].id, chapter: chapters[currentIndex + 1].chapter, title: chapters[currentIndex + 1].title };
      }
    }

    return Response.json({
      chapter: context.chapter,
      mangaId,
      mangaTitle,
      prevChapter,
      nextChapter,
      totalChapters: chapters.length,
    });
  } catch (error: any) {
    console.error('Chapter context error:', error);
    return Response.json(
      { chapter: null, mangaId: '', mangaTitle: '', error: error.message }, 
      { status: 500 }
    );
  }
}
