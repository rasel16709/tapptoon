-- Disable RLS for all tables (Since there is no User Login/Authentication in the project)

-- 1. Create 'categories' table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE
);

-- 2. Create 'manhwas' table (for Editor's Choice and SEO overrides)
CREATE TABLE IF NOT EXISTS public.manhwas (
    id TEXT PRIMARY KEY, -- This will store the MangaDex UUID
    title TEXT NOT NULL,
    author TEXT,
    description TEXT,
    cover_image_url TEXT,
    status TEXT,
    categories TEXT[], -- Array of category slugs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT
);

-- 3. Create 'chapters' table (for manual chapter uploads)
CREATE TABLE IF NOT EXISTS public.chapters (
    id TEXT PRIMARY KEY,
    manhwa_id TEXT NOT NULL REFERENCES public.manhwas(id) ON DELETE CASCADE,
    title TEXT,
    chapter_number NUMERIC,
    pdf_urls TEXT[], -- Array of PDF file paths
    images TEXT[], -- Array of image URLs
    source_chapter_uuid TEXT,
    published_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set permissions (Allow completely anonymous access since the admin panel has no login)
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.manhwas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters DISABLE ROW LEVEL SECURITY;
