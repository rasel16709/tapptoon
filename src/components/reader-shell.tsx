'use client';

import Link from 'next/link';
import { ArrowLeft, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VerticalImageReader } from '@/components/vertical-image-reader';

interface ChapterRef {
  id: string;
  chapter: string;
  title?: string;
}

interface ReaderShellProps {
  mangaId: string;
  mangaTitle: string;
  chapterNumber: string;
  chapterTitle: string;
  scanlationGroup: string;
  externalUrl: string | null;
  pages: string[];
  prevChapter: ChapterRef | null;
  nextChapter: ChapterRef | null;
}

export function ReaderShell({
  mangaId,
  mangaTitle,
  chapterNumber,
  chapterTitle,
  scanlationGroup,
  externalUrl,
  pages,
  prevChapter,
  nextChapter,
}: ReaderShellProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-white/95 backdrop-blur shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link href={mangaId ? `/manhwa/${mangaId}` : '/'}>
            <Button variant="ghost" size="icon" className="hover:bg-gray-100 text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold leading-tight text-black">{mangaTitle || 'Reading'}</h1>
            <p className="text-sm font-medium text-gray-500">
              {chapterTitle ? `Ch. ${chapterNumber}: ${chapterTitle}` : `Chapter ${chapterNumber}`}
            </p>
          </div>
        </div>
        {scanlationGroup && (
          <span className="hidden sm:block text-[10px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            Translated by: {scanlationGroup}
          </span>
        )}
      </header>

      <main className="flex-1 w-full flex justify-center bg-gray-50 py-4 pb-28">
        {pages.length > 0 ? (
          <VerticalImageReader imageUrls={pages} />
        ) : externalUrl ? (
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center max-w-md mx-auto gap-6">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">External Chapter</h2>
            <p className="text-gray-500 font-medium leading-relaxed">
              This chapter is hosted on an official publisher&apos;s website. You can read it directly from their platform.
            </p>
            <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="w-full mt-2">
              <Button className="w-full rounded-full font-bold h-12 text-base shadow-lg shadow-primary/20">
                Read Official Release
              </Button>
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <AlertCircle className="w-12 h-12 text-gray-300" />
            <p className="text-gray-500 font-medium text-lg">No pages found for this chapter.</p>
          </div>
        )}
      </main>

      <footer className="fixed bottom-6 md:bottom-8 w-full flex justify-center gap-2 md:gap-4 z-40 px-4">
        {prevChapter ? (
          <Link href={`/read/${prevChapter.id}?manga=${mangaId}`}>
            <Button
              variant="secondary"
              className="shadow-2xl font-bold bg-white text-gray-800 hover:bg-gray-100 rounded-full px-4 py-4 md:px-6 md:py-5 border text-xs md:text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
          </Link>
        ) : (
          <Button
            variant="secondary"
            disabled
            className="shadow-2xl font-bold rounded-full px-4 py-4 md:px-6 md:py-5 opacity-50 cursor-not-allowed bg-gray-200 text-gray-400 text-xs md:text-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            First
          </Button>
        )}

        {nextChapter ? (
          <Link href={`/read/${nextChapter.id}?manga=${mangaId}`}>
            <Button className="shadow-2xl font-bold bg-primary text-white hover:bg-primary/90 rounded-full px-5 py-4 md:px-8 md:py-5 text-xs md:text-sm">
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        ) : (
          <Link href={mangaId ? `/manhwa/${mangaId}` : '/'}>
            <Button className="shadow-2xl font-bold bg-gray-800 text-white hover:bg-gray-900 rounded-full px-5 py-4 md:px-8 md:py-5 text-xs md:text-sm">
              Back to Details
            </Button>
          </Link>
        )}
      </footer>
    </div>
  );
}
