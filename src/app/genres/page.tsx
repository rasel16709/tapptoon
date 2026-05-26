import Link from 'next/link';
import { getAllTags, type MangaDexTag } from '@/lib/mangadex';
import { Layers, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Genres - Manhwa & Manga | Tappytoon',
  description: 'Browse thousands of manhwa and manga by genre. Action, Romance, Fantasy, Horror, Comedy and more - all free to read on Tappytoon.org.',
  keywords: 'manga genres, manhwa genres, action manga, romance manhwa, fantasy webtoon',
  alternates: { canonical: '/genres' },
};

// Colors for genre cards
const genreColors = [
  'from-red-500 to-orange-500',
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-yellow-500',
  'from-pink-500 to-rose-500',
  'from-indigo-500 to-blue-500',
  'from-cyan-500 to-emerald-500',
  'from-orange-500 to-red-500',
  'from-violet-500 to-purple-500',
  'from-teal-500 to-green-500',
  'from-rose-500 to-pink-500',
];

// Emoji icons for genres
const genreEmoji: Record<string, string> = {
  'Action': '⚔️',
  'Romance': '💕',
  'Fantasy': '🧙',
  'Horror': '👻',
  'Comedy': '😂',
  'Drama': '🎭',
  'Adventure': '🗺️',
  'Mystery': '🔍',
  'Thriller': '😱',
  'Sci-Fi': '🚀',
  'Slice of Life': '🌸',
  'Martial Arts': '🥋',
  'Supernatural': '👁️',
  'Psychological': '🧠',
  'Historical': '🏰',
  'Tragedy': '💔',
  'Sports': '⚽',
  'Isekai': '🌀',
  'Mecha': '🤖',
  'Crime': '🔫',
  'Military': '🎖️',
  'Medical': '🏥',
  'Survival': '🏕️',
  'School Life': '🎒',
  'Harem': '👥',
  'Reincarnation': '🔄',
};

export default async function GenresPage() {
  let allTags: MangaDexTag[] = [];
  
  try {
    allTags = await getAllTags();
  } catch (error) {
    console.error('Error fetching tags:', error);
  }

  // Filter to show only genre and theme tags
  const genreTags = allTags.filter(t => t.group === 'genre' || t.group === 'theme');

  // Sort alphabetically
  const sortedTags = genreTags.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <Layers className="w-4 h-4" />
            Browse by Genre
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            Explore All Genres
          </h1>
          <p className="text-gray-500 font-medium mt-3 max-w-lg mx-auto">
            Discover thousands of manga and manhwa across {sortedTags.length} genres on Tappytoon.org.
          </p>
        </div>

        {/* Genre Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sortedTags.map((tag, i) => {
            const slug = tag.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const colorClass = genreColors[i % genreColors.length];
            const emoji = genreEmoji[tag.name] || '📚';
            
            return (
              <Link
                key={tag.id}
                href={`/genres/${tag.id}?name=${encodeURIComponent(tag.name)}`}
                className="group"
              >
                <div className={`bg-gradient-to-br ${colorClass} rounded-2xl p-5 text-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}>
                  <div className="absolute top-1 right-1 text-3xl opacity-20 group-hover:opacity-40 transition-opacity">
                    {emoji}
                  </div>
                  <div className="relative z-10">
                    <span className="text-2xl mb-2 block">{emoji}</span>
                    <h3 className="font-black text-base tracking-tight">{tag.name}</h3>
                    <div className="flex items-center gap-1 mt-2 opacity-70 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold">Browse</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {sortedTags.length === 0 && (
          <div className="py-20 text-center text-gray-500 font-medium">
            Loading genres...
          </div>
        )}
      </div>
    </div>
  );
}
