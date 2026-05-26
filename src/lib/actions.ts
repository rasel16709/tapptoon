'use server';

import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/supabase/server';
import { scrapeMangaDex, scrapeChapters, fetchMangaDexChapterPages } from './scraper';

// ==============================================
// Categories Actions
// ==============================================
export async function getCategoriesAction() {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) {
    console.error('Error fetching categories from Supabase:', error);
    return [];
  }
  return data || [];
}

export async function saveCategoriesAction(categories: any[]) {
  await requireAdmin();
  const { error } = await supabase.from('categories').upsert(categories, { onConflict: 'id' });
  if (error) {
    console.error('Error saving categories to Supabase:', error);
  }
  return await getCategoriesAction();
}

// ==============================================
// Manhwas Actions
// ==============================================
export async function getManhwasAction() {
  const { data, error } = await supabase.from('manhwas').select('*');
  if (error) {
    console.error('Error fetching manhwas from Supabase:', error);
    return [];
  }
  return data || [];
}

export async function saveManhwasAction(manhwas: any[]) {
  await requireAdmin();

  const existing = await getManhwasAction();
  const existingIds = existing.map((m: any) => m.id);
  const newIds = manhwas.map((m: any) => m.id);
  const toDelete = existingIds.filter((id: string) => !newIds.includes(id));

  if (toDelete.length > 0) {
    await supabase.from('manhwas').delete().in('id', toDelete);
  }

  if (manhwas.length > 0) {
    const { error } = await supabase.from('manhwas').upsert(manhwas, { onConflict: 'id' });
    if (error) {
      console.error('Error saving manhwas to Supabase:', error);
    }
  }

  return await getManhwasAction();
}

// ==============================================
// Chapters Actions
// ==============================================
export async function getChaptersAction() {
  const { data, error } = await supabase.from('chapters').select('*');
  if (error) {
    console.error('Error fetching chapters from Supabase:', error);
    return [];
  }
  return data || [];
}

export async function saveChaptersAction(chapters: any[]) {
  await requireAdmin();

  const existing = await getChaptersAction();
  const existingIds = existing.map((c: any) => c.id);
  const newIds = chapters.map((c: any) => c.id);
  const toDelete = existingIds.filter((id: string) => !newIds.includes(id));

  if (toDelete.length > 0) {
    await supabase.from('chapters').delete().in('id', toDelete);
  }

  if (chapters.length > 0) {
    const { error } = await supabase.from('chapters').upsert(chapters, { onConflict: 'id' });
    if (error) {
      console.error('Error saving chapters to Supabase:', error);
    }
  }

  return await getChaptersAction();
}

// ==============================================
// Scraper/Importer Actions
// ==============================================
export async function importManhwaAction(sourceUrl: string) {
  await requireAdmin();

  try {
    if (!sourceUrl.includes('mangadex.org')) {
      throw new Error('Unsupported URL format. Please paste a valid MangaDex link.');
    }

    const scrapedData = await scrapeMangaDex(sourceUrl);

    const seo_title = `${scrapedData.title} - Read ${scrapedData.title} Manhwa Online Free`;
    const seo_description = `Read ${scrapedData.title} Manhwa Online. ${scrapedData.description.substring(0, 140)}... Updated daily.`;

    const keywordsArray = [
      scrapedData.title.toLowerCase(),
      `read ${scrapedData.title.toLowerCase()}`,
      `free ${scrapedData.title.toLowerCase()}`,
      'manhwa',
      'webtoon',
    ];
    const seo_keywords = keywordsArray.join(', ');

    return {
      ...scrapedData,
      seo_title,
      seo_description,
      seo_keywords,
    };
  } catch (error: any) {
    console.error('Error during manhwa import action:', error);
    throw new Error(error.message || 'Scraping failed.');
  }
}

export async function importChaptersAction(manhwaId: string, sourceUrl: string) {
  await requireAdmin();

  try {
    const scrapedChapters = await scrapeChapters(sourceUrl);
    if (!scrapedChapters || scrapedChapters.length === 0) {
      throw new Error('No chapters found to import from this source.');
    }

    const { data: existingChapters, error: fetchError } = await supabase
      .from('chapters')
      .select('chapter_number')
      .eq('manhwa_id', manhwaId);

    if (fetchError) throw fetchError;

    const existingNumbers = new Set(existingChapters.map((c: any) => c.chapter_number));

    const newChaptersAdded: any[] = [];
    let nextId = Date.now();

    for (const ch of scrapedChapters) {
      if (!existingNumbers.has(ch.chapter_number)) {
        const newChapter = {
          id: `c-${nextId++}-${Math.random().toString(36).slice(2, 6)}`,
          manhwa_id: manhwaId,
          title: ch.title,
          chapter_number: ch.chapter_number,
          pdf_urls: ch.pdf_urls || [],
          images: ch.images || [],
          source_chapter_uuid: ch.source_chapter_uuid || '',
          published_date: ch.published_date || new Date().toISOString(),
        };
        newChaptersAdded.push(newChapter);
      }
    }

    if (newChaptersAdded.length > 0) {
      const { error: insertError } = await supabase.from('chapters').insert(newChaptersAdded);
      if (insertError) throw insertError;
    }

    const { data: allChapters } = await supabase
      .from('chapters')
      .select('*')
      .eq('manhwa_id', manhwaId);

    return {
      success: true,
      importedCount: newChaptersAdded.length,
      chapters: allChapters || [],
    };
  } catch (error: any) {
    console.error('Error during chapters import action:', error);
    throw new Error(error.message || 'Chapters syncing failed.');
  }
}

export async function getChapterDetailsAction(chapterId: string) {
  try {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single();

    if (error || !data) {
      throw new Error('Chapter not found in database.');
    }

    const chapter = data;

    if ((!chapter.images || chapter.images.length === 0) && chapter.source_chapter_uuid) {
      try {
        const pages = await fetchMangaDexChapterPages(chapter.source_chapter_uuid);
        chapter.images = pages;
        await supabase.from('chapters').update({ images: pages }).eq('id', chapterId);
      } catch (scrapingError) {
        console.error('Error fetching chapter pages dynamically:', scrapingError);
        chapter.images = [];
      }
    }

    return chapter;
  } catch (error: any) {
    console.error('Error in getChapterDetailsAction:', error);
    throw new Error(error.message || 'Failed to fetch chapter details.');
  }
}
