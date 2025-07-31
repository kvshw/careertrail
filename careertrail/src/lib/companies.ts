import { supabase } from './supabase'
import { Company } from './supabase'

export class CompanyService {
  /**
   * Search for companies by name
   */
  static async searchCompanies(query: string, limit: number = 10): Promise<Company[]> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return []
      }
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .or(`name.ilike.%${query}%,name.ilike.${query}%`)
        .order('name')
        .limit(limit)

      if (error) {
        console.error('Error searching companies:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error searching companies:', error)
      throw error
    }
  }

  /**
   * Get companies by country
   */
  static async getCompaniesByCountry(country: string, limit: number = 50): Promise<Company[]> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return []
      }
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('country', country)
        .order('name')
        .limit(limit)

      if (error) {
        console.error('Error fetching companies by country:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching companies by country:', error)
      throw error
    }
  }

  /**
   * Get companies by industry
   */
  static async getCompaniesByIndustry(industry: string, limit: number = 50): Promise<Company[]> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return []
      }
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('industry', industry)
        .order('name')
        .limit(limit)

      if (error) {
        console.error('Error fetching companies by industry:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching companies by industry:', error)
      throw error
    }
  }

  /**
   * Create a new company
   */
  static async createCompany(companyData: {
    name: string
    country: string
    industry?: string
    website?: string
    logo_url?: string
  }): Promise<Company> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        throw new Error('Supabase client not initialized')
      }
      
      const { data, error } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single()

      if (error) {
        console.error('Error creating company:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error creating company:', error)
      throw error
    }
  }

  /**
   * Get company by name
   */
  static async getCompanyByName(name: string): Promise<Company | null> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return null
      }
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('name', name)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null
        }
        console.error('Error fetching company by name:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching company by name:', error)
      throw error
    }
  }

  /**
   * Get or create company by name
   */
  static async getOrCreateCompany(companyData: {
    name: string
    country: string
    industry?: string
    website?: string
    logo_url?: string
  }): Promise<Company> {
    try {
      // First try to find existing company
      const existingCompany = await this.getCompanyByName(companyData.name)
      if (existingCompany) {
        return existingCompany
      }

      // If not found, create new company
      return await this.createCompany(companyData)
    } catch (error) {
      console.error('Error getting or creating company:', error)
      throw error
    }
  }

  /**
   * Get popular companies (most commonly used)
   */
  static async getPopularCompanies(limit: number = 20): Promise<Company[]> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return []
      }
      
      // For now, return companies from USA and Finland
      // In the future, this could be based on actual usage statistics
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .in('country', ['USA', 'Finland'])
        .order('name')
        .limit(limit)

      if (error) {
        console.error('Error fetching popular companies:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching popular companies:', error)
      throw error
    }
  }
} 