import { supabase } from './supabase'
import { Folder, FolderFormData } from './supabase'

export class FolderService {
  static async getFolders(userId: string): Promise<Folder[]> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return []
      }
      
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch folders: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error fetching folders:', error)
      throw error
    }
  }

  static async getFolder(id: string, userId: string): Promise<Folder> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        throw new Error('Supabase client not initialized')
      }
      
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (error) {
        throw new Error(`Failed to fetch folder: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error fetching folder:', error)
      throw error
    }
  }

  static async createFolder(folderData: FolderFormData, userId: string): Promise<Folder> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        throw new Error('Supabase client not initialized')
      }
      
      const { data, error } = await supabase
        .from('folders')
        .insert([{
          user_id: userId,
          name: folderData.name,
          description: folderData.description,
          color: folderData.color || '#3B82F6',
          parent_folder_id: folderData.parent_folder_id || null
        }])
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create folder: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error creating folder:', error)
      throw error
    }
  }

  static async updateFolder(
    id: string,
    updates: Partial<FolderFormData>,
    userId: string
  ): Promise<Folder> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        throw new Error('Supabase client not initialized')
      }
      
      const { data, error } = await supabase
        .from('folders')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update folder: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error updating folder:', error)
      throw error
    }
  }

  static async deleteFolder(id: string, userId: string): Promise<void> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return
      }
      
      // First, move all documents in this folder to root (null folder_id)
      const { error: updateError } = await supabase
        .from('documents')
        .update({ folder_id: null })
        .eq('folder_id', id)
        .eq('user_id', userId)

      if (updateError) {
        console.warn('Failed to move documents from folder:', updateError)
      }

      // Move all subfolders to root (null parent_folder_id)
      const { error: subfolderError } = await supabase
        .from('folders')
        .update({ parent_folder_id: null })
        .eq('parent_folder_id', id)
        .eq('user_id', userId)

      if (subfolderError) {
        console.warn('Failed to move subfolders:', subfolderError)
      }

      // Delete the folder
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        throw new Error(`Failed to delete folder: ${error.message}`)
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
      throw error
    }
  }

  static async getFolderHierarchy(userId: string): Promise<Folder[]> {
    try {
      const folders = await this.getFolders(userId)
      return this.buildHierarchy(folders)
    } catch (error) {
      console.error('Error getting folder hierarchy:', error)
      throw error
    }
  }

  static buildHierarchy(folders: Folder[]): Folder[] {
    const folderMap = new Map<string, Folder & { children: Folder[] }>()
    const rootFolders: (Folder & { children: Folder[] })[] = []

    // Create a map of all folders with children arrays
    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] })
    })

    // Build the hierarchy
    folders.forEach(folder => {
      const folderWithChildren = folderMap.get(folder.id)!
      
      if (folder.parent_folder_id) {
        const parent = folderMap.get(folder.parent_folder_id)
        if (parent) {
          parent.children.push(folderWithChildren)
        }
      } else {
        rootFolders.push(folderWithChildren)
      }
    })

    return rootFolders
  }

  static getFolderPath(folders: Folder[], folderId: string): string[] {
    const path: string[] = []
    let currentId = folderId

    while (currentId) {
      const folder = folders.find(f => f.id === currentId)
      if (folder) {
        path.unshift(folder.name)
        currentId = folder.parent_folder_id || ''
      } else {
        break
      }
    }

    return path
  }

  static getFolderIcon(color: string): string {
    return '📁'
  }

  static getDefaultColors(): string[] {
    return [
      '#3B82F6', // Blue
      '#EF4444', // Red
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#8B5CF6', // Purple
      '#F97316', // Orange
      '#06B6D4', // Cyan
      '#EC4899', // Pink
      '#84CC16', // Lime
      '#6366F1'  // Indigo
    ]
  }

  static formatFolderName(name: string, maxLength: number = 20): string {
    if (name.length <= maxLength) {
      return name
    }
    return name.substring(0, maxLength - 3) + '...'
  }
} 