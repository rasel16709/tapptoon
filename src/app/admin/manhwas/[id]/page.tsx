'use client';

import { useState, use, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Trash2, FileText } from 'lucide-react';
import Link from 'next/link';
import { getManhwasAction, getChaptersAction, saveChaptersAction } from '@/lib/actions';

export default function ManageChapters({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [manhwa, setManhwa] = useState<any | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [allChapters, setAllChapters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from local database
  useEffect(() => {
    Promise.all([getManhwasAction(), getChaptersAction()]).then(([manhwasList, chaptersList]) => {
      const activeManhwa = manhwasList.find((m: any) => m.id === resolvedParams.id);
      setManhwa(activeManhwa || null);
      
      const filtered = chaptersList
        .filter((c: any) => c.manhwa_id === resolvedParams.id)
        .sort((a: any, b: any) => b.chapter_number - a.chapter_number);
      
      setChapters(filtered);
      setAllChapters(chaptersList);
      setIsLoading(false);
    });
  }, [resolvedParams.id]);

  // Form States
  const [isUploading, setIsUploading] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [numberInput, setNumberInput] = useState<number>(
    chapters.length > 0 ? Math.max(...chapters.map(c => c.chapter_number)) + 1 : 1
  );
  const [filesSelected, setFilesSelected] = useState<FileList | null>(null);

  // Sync States
  const [syncUrl, setSyncUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFilesSelected(e.target.files);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!numberInput) {
      toast.error('Chapter number is required');
      return;
    }

    if (!filesSelected || filesSelected.length === 0) {
      toast.error('Please select at least one PDF file to upload');
      return;
    }

    setIsUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      const uploadedUrls = Array.from(filesSelected).map((file, idx) => `/sample-chapter.dat`);

      const newChapter = {
        id: (allChapters.length + 1).toString(),
        manhwa_id: resolvedParams.id,
        title: titleInput.trim() ? titleInput.trim() : `Chapter ${numberInput}`,
        chapter_number: numberInput,
        pdf_urls: uploadedUrls,
        published_date: new Date().toISOString(),
      };

      const updatedLocal = [newChapter, ...chapters].sort((a, b) => b.chapter_number - a.chapter_number);
      const updatedAll = [newChapter, ...allChapters];

      setChapters(updatedLocal);
      setAllChapters(updatedAll);
      saveChaptersAction(updatedAll);
      setIsUploading(false);
      
      setTitleInput('');
      setNumberInput(numberInput + 1);
      setFilesSelected(null);
      
      const fileInput = document.getElementById('pdfs') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      toast.success('Chapter uploaded successfully (Instantly added to list)!');
    }, 1200);
  };

  const handleSyncChapters = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syncUrl.trim()) {
      toast.error('Please enter a competitor link first!');
      return;
    }

    setIsSyncing(true);
    try {
      const { importChaptersAction } = await import('@/lib/actions');
      const result = await importChaptersAction(resolvedParams.id, syncUrl);
      
      const sortedChapters = [...result.chapters].sort((a: any, b: any) => b.chapter_number - a.chapter_number);
      setChapters(sortedChapters);
      
      // Update allChapters state
      const otherManhwaChapters = allChapters.filter(c => c.manhwa_id !== resolvedParams.id);
      const updatedAll = [...otherManhwaChapters, ...result.chapters];
      setAllChapters(updatedAll);

      toast.success(`Success! Synchronized ${result.importedCount} new chapter listings from competitor source!`);
      setSyncUrl('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to sync chapters.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteChapter = (chapterId: string, chapterNum: number) => {
    const updatedLocal = chapters.filter(c => c.id !== chapterId);
    const updatedAll = allChapters.filter(c => c.id !== chapterId);
    
    setChapters(updatedLocal);
    setAllChapters(updatedAll);
    saveChaptersAction(updatedAll);
    toast.success(`Chapter ${chapterNum} deleted successfully!`);
  };

  if (!manhwa) return <div className="p-10 text-center font-bold">Manhwa not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/manhwas">
          <Button variant="outline" size="icon" className="rounded-full border-gray-200 text-gray-700 hover:text-primary hover:bg-green-50">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-black text-gray-900">Manage Chapters: {manhwa.title}</h2>
          <p className="text-gray-500 text-sm font-medium mt-0.5">Upload new chapter PDFs or delete existing releases.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-12 items-start">
        
        {/* Left Side: Chapter List (Takes 7 Cols on desktop) */}
        <Card className="md:col-span-7 rounded-3xl border border-gray-200 shadow-sm overflow-hidden bg-white">
          <CardHeader className="border-b bg-gray-50/50 pb-4">
            <CardTitle className="text-lg font-black text-gray-900">
              Existing Chapters ({chapters.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {isLoading ? (
                <div className="py-12 text-center text-gray-400 font-bold">Loading chapters...</div>
              ) : (
                chapters.map(chapter => (
                  <div key={chapter.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-green-50/5 transition-colors">
                    <div className="space-y-1">
                      <p className="font-bold text-gray-900 text-base">
                        Chapter {chapter.chapter_number}: {chapter.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                        <FileText className="w-3.5 h-3.5 text-primary" />
                        <span>{chapter.pdf_urls.length} PDF file(s) stitched</span>
                        <span>•</span>
                        <span>{new Date(chapter.published_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteChapter(chapter.id, chapter.chapter_number)}
                      className="font-bold rounded-full text-red-600 hover:bg-red-50 hover:text-red-700 h-9 px-3 shrink-0"
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                ))
              )}
              {!isLoading && chapters.length === 0 && (
                <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-500 font-bold">No chapters released yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Fill out the form on the right to upload your first chapter!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Side: Forms (Takes 5 Cols on desktop) */}
        <div className="md:col-span-5 space-y-6">
          <Card className="rounded-3xl border border-gray-200 shadow-sm overflow-hidden bg-white">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <CardTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                <span>Upload New Chapter</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleUpload} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="number" className="font-bold text-gray-700">Chapter Number *</Label>
                  <Input 
                    id="number" 
                    type="number" 
                    required 
                    value={numberInput} 
                    onChange={(e) => setNumberInput(parseInt(e.target.value) || 0)}
                    className="rounded-xl border-gray-200 focus-visible:ring-primary h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="font-bold text-gray-700">Chapter Title (Optional)</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. Return of the Heavenly Demon" 
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="rounded-xl border-gray-200 focus-visible:ring-primary h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pdfs" className="font-bold text-gray-700 block">Select Chapter PDFs *</Label>
                  <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-primary hover:bg-green-50/20 rounded-2xl p-6 transition-colors cursor-pointer group">
                    <input 
                      id="pdfs"
                      type="file" 
                      accept=".pdf" 
                      multiple 
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                    />
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary mb-2 transition-colors" />
                    <p className="text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">
                      {filesSelected && filesSelected.length > 0 
                        ? `${filesSelected.length} PDF file(s) selected` 
                        : 'Choose Chapter PDFs'}
                    </p>
                    <p className="text-[10px] text-gray-400 text-center mt-1">
                      Select multiple files to stitch pages sequentially inside a single chapter reader.
                    </p>
                  </div>
                  {filesSelected && filesSelected.length > 0 && (
                    <div className="pt-2 max-h-[100px] overflow-y-auto divide-y divide-gray-50 border rounded-xl p-2 bg-gray-50/50">
                      {Array.from(filesSelected).map((file, idx) => (
                        <div key={idx} className="text-[10px] font-semibold text-gray-500 py-1 truncate">
                          📄 {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={isUploading} className="w-full rounded-full font-bold h-11 shadow-lg shadow-primary/20 mt-4">
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Stitching & Uploading PDFs...
                    </span>
                  ) : 'Upload & Publish Chapter'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sync Chapters Card (New!) */}
          <Card className="rounded-3xl border border-gray-200 shadow-sm overflow-hidden bg-white">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <CardTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
                <span className="text-primary animate-spin inline-block font-normal">🔄</span>
                <span>Competitor Chapter Sync</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSyncChapters} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sync-url" className="font-bold text-gray-700 text-sm">Competitor/MangaDex Link *</Label>
                  <Input 
                    id="sync-url" 
                    type="url"
                    placeholder="Paste comix.to or MangaDex link..." 
                    value={syncUrl}
                    onChange={(e) => setSyncUrl(e.target.value)}
                    required
                    className="rounded-xl border-gray-200 focus-visible:ring-primary h-10 text-sm"
                  />
                  <p className="text-sm font-medium text-gray-500">
                    System parses entire series listing and auto-generates all chapters inside Tappytoon.org seamlessly.
                  </p>
                </div>

                <Button type="submit" disabled={isSyncing} className="w-full rounded-full font-bold h-10 border border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 shadow-none transition-all duration-200">
                  {isSyncing ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                      Syncing chapters feed...
                    </span>
                  ) : 'Synchronize Chapters List'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
