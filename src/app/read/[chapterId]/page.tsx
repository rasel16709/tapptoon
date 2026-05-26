import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getChapterContext,
  getChapterPages,
  getMangaChapters,
  getMangaDetails,
} from '@/lib/mangadex';
import { ReaderShell } from '@/components/reader-shell';

export const revalidate = 300;

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

interface PageProps {
  params: Promise<{ chapterId: string }>;
  searchParams: Promise<{ manga?: string }>;
}

export default async function ReadChapterPage({ params, searchParams }: PageProps) {
  const { chapterId } = await params;
  const { manga: mangaFromQuery } = await searchParams;

  const context = await getChapterContext(chapterId);
  const mangaId = mangaFromQuery || context.mangaId || '';

  if (!context.chapter || !mangaId) {
    notFound();
  }

  const [manga, chaptersData] = await Promise.all([
    getMangaDetails(mangaId),
    getMangaChapters(mangaId, 500),
  ]);

  const chapters = chaptersData.chapters;
  const currentIndex = chapters.findIndex((c) => c.id === chapterId);
  const prevChapter =
    currentIndex > 0
      ? {
          id: chapters[currentIndex - 1].id,
          chapter: chapters[currentIndex - 1].chapter,
          title: chapters[currentIndex - 1].title,
        }
      : null;
  const nextChapter =
    currentIndex !== -1 && currentIndex < chapters.length - 1
      ? {
          id: chapters[currentIndex + 1].id,
          chapter: chapters[currentIndex + 1].chapter,
          title: chapters[currentIndex + 1].title,
        }
      : null;

  let pages: string[] = [];
  if (!context.chapter.externalUrl) {
    try {
      const rawPages = await getChapterPages(chapterId, 'data');
      pages = rawPages.map((url) => `/api/img?s=${Buffer.from(url).toString('base64')}`);
    } catch (err) {
      console.error('Failed to load chapter pages:', err);
    }
  }

  return (
    <ReaderShell
      mangaId={mangaId}
      mangaTitle={manga?.title || ''}
      chapterNumber={context.chapter.chapter}
      chapterTitle={context.chapter.title}
      scanlationGroup={context.chapter.scanlationGroup}
      externalUrl={context.chapter.externalUrl || null}
      pages={pages}
      prevChapter={prevChapter}
      nextChapter={nextChapter}
    />
  );
}
