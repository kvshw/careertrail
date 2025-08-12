import { supabase, DocumentOptimizationRecord } from './supabase'
import { ApplicationOptimizationResult } from './ai-job-optimization'

export class DocumentOptimizationService {
  static async saveOptimization(
    userId: string,
    documentId: string,
    jobDescription: string,
    optimizationResult: ApplicationOptimizationResult
  ): Promise<DocumentOptimizationRecord> {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    
    const { data, error } = await supabase
      .from('document_optimizations')
      .insert({
        user_id: userId,
        document_id: documentId,
        job_description: jobDescription,
        optimization_result: optimizationResult
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving optimization:', error)
      throw new Error(`Failed to save optimization: ${error.message}`)
    }

    return data
  }

  static async getOptimizations(documentId: string): Promise<DocumentOptimizationRecord[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    
    const { data, error } = await supabase
      .from('document_optimizations')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching optimizations:', error)
      throw new Error(`Failed to fetch optimizations: ${error.message}`)
    }

    return data || []
  }

  static async getLatestOptimization(documentId: string): Promise<DocumentOptimizationRecord | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    
    const { data, error } = await supabase
      .from('document_optimizations')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No results found
        return null
      }
      console.error('Error fetching latest optimization:', error)
      throw new Error(`Failed to fetch latest optimization: ${error.message}`)
    }

    return data
  }

  static async deleteOptimization(optimizationId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    
    const { error } = await supabase
      .from('document_optimizations')
      .delete()
      .eq('id', optimizationId)

    if (error) {
      console.error('Error deleting optimization:', error)
      throw new Error(`Failed to delete optimization: ${error.message}`)
    }
  }

  static async getUserOptimizationCount(userId: string): Promise<number> {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    
    const { count, error } = await supabase
      .from('document_optimizations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) {
      console.error('Error counting optimizations:', error)
      throw new Error(`Failed to count optimizations: ${error.message}`)
    }

    return count || 0
  }
}

