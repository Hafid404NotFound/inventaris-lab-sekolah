import { supabase } from './supabase'
import { Category } from '@/types/database'

/**
 * Get all categories
 */
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Exception in getCategories:', error)
    return []
  }
}

/**
 * Get categories by lab ID
 */
export async function getCategoriesByLab(labId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('lab_id', labId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories by lab:', error)
    throw error
  }

  return data
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching category:', error)
    throw error
  }

  return data
}

/**
 * Create new category
 */
export async function createCategory(category: Omit<Category, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('categories')
    .insert([category as any])
    .select()
    .single()

  if (error) {
    console.error('Error creating category:', error)
    throw error
  }

  return data as Category
}

/**
 * Update existing category
 */
export async function updateCategory(id: string, category: Partial<Category>) {
  const { data, error } = await supabase
    .from('categories')
    .update(category as any)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating category:', error)
    throw error
  }

  return data as Category
}

/**
 * Delete category
 */
export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting category:', error)
    throw error
  }

  return true
}
