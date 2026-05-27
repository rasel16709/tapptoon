'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function VerticalImageReader({ imageUrls }: { imageUrls: string[] }) {
  const [width, setWidth] = useState<number>(800);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Adjust width to scale responsively for mobile and desktop screens
    const updateWidth = () => {
      setWidth(Math.min(window.innerWidth, 800)); // Max width 800px for desktop reading comfort
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleImageLoad = (idx: number) => {
    setLoadedImages(prev => new Set(prev).add(idx));
  };

  const handleImageError = (idx: number) => {
    setFailedImages(prev => new Set(prev).add(idx));
  };

  return (
    <div 
      className="flex flex-col items-center w-full bg-gray-50 min-h-screen select-none relative"
      onContextMenu={(e) => e.preventDefault()} // Block mouse right-clicking
    >
      {/* CSS-only security overlay — does NOT block touch scrolling */}
      <div 
        className="absolute inset-0 z-40 bg-transparent cursor-default pointer-events-none"
        style={{ 
          WebkitTouchCallout: 'none',
          userSelect: 'none',
        }}
        onDragStart={(e) => e.preventDefault()}
      />

      <div 
        className="flex flex-col items-center z-10 w-full bg-white shadow-sm border-x border-gray-200" 
        style={{ maxWidth: `${width}px` }}
      >
        {imageUrls.map((url, idx) => (
          <div key={idx} className="relative w-full mb-[-1px] select-none bg-gray-50 min-h-[200px] flex items-center justify-center">
            {/* Loading indicator */}
            {!loadedImages.has(idx) && !failedImages.has(idx) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <span className="text-xs text-gray-400 font-medium mt-2">Page {idx + 1}</span>
              </div>
            )}
            
            {/* Error state */}
            {failedImages.has(idx) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
                <p className="text-sm text-gray-400 font-medium">Failed to load page {idx + 1}</p>
                <button 
                  onClick={() => {
                    setFailedImages(prev => {
                      const next = new Set(prev);
                      next.delete(idx);
                      return next;
                    });
                  }}
                  className="mt-2 text-xs text-primary font-bold hover:underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Standard img automatically scales heights proportionally for vertical strip panels */}
            {!failedImages.has(idx) && (
              <img 
                src={url} 
                alt={`Comic Page ${idx + 1}`}
                className={`w-full h-auto object-contain pointer-events-none transition-opacity duration-300 ${loadedImages.has(idx) ? 'opacity-100' : 'opacity-0'}`}
                style={{ 
                  userSelect: 'none', 
                  WebkitUserSelect: 'none', 
                  pointerEvents: 'none' 
                }}
                onDragStart={(e) => e.preventDefault()}
                onLoad={() => handleImageLoad(idx)}
                onError={() => handleImageError(idx)}
                loading={idx < 3 ? "eager" : "lazy"} // Eager load first 3 pages, lazy load the rest for performance
              />
            )}
          </div>
        ))}

        {/* End of chapter notice */}
        <div className="w-full py-12 bg-gray-50 text-center border-t border-gray-200">
          <p className="text-gray-400 font-bold text-sm">— End of Chapter —</p>
          <p className="text-[10px] text-gray-300 font-medium mt-1">Thank you for reading on Tappytoon.org!</p>
        </div>
      </div>
    </div>
  );
}
export default VerticalImageReader;
