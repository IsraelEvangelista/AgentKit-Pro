import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Folder } from 'lucide-react';
import { Category, getCategories, createCategory } from '../services/categoriesService';
import { supabase } from '../services/supabaseClient';

interface CategorySelectorProps {
  selectedCategoryId?: string;
  onCategorySelect: (category: Category | null) => void;
  onClose?: () => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategoryId,
  onCategorySelect,
  onClose
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      // Generate slug from name if not provided
      const slug = newCategorySlug.trim() ||
        newCategoryName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const newCategory = await createCategory({
        name: newCategoryName.trim(),
        slug,
        description: newCategoryDesc.trim() || undefined,
        user_id: user.id
      }, user.id);

      // Select the newly created category
      onCategorySelect(newCategory);

      // Reset form
      setNewCategoryName('');
      setNewCategorySlug('');
      setNewCategoryDesc('');
      setShowCreateForm(false);

      // Reload categories to include the new one
      await loadCategories();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create category';
      setError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const predefinedCategories = categories.filter(c => c.is_predefined);
  const userCategories = categories.filter(c => !c.is_predefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-[#0f0f0f] border border-cyber-border rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-cyber-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Folder size={18} className="text-cyber-orange" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Category</h3>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-cyber-border/50 rounded"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 bg-red-900/20 border border-red-500/50 rounded p-3 text-red-400 text-xs">
              {error}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 text-sm">Loading categories...</div>
          ) : (
            <>
              {/* Predefined Categories */}
              {predefinedCategories.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">SkillsMP Categories</p>
                  <div className="grid grid-cols-2 gap-2">
                    {predefinedCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => onCategorySelect(category)}
                        className={`p-3 rounded border text-left transition-all ${
                          selectedCategoryId === category.id
                            ? 'bg-cyber-orange/10 border-cyber-orange text-white'
                            : 'bg-[#1a1a1a] border-cyber-border hover:border-cyber-orange/50 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {category.icon && <span className="text-lg">{category.icon}</span>}
                          <span className="font-semibold text-sm">{category.name}</span>
                        </div>
                        {category.skills_count > 0 && (
                          <span className="text-[10px] text-gray-500">{category.skills_count.toLocaleString()} skills</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* User Categories */}
              {userCategories.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Your Categories</p>
                  <div className="space-y-2">
                    {userCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => onCategorySelect(category)}
                        className={`w-full p-3 rounded border text-left transition-all ${
                          selectedCategoryId === category.id
                            ? 'bg-cyber-blue/10 border-cyber-blue text-white'
                            : 'bg-[#1a1a1a] border-cyber-border hover:border-cyber-blue/50 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">{category.name}</span>
                          {category.skills_count > 0 && (
                            <span className="text-[10px] text-gray-500">{category.skills_count} skills</span>
                          )}
                        </div>
                        {category.description && (
                          <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Create New Category Button */}
              {!showCreateForm ? (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full p-3 rounded border border-dashed border-cyber-border hover:border-cyber-blue/50 text-gray-500 hover:text-cyber-blue transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  <span className="text-sm font-medium">Create New Category</span>
                </button>
              ) : (
                <div className="bg-[#1a1a1a] border border-cyber-border rounded p-4 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Plus size={14} className="text-cyber-blue" />
                    Create Category
                  </h4>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Name *</label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="My Custom Category"
                      className="w-full bg-[#0a0a0c] border border-cyber-border text-white px-3 py-2 rounded text-sm focus:outline-none focus:border-cyber-blue"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Slug (optional)</label>
                    <input
                      type="text"
                      value={newCategorySlug}
                      onChange={(e) => setNewCategorySlug(e.target.value)}
                      placeholder="my-custom-category"
                      className="w-full bg-[#0a0a0c] border border-cyber-border text-white px-3 py-2 rounded text-sm focus:outline-none focus:border-cyber-blue font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Description (optional)</label>
                    <textarea
                      value={newCategoryDesc}
                      onChange={(e) => setNewCategoryDesc(e.target.value)}
                      placeholder="Brief description of this category..."
                      rows={2}
                      className="w-full bg-[#0a0a0c] border border-cyber-border text-white px-3 py-2 rounded text-sm focus:outline-none focus:border-cyber-blue resize-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateCategory}
                      disabled={isCreating}
                      className="flex-1 bg-cyber-blue hover:bg-cyber-blue/80 text-black px-4 py-2 rounded font-bold text-xs uppercase flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isCreating ? <span className="animate-spin">⌛</span> : <Check size={14} />}
                      {isCreating ? 'Creating...' : 'Create'}
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewCategoryName('');
                        setNewCategorySlug('');
                        setNewCategoryDesc('');
                        setError(null);
                      }}
                      disabled={isCreating}
                      className="px-4 py-2 bg-[#0a0a0c] border border-cyber-border text-gray-400 hover:text-white rounded text-xs font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* No Selection Option */}
              <button
                onClick={() => onCategorySelect(null)}
                className={`w-full mt-4 p-2 rounded border text-center transition-all ${
                  !selectedCategoryId
                    ? 'bg-gray-700/20 border-gray-600 text-gray-300'
                    : 'bg-transparent border-transparent text-gray-600 hover:text-gray-400'
                }`}
              >
                <span className="text-xs">No Category (Uncategorized)</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
