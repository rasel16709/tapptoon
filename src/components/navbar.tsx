'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, Loader2, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface SearchResult {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  status: string;
  tags: string[];
}

export function Navbar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(async (searchQuery: string, signal: AbortSignal) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/manga/search?q=${encodeURIComponent(searchQuery)}&limit=8`,
        { signal }
      );
      if (!response.ok) return;
      const data = await response.json();
      if (signal.aborted) return;
      setResults(data.results || []);
      setIsOpen(true);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Search error:', err);
    } finally {
      if (!signal.aborted) setIsSearching(false);
    }
  }, []);

  // Debounce query changes + cancel any in-flight request
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    if (query.trim() === '') {
      setResults([]);
      setIsOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const controller = new AbortController();
    abortRef.current = controller;

    debounceRef.current = setTimeout(() => {
      performSearch(query, controller.signal);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      controller.abort();
    };
  }, [query, performSearch]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = () => {
    setQuery('');
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container relative flex h-16 max-w-screen-2xl items-center px-4 mx-auto justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger 
                render={<Button variant="ghost" size="icon" className="text-black hover:bg-gray-100" />}
              >
                <Menu className="w-6 h-6" />
                <span className="sr-only">Toggle Menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] p-6 bg-white">
                <SheetHeader className="text-left mb-8">
                  <SheetTitle className="font-black text-2xl text-primary tracking-tighter">
                    <Image 
                      src="/tapytoonlogo.svg" 
                      alt="Tappytoon.org Logo" 
                      width={120}
                      height={32}
                      className="h-8 w-auto object-contain" 
                    />
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-6">
                  <Link href="/" className="text-lg font-bold text-gray-900 hover:text-primary transition-colors">
                    HOME
                  </Link>
                  <Link href="/genres" className="text-lg font-bold text-gray-900 hover:text-primary transition-colors">
                    GENRES
                  </Link>
                  <Link href="/popular" className="text-lg font-bold text-gray-900 hover:text-primary transition-colors">
                    POPULAR
                  </Link>
                  <div className="pt-6 border-t border-gray-100 flex flex-col space-y-4">
                    <Link href="/dmca" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">
                      DMCA & Copyright
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/tapytoonlogo.svg" 
              alt="Tappytoon.org Logo" 
              width={120}
              height={32}
              className="h-8 w-auto object-contain" 
              priority
            />
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-bold absolute left-1/2 transform -translate-x-1/2">
          <Link href="/" className="transition-colors hover:text-primary text-black">
            HOME
          </Link>
          <Link href="/genres" className="transition-colors hover:text-primary text-gray-600">
            GENRES
          </Link>
          <Link href="/popular" className="transition-colors hover:text-primary text-gray-600">
            POPULAR
          </Link>
        </nav>

        {/* Live Search Container */}
        <div className="flex items-center gap-4 relative" ref={searchRef}>
          <div className="flex items-center relative">
            {isSearching ? (
              <Loader2 className="w-4 h-4 absolute left-3 text-primary animate-spin" />
            ) : (
              <Search className="w-4 h-4 absolute left-3 text-gray-400" />
            )}
            <Input 
              type="text" 
              placeholder="Search manhwa..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim() !== '' && results.length > 0 && setIsOpen(true)}
              className="pl-9 pr-8 w-[160px] sm:w-[200px] md:w-[300px] bg-gray-100 border-transparent focus-visible:ring-primary rounded-full h-9 transition-all"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Floating Dropdown Results */}
          {isOpen && (
            <div className="absolute top-11 right-0 w-[280px] sm:w-[320px] md:w-[360px] bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
                {results.length > 0 ? (
                  results.map((manga) => (
                    <Link 
                      href={`/manhwa/${manga.id}`} 
                      key={manga.id}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 p-3 hover:bg-green-50/50 transition-colors"
                    >
                      <div className="relative w-10 h-14 rounded overflow-hidden shrink-0 border border-gray-100">
                        <Image
                          src={manga.coverUrl}
                          alt={manga.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-primary transition-colors">
                          {manga.title}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium truncate mt-0.5">{manga.author}</p>
                        <div className="flex gap-1 mt-1">
                          {manga.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[9px] font-bold text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm font-medium text-gray-500">
                    {isSearching ? 'Searching...' : `No results found for "${query}"`}
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-gray-100 bg-gray-50 text-center rounded-b-xl">
                <p className="text-[9px] font-semibold text-gray-400 text-center">Tappytoon.org Search</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
