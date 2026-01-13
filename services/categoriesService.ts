import { supabase } from './supabaseClient';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  skills_count: number;
  is_predefined: boolean;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all categories (predefined + user-defined)
 */
export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('is_predefined', { ascending: false })
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
};

/**
 * Fetch only predefined categories
 */
export const getPredefinedCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_predefined', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
};

/**
 * Fetch user-defined categories
 */
export const getUserCategories = async (userId: string): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
};

/**
 * Get a category by ID
 */
export const getCategoryById = async (id: string): Promise<Category | null> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
};

/**
 * Get a category by slug
 */
export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
};

/**
 * Create a new user-defined category
 */
export const createCategory = async (
  category: Omit<Category, 'id' | 'skills_count' | 'is_predefined' | 'created_at' | 'updated_at'>,
  userId: string
): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      ...category,
      user_id: userId,
      skills_count: 0,
      is_predefined: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update a category (only user-defined)
 */
export const updateCategory = async (
  id: string,
  updates: Partial<Pick<Category, 'name' | 'description' | 'icon' | 'color'>>
): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a category (only user-defined)
 */
export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Increment skills count for a category
 */
export const incrementCategoryCount = async (categoryId: string): Promise<void> => {
  const { error } = await supabase.rpc('increment_category_skills_count', {
    category_id: categoryId
  });

  if (error) {
    // Fallback: manually increment
    const category = await getCategoryById(categoryId);
    if (category) {
      await supabase
        .from('categories')
        .update({ skills_count: (category.skills_count || 0) + 1 })
        .eq('id', categoryId);
    }
  }
};

/**
 * Decrement skills count for a category
 */
export const decrementCategoryCount = async (categoryId: string): Promise<void> => {
  const category = await getCategoryById(categoryId);
  if (category && category.skills_count > 0) {
    await supabase
      .from('categories')
      .update({ skills_count: Math.max(0, category.skills_count - 1) })
      .eq('id', categoryId);
  }
};
