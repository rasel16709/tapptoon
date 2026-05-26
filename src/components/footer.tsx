import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white text-gray-600">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* Logo & Description */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="inline-block">
              <img 
                src="/tapytoonlogo.svg" 
                alt="Tappytoon.org Logo" 
                className="h-8 w-auto object-contain" 
              />
            </Link>
            <p className="text-sm font-medium leading-relaxed text-gray-500">
              Your favorite destination for reading the best webtoons and manhwas. Discover new worlds, epic battles, and beautiful romances every single day.
            </p>
          </div>

          {/* Genres Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-black">Genres</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <Link href="/genres/action" className="hover:text-primary transition-colors">Action</Link>
              </li>
              <li>
                <Link href="/genres/romance" className="hover:text-primary transition-colors">Romance</Link>
              </li>
              <li>
                <Link href="/genres/fantasy" className="hover:text-primary transition-colors">Fantasy</Link>
              </li>
              <li>
                <Link href="/genres/murim" className="hover:text-primary transition-colors">Murim</Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-black">Originals</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <Link href="/popular" className="hover:text-primary transition-colors">Trending Now</Link>
              </li>
              <li>
                <Link href="/genres" className="hover:text-primary transition-colors">All Genres</Link>
              </li>
            </ul>
          </div>

          {/* Socials & Help */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-black">Follow Us</h4>
            <div className="flex space-x-4">
              {/* Facebook SVG */}
              <a href="#" className="p-2 bg-gray-100 hover:bg-green-50 text-gray-600 hover:text-primary rounded-full transition-all">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* Twitter SVG */}
              <a href="#" className="p-2 bg-gray-100 hover:bg-green-50 text-gray-600 hover:text-primary rounded-full transition-all">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              {/* Instagram SVG */}
              <a href="#" className="p-2 bg-gray-100 hover:bg-green-50 text-gray-600 hover:text-primary rounded-full transition-all">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
            <div className="pt-2 flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-primary cursor-pointer transition-colors">
              <HelpCircle className="w-4 h-4" />
              <span>Need Help? Contact Support</span>
            </div>
          </div>

        </div>

        <div className="mt-12 border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-gray-400">
          <p>© {new Date().getFullYear()} Tappytoon.org. All rights reserved.</p>
          <div className="flex space-x-4 md:space-x-6">
            <Link href="/dmca" className="hover:text-primary transition-colors">DMCA & Copyright</Link>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
