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
import { PenSquare, Trash2, Plus, X } from 'lucide-react';
import { getCategoriesAction, saveCategoriesAction } from '@/lib/actions';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from local database on mount
  useEffect(() => {
    getCategoriesAction().then(data => {
      setCategories(data);
      setIsLoading(false);
    });
  }, []);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form States
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [selectedCat, setSelectedCat] = useState<any | null>(null);

  // Auto-generate slug from name
  const handleNameChange = (name: string, isEdit: boolean) => {
    setCatName(name);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes
    setCatSlug(slug);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !catSlug.trim()) {
      toast.error('All fields are required');
      return;
    }

    if (categories.some(c => c.slug === catSlug)) {
      toast.error('A category with this slug already exists!');
      return;
    }

    const newCat = {
      id: (categories.length + 1).toString(),
      name: catName,
      slug: catSlug,
    };

    const updated = [...categories, newCat];
    setCategories(updated);
    saveCategoriesAction(updated);
    setIsAddOpen(false);
    resetForm();
    toast.success('Category added successfully!');
  };

  const handleEditClick = (cat: any) => {
    setSelectedCat(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCat) return;

    if (!catName.trim() || !catSlug.trim()) {
      toast.error('All fields are required');
      return;
    }

    if (categories.some(c => c.slug === catSlug && c.id !== selectedCat.id)) {
      toast.error('A category with this slug already exists!');
      return;
    }

    const updated = categories.map(c =>
      c.id === selectedCat.id ? { ...c, name: catName, slug: catSlug } : c
    );
    setCategories(updated);
    saveCategoriesAction(updated);
    setIsEditOpen(false);
    resetForm();
    toast.success('Category updated successfully!');
  };

  const handleDeleteClick = (cat: any) => {
    setSelectedCat(cat);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedCat) return;
    const updated = categories.filter(c => c.id !== selectedCat.id);
    setCategories(updated);
    saveCategoriesAction(updated);
    setIsDeleteOpen(false);
    setSelectedCat(null);
    toast.success('Category deleted successfully!');
  };

  const resetForm = () => {
    setCatName('');
    setCatSlug('');
    setSelectedCat(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Categories</h2>
          <p className="text-gray-500 text-sm font-medium mt-0.5">Create, edit, or delete manhwa genres.</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setIsAddOpen(true); }}
          className="rounded-full font-bold px-6 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-500 font-medium">Loading categories...</div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden max-h-[70vh] overflow-y-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="font-bold text-gray-700">Name</TableHead>
                <TableHead className="font-bold text-gray-700">Slug</TableHead>
                <TableHead className="text-right font-bold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id} className="hover:bg-green-50/10">
                  <TableCell className="font-bold text-gray-900">{cat.name}</TableCell>
                  <TableCell className="font-medium text-gray-500">{cat.slug}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditClick(cat)}
                      className="font-bold rounded-full text-gray-600 hover:text-primary hover:bg-green-50 border-gray-200"
                    >
                      <PenSquare className="w-4 h-4 mr-1.5" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteClick(cat)}
                      className="font-bold rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-xl font-black text-gray-900">Add New Category</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold text-gray-700">Category Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Action" 
                  value={catName} 
                  onChange={(e) => handleNameChange(e.target.value, false)}
                  required 
                  className="rounded-xl border-gray-200 focus-visible:ring-primary h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug" className="font-bold text-gray-700">Slug (URL Path)</Label>
                <Input 
                  id="slug" 
                  placeholder="e.g. action" 
                  value={catSlug} 
                  onChange={(e) => setCatSlug(e.target.value)}
                  required 
                  className="rounded-xl border-gray-200 focus-visible:ring-primary h-10"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-full font-bold">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-full font-bold px-6">
                  Save Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-xl font-black text-gray-900">Edit Category</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="font-bold text-gray-700">Category Name</Label>
                <Input 
                  id="edit-name" 
                  placeholder="e.g. Action" 
                  value={catName} 
                  onChange={(e) => handleNameChange(e.target.value, true)}
                  required 
                  className="rounded-xl border-gray-200 focus-visible:ring-primary h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-slug" className="font-bold text-gray-700">Slug (URL Path)</Label>
                <Input 
                  id="edit-slug" 
                  placeholder="e.g. action" 
                  value={catSlug} 
                  onChange={(e) => setCatSlug(e.target.value)}
                  required 
                  className="rounded-xl border-gray-200 focus-visible:ring-primary h-10"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="rounded-full font-bold">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-full font-bold px-6">
                  Update Category
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
              <h3 className="text-lg font-black text-gray-900">Delete Category?</h3>
              <p className="text-sm text-gray-500 font-medium">
                Are you sure you want to delete the category <strong>{selectedCat?.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} className="rounded-full font-bold">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} className="rounded-full font-bold px-6">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
