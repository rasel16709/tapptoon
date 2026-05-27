'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroItem {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  tags: { id: string; name: string; group: string }[];
}

export function HeroCarousel({ items }: { items: HeroItem[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (items.length === 0 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length, isPaused]);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % items.length);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden bg-primary pt-12 pb-16 md:pt-16 md:pb-20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#000 2px, transparent 2px)',
          backgroundSize: '30px 30px',
        }}
      />

      <button
        onClick={handlePrev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20 transition-all active:scale-95"
      >
        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
      </button>
      <button
        onClick={handleNext}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20 transition-all active:scale-95"
      >
        <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
      </button>

      <div className="container relative z-10 px-4 md:px-12 mx-auto">
        {items.map((manhwa, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={manhwa.id}
              className={`transition-all duration-700 ease-in-out grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center ${
                isActive
                  ? 'opacity-100 translate-x-0 relative'
                  : 'opacity-0 absolute inset-0 pointer-events-none translate-x-full'
              }`}
            >
              {isActive && (
                <>
                  <div className="flex flex-col justify-center space-y-6 text-white min-h-[280px] md:min-h-[420px]">
                    <div className="space-y-4">
                      <div className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm font-semibold backdrop-blur-sm">
                        <Sparkles className="w-4 h-4 mr-1.5" />
                        Popular #{idx + 1}
                      </div>
                      <h1 className="text-4xl font-black tracking-tight sm:text-6xl xl:text-7xl drop-shadow-md leading-none">
                        {manhwa.title}
                      </h1>
                      <p className="max-w-[600px] text-white/90 md:text-xl font-medium leading-relaxed drop-shadow line-clamp-3">
                        {manhwa.description}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {manhwa.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag.id}
                            className="text-xs font-bold bg-white/15 text-white/90 px-2.5 py-1 rounded-full backdrop-blur-sm"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 min-[400px]:flex-row">
                      <Link href={`/manhwa/${manhwa.id}`}>
                        <Button
                          size="lg"
                          variant="secondary"
                          className="w-full min-[400px]:w-auto font-bold rounded-full text-primary px-8 hover:scale-105 transition-transform shadow-xl"
                        >
                          READ NOW
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="hidden lg:flex items-center justify-center">
                    <div className="relative w-[320px] h-[450px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-white/20 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                      <Image
                        src={manhwa.coverUrl}
                        alt={manhwa.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 320px"
                        className="object-cover"
                        priority={idx === 0}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              idx === currentSlide ? 'w-8 bg-white' : 'w-2.5 bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
