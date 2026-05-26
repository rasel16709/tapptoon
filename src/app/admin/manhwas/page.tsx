'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { PenSquare, Trash2, Plus, X, Sparkles, Settings, Upload, Image as ImageIcon, Info } from 'lucide-react';
import { getManhwasAction, saveManhwasAction, getCategoriesAction } from '@/lib/actions';

interface CategoryRow { id: string; name: string; slug: string }

export default function AdminManhwas() {
  const [manhwas, setManhwas] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<CategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-Import States
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Load from local database on mount
  useEffect(() => {
    Promise.all([getManhwasAction(), getCategoriesAction()]).then(([m, c]) => {
      setManhwas(m);
      setCategoryList(c);
      setIsLoading(false);
    });
  }, []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form State
  const [selectedManhwa, setSelectedManhwa] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [status, setStatus] = useState('Ongoing');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // SEO States
  const [slug, setSlug] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  // Handle local cover file upload
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverUrl(reader.result as string);
        toast.success('Cover image loaded successfully (Demo)!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle auto-slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditMode) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generatedSlug);
    }
  };

  // Helper for Auto-fill SEO
  const handleAutoFillSEO = () => {
    if (!title.trim()) {
      toast.error('Please enter a Title first!');
      return;
    }
    
    setSeoTitle(`${title} - Read ${title} Manhwa Online | Tappytoon.org`);
    
    const cleanDesc = description.trim() 
      ? description.substring(0, 120) 
      : 'Read the latest chapters of this awesome webtoon online.';
    setSeoDescription(`Read the latest chapters of ${title} manhwa online on Tappytoon.org. ${cleanDesc}...`);
    
    const baseKeywords = `${title.toLowerCase()}, read ${title.toLowerCase()}, ${title.toLowerCase()} online, manhwa, webtoon, tappytoon.org`;
    setSeoKeywords(baseKeywords);
    
    toast.success('SEO Fields auto-filled successfully! (Optimized for Google)');
  };

  const handleOpenImport = () => {
    setImportUrl('');
    setIsImportOpen(true);
  };

  const handleAutoImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl.trim()) {
      toast.error('Please enter a competitor link!');
      return;
    }
    
    setIsImporting(true);
    try {
      const { importManhwaAction } = await import('@/lib/actions');
      const data = await importManhwaAction(importUrl);
      
      // Prefill form states
      setIsEditMode(false);
      setSelectedManhwa(null);
      setTitle(data.title);
      setAuthor(data.author);
      setDescription(data.description);
      setCoverUrl(data.cover_image_url);
      setStatus(data.status);
      setSelectedCategories(data.categories);
      
      // Auto-generate clean slug
      const cleanSlug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(cleanSlug);
      
      // Prefill advanced SEO
      setSeoTitle(data.seo_title || `${data.title} - Read Manhwa Online | Tappytoon.org`);
      setSeoDescription(data.seo_description || `Read ${data.title} online now. ${data.description.substring(0, 120)}...`);
      setSeoKeywords(data.seo_keywords || `${data.title.toLowerCase()}, webtoon, manhwa`);
      
      // Keep the original UUID from the scraped URL or payload so we map correctly to MangaDex
      setSelectedManhwa({ id: data.source_id || importUrl.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i)?.[0] });
      
      setIsImportOpen(false);
      setIsFormOpen(true);
      toast.success('Competitor data scraped and prefilled successfully! Click Save to confirm.');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Auto-import failed. Please verify the URL.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setSelectedManhwa(null);
    setTitle('');
    setAuthor('');
    setDescription('');
    setCoverUrl('');
    setStatus('Ongoing');
    setSelectedCategories([]);
    setSlug('');
    setSeoTitle('');
    setSeoDescription('');
    setSeoKeywords('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (manhwa: any) => {
    setIsEditMode(true);
    setSelectedManhwa(manhwa);
    setTitle(manhwa.title);
    setAuthor(manhwa.author);
    setDescription(manhwa.description);
    setCoverUrl(manhwa.cover_image_url);
    setStatus(manhwa.status);
    setSelectedCategories(manhwa.categories);
    
    const cleanSlug = manhwa.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setSlug(cleanSlug);
    setSeoTitle(`${manhwa.title} - Read Manhwa Online | Tappytoon.org`);
    setSeoDescription(`Read ${manhwa.title} online now. ${manhwa.description.substring(0, 120)}...`);
    setSeoKeywords(`${manhwa.title.toLowerCase()}, webtoon, manhwa`);
    
    setIsFormOpen(true);
  };

  const handleCategoryToggle = (catSlug: string) => {
    if (selectedCategories.includes(catSlug)) {
      setSelectedCategories(selectedCategories.filter(c => c !== catSlug));
    } else {
      setSelectedCategories([...selectedCategories, catSlug]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !description.trim() || !slug.trim()) {
      toast.error('Please fill out all required fields');
      return;
    }

    const defaultCover = 'https://placehold.co/400x600/000000/FFFFFF/png?text=' + encodeURIComponent(title);
    const finalCover = coverUrl || defaultCover;

    if (isEditMode && selectedManhwa) {
      const updated = manhwas.map(m =>
        m.id === selectedManhwa.id
          ? {
              ...m,
              title,
              author,
              description,
              cover_image_url: finalCover,
              status,
              categories: selectedCategories,
            }
          : m
      );
      setManhwas(updated);
      saveManhwasAction(updated);
      toast.success('Manhwa updated successfully!');
    } else {
      const newManhwa = {
        id: selectedManhwa?.id || (manhwas.length + 1).toString(), // Use MangaDex UUID if importing, else generic ID
        title,
        author,
        description,
        cover_image_url: finalCover,
        status,
        categories: selectedCategories,
        created_at: new Date().toISOString(),
        seo_title: seoTitle,
        seo_description: seoDescription,
        seo_keywords: seoKeywords,
      };
      const updated = [...manhwas, newManhwa];
      setManhwas(updated);
      saveManhwasAction(updated);
      toast.success('New Manhwa added successfully!');
    }
    
    setIsFormOpen(false);
  };

  const handleDeleteClick = (manhwa: any) => {
    setSelectedManhwa(manhwa);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedManhwa) return;
    const updated = manhwas.filter(m => m.id !== selectedManhwa.id);
    setManhwas(updated);
    saveManhwasAction(updated);
    setIsDeleteOpen(false);
    setSelectedManhwa(null);
    toast.success('Manhwa deleted successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Manhwas</h2>
          <p className="text-gray-500 text-sm font-medium mt-0.5">Manage all series, chapters, and SEO configs.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleOpenImport}
            className="rounded-full font-bold px-6 border border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 shadow-none transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 mr-2 text-primary animate-pulse" />
            Quick Auto-Import
          </Button>
          <Button 
            onClick={handleOpenAdd}
            className="rounded-full font-bold px-6 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Manhwa
          </Button>
        </div>
      </div>

      {/* Info Notice about PDFs */}
      <div className="bg-green-50 border border-green-200 text-gray-700 p-4 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm font-medium">
          <p className="font-bold text-gray-900">Uploading Chapter PDFs:</p>
          <p className="mt-0.5 text-gray-600">
            A Manhwa represents the entire series (like Solo Leveling). To upload chapter PDFs, please add the Manhwa series first, and then click the **"Chapters"** button next to the series row to manage, publish, and upload sequential PDF files for that specific chapter.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="font-bold text-gray-700 w-16">Cover</TableHead>
              <TableHead className="font-bold text-gray-700">Title</TableHead>
              <TableHead className="font-bold text-gray-700">Author</TableHead>
              <TableHead className="font-bold text-gray-700">Status</TableHead>
              <TableHead className="text-right font-bold text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {manhwas.map((manhwa) => (
              <TableRow key={manhwa.id} className="hover:bg-green-50/10">
                <TableCell>
                  <div className="relative w-10 h-14 rounded overflow-hidden border border-gray-100 shadow-sm">
                    <Image
                      src={manhwa.cover_image_url}
                      alt={manhwa.title}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-bold text-gray-900">{manhwa.title}</TableCell>
                <TableCell className="font-semibold text-gray-600">{manhwa.author}</TableCell>
                <TableCell>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    manhwa.status === 'Ongoing' ? 'bg-primary/10 text-primary' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {manhwa.status}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/admin/manhwas/${manhwa.id}`}>
                    <Button variant="outline" size="sm" className="font-bold rounded-full border-gray-200 text-gray-700 hover:text-primary hover:bg-green-50">
                      Chapters
                    </Button>
                  </Link>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handleOpenEdit(manhwa)}
                    className="font-bold rounded-full text-gray-600 hover:bg-gray-100 border-transparent"
                  >
                    <PenSquare className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteClick(manhwa)}
                    className="font-bold rounded-full text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Form Modal (Large Full Panel) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-2xl font-black text-gray-900">
                  {isEditMode ? `Edit Manhwa: ${selectedManhwa?.title}` : 'Add New Manhwa'}
                </h3>
                <p className="text-sm text-gray-500 font-medium mt-0.5">Fill out series info and search details.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: General Fields */}
              <div className="space-y-4">
                <h4 className="text-base font-bold text-gray-900 border-b pb-1.5 flex items-center gap-2">
                  <span>General Information</span>
                </h4>
                
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-bold text-gray-700">Series Title *</Label>
                  <Input 
                    id="title" 
                    value={title} 
                    onChange={(e) => handleTitleChange(e.target.value)} 
                    required 
                    placeholder="e.g. Return of the Demon" 
                    className="rounded-xl border-gray-200 focus-visible:ring-primary h-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="author" className="font-bold text-gray-700">Author *</Label>
                    <Input 
                      id="author" 
                      value={author} 
                      onChange={(e) => setAuthor(e.target.value)} 
                      required 
                      placeholder="e.g. Chugong" 
                      className="rounded-xl border-gray-200 focus-visible:ring-primary h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="font-bold text-gray-700">Status</Label>
                    <select 
                      id="status" 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white h-10 px-3 text-sm focus-visible:ring-primary focus-visible:outline-none"
                    >
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc" className="font-bold text-gray-700">Description *</Label>
                  <textarea 
                    id="desc" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    required 
                    placeholder="Enter short synopsis..." 
                    className="flex min-h-[100px] w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* COVER PHOTO FILE UPLOADER (NEW!) */}
                <div className="space-y-3">
                  <Label className="font-bold text-gray-700 block">Cover Photo Upload *</Label>
                  <div className="flex gap-4 items-center">
                    <div className="relative w-20 h-28 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="relative flex items-center justify-center border-2 border-dashed border-gray-200 hover:border-primary hover:bg-green-50/20 rounded-2xl p-4 transition-colors cursor-pointer group">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleCoverFileChange}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                        />
                        <div className="text-center">
                          <Upload className="w-6 h-6 text-gray-400 group-hover:text-primary mx-auto mb-1 transition-colors" />
                          <p className="text-xs font-bold text-gray-700 group-hover:text-primary transition-colors">Click to Upload Image</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, or WEBP (3:4 ratio)</p>
                        </div>
                      </div>
                      <div className="text-center font-bold text-xs text-gray-400">- OR -</div>
                      <Input 
                        id="cover-url" 
                        value={coverUrl} 
                        onChange={(e) => setCoverUrl(e.target.value)} 
                        placeholder="Or paste Direct Image URL..." 
                        className="rounded-xl border-gray-200 focus-visible:ring-primary h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-gray-700 block">Select Categories</Label>
                  <div className="border rounded-2xl p-4 max-h-[120px] overflow-y-auto grid grid-cols-2 gap-2 bg-gray-50/50">
                    {categoryList.length === 0 ? (
                      <p className="col-span-2 text-xs font-medium text-gray-400">
                        No categories yet. Add some from the Categories tab.
                      </p>
                    ) : (
                      categoryList.map((cat) => (
                        <label key={cat.id} className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-primary cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat.slug)}
                            onChange={() => handleCategoryToggle(cat.slug)}
                            className="rounded text-primary focus:ring-primary w-4 h-4"
                          />
                          <span>{cat.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: SEO Fields */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-primary" />
                    <span>SEO & Search Engine Settings</span>
                  </h4>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline" 
                    onClick={handleAutoFillSEO}
                    className="rounded-full font-bold text-xs h-7 text-primary hover:text-white hover:bg-primary border-primary/30"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Auto-Fill SEO
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="font-bold text-gray-700 flex items-center gap-1.5">
                    URL Slug *
                  </Label>
                  <Input 
                    id="slug" 
                    value={slug} 
                    onChange={(e) => setSlug(e.target.value)} 
                    required 
                    placeholder="e.g. solo-leveling" 
                    className="rounded-xl border-gray-200 focus-visible:ring-primary h-10"
                  />
                  <p className="text-[10px] text-gray-400 font-medium">Used for URLs: `/manhwa/[slug]`. Enter clean lowercase alphanumeric words separated by dashes.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-title" className="font-bold text-gray-700">SEO Custom Title</Label>
                  <Input 
                    id="seo-title" 
                    value={seoTitle} 
                    onChange={(e) => setSeoTitle(e.target.value)} 
                    placeholder="Custom Browser Tab Title" 
                    className="rounded-xl border-gray-200 focus-visible:ring-primary h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-desc" className="font-bold text-gray-700">SEO Meta Description</Label>
                  <textarea 
                    id="seo-desc" 
                    value={seoDescription} 
                    onChange={(e) => setSeoDescription(e.target.value)} 
                    placeholder="Short summary for Google search results (160 characters)..." 
                    className="flex min-h-[80px] w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-keywords" className="font-bold text-gray-700">Meta Keywords</Label>
                  <Input 
                    id="seo-keywords" 
                    value={seoKeywords} 
                    onChange={(e) => setSeoKeywords(e.target.value)} 
                    placeholder="e.g. action, leveling, murim, webtoon" 
                    className="rounded-xl border-gray-200 focus-visible:ring-primary h-10"
                  />
                  <p className="text-[10px] text-gray-400 font-medium">Comma separated keywords to tell search engines what terms to rank for.</p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="md:col-span-2 border-t pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} className="rounded-full font-bold">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-full font-bold px-8 shadow-lg shadow-primary/20">
                  {isEditMode ? 'Update Series' : 'Save Series'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 flex flex-col gap-5 animate-in zoom-in-95 duration-200 text-center">
            <div className="mx-auto w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-gray-900">Delete Series?</h3>
              <p className="text-sm text-gray-500 font-medium">
                Are you sure you want to delete the series <strong>{selectedManhwa?.title}</strong>? All associated chapters will be lost. This cannot be undone.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} className="rounded-full font-bold">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} className="rounded-full font-bold px-6">
                Delete Series
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  <span>Quick Auto-Import</span>
                </h3>
                <p className="text-xs text-gray-500 font-medium">Scrape details & SEO metadata instantly from competitor links.</p>
              </div>
              <button onClick={() => setIsImportOpen(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAutoImport} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="import-url" className="font-bold text-gray-700 text-sm">MangaDex URL *</Label>
                <Input 
                  id="import-url"
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="Paste MangaDex link..."
                  className="rounded-xl border-gray-200 focus-visible:ring-primary h-10 text-sm"
                  required
                />
                <div className="text-[10px] text-gray-400 font-semibold leading-relaxed space-y-0.5 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <span className="text-gray-500 block mb-0.5">Supported Links:</span>
                  <span className="block text-primary">• https://mangadex.org/title/d6cf150f-7e90-43f3-9555-d1bc9ed78f73</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsImportOpen(false)} className="rounded-full font-bold">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isImporting}
                  className="rounded-full font-bold px-6 shadow-lg shadow-primary/20"
                >
                  {isImporting ? 'Fetching...' : 'Import to Override'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
