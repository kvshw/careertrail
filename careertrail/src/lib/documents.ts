import { supabase } from './supabase'
import { Document, DocumentFormData, DocumentAnalysisRecord } from './supabase'

export class DocumentService {
  static async uploadDocument(
    file: File,
    documentData: DocumentFormData,
    userId: string
  ): Promise<Document> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        throw new Error('Supabase client not initialized')
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB')
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not supported. Please upload PDF, Word, or image files.')
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      // Create document record in database
      const { data: document, error: dbError } = await supabase
        .from('documents')
        .insert([{
          user_id: userId,
          job_id: documentData.job_id || null,
          folder_id: documentData.folder_id || null,
          name: documentData.name,
          description: documentData.description,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          category: documentData.category,
          version: 1,
          is_active: true
        }])
        .select()
        .single()

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('documents').remove([filePath])
        throw new Error(`Database error: ${dbError.message}`)
      }

      return document
    } catch (error) {
      console.error('Error uploading document:', error)
      throw error
    }
  }

  static async saveAnalysis(
    userId: string,
    documentId: string,
    result: unknown
  ): Promise<DocumentAnalysisRecord> {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { data, error } = await supabase
      .from('document_analyses')
      .insert([{ user_id: userId, document_id: documentId, result }])
      .select()
      .single()
    if (error) throw new Error(`Failed to save analysis: ${error.message}`)
    return data as DocumentAnalysisRecord
  }

  static async getLastAnalysis(
    userId: string,
    documentId: string
  ): Promise<DocumentAnalysisRecord | null> {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { data, error } = await supabase
      .from('document_analyses')
      .select('*')
      .eq('user_id', userId)
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw new Error(`Failed to fetch analysis: ${error.message}`)
    return data
  }

  static async getDocuments(userId: string, jobId?: string): Promise<Document[]> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return []
      }
      
      let query = supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (jobId) {
        query = query.eq('job_id', jobId)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to fetch documents: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error fetching documents:', error)
      throw error
    }
  }

  static async getDocument(id: string, userId: string): Promise<Document> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        throw new Error('Supabase client not initialized')
      }
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (error) {
        throw new Error(`Failed to fetch document: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error fetching document:', error)
      throw error
    }
  }

  static async updateDocument(
    id: string,
    updates: Partial<DocumentFormData>,
    userId: string
  ): Promise<Document> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        throw new Error('Supabase client not initialized')
      }
      
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update document: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error updating document:', error)
      throw error
    }
  }

  static async deleteDocument(id: string, userId: string): Promise<void> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return
      }
      
      // Get document to get file path
      const document = await this.getDocument(id, userId)

      // Delete from database (soft delete)
      const { error: dbError } = await supabase
        .from('documents')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', userId)

      if (dbError) {
        throw new Error(`Failed to delete document: ${dbError.message}`)
      }

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path])

      if (storageError) {
        console.warn('Failed to delete file from storage:', storageError)
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      throw error
    }
  }

  static async getDownloadUrl(filePath: string): Promise<string> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        throw new Error('Supabase client not initialized')
      }
      
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error getting download URL:', error)
      throw error
    }
  }

  static async getDocumentsByCategory(
    userId: string,
    category: Document['category']
  ): Promise<Document[]> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return []
      }
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch documents by category: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error fetching documents by category:', error)
      throw error
    }
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  static getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('image')) return '🖼️'
    if (fileType.includes('text')) return '📄'
    return '📎'
  }

  static getCategoryIcon(category: Document['category']): string {
    switch (category) {
      case 'resume': return '📋'
      case 'cover_letter': return '✉️'
      case 'portfolio': return '🎨'
      case 'certificate': return '🏆'
      default: return '📎'
    }
  }

  static getCategoryLabel(category: Document['category']): string {
    switch (category) {
      case 'resume': return 'Resume'
      case 'cover_letter': return 'Cover Letter'
      case 'portfolio': return 'Portfolio'
      case 'certificate': return 'Certificate'
      default: return 'Other'
    }
  }
} 