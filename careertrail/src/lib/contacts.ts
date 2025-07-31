import { supabase } from './supabase'
import { Contact, ContactFormData, ContactInteraction, ContactInteractionFormData, ContactJob, ContactJobFormData } from './supabase'

export class ContactService {
  // Contact CRUD operations
  static async getContacts(userId: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Error fetching contacts: ${error.message}`)
    }

    return data || []
  }

  static async getContact(id: string, userId: string): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      throw new Error(`Error fetching contact: ${error.message}`)
    }

    return data
  }

  static async createContact(contactData: ContactFormData, userId: string): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .insert([{ ...contactData, user_id: userId }])
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating contact: ${error.message}`)
    }

    return data
  }

  static async updateContact(id: string, updates: Partial<ContactFormData>, userId: string): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating contact: ${error.message}`)
    }

    return data
  }

  static async deleteContact(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Error deleting contact: ${error.message}`)
    }
  }

  // Contact Interaction operations
  static async getContactInteractions(contactId: string, userId: string): Promise<ContactInteraction[]> {
    const { data, error } = await supabase
      .from('contact_interactions')
      .select('*')
      .eq('contact_id', contactId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Error fetching contact interactions: ${error.message}`)
    }

    return data || []
  }

  static async getAllContactInteractions(userId: string): Promise<ContactInteraction[]> {
    const { data, error } = await supabase
      .from('contact_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Error fetching all contact interactions: ${error.message}`)
    }

    return data || []
  }

  static async createInteraction(interactionData: ContactInteractionFormData, userId: string): Promise<ContactInteraction> {
    // Clean up the data before sending to database
    const cleanedData = {
      ...interactionData,
      user_id: userId,
      follow_up_date: interactionData.follow_up_date || null,
      job_id: interactionData.job_id || null
    }
    
    const { data, error } = await supabase
      .from('contact_interactions')
      .insert([cleanedData])
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating interaction: ${error.message}`)
    }

    return data
  }

  static async updateInteraction(id: string, updates: Partial<ContactInteractionFormData>, userId: string): Promise<ContactInteraction> {
    // Clean up the data before sending to database
    const cleanedUpdates = {
      ...updates,
      follow_up_date: updates.follow_up_date || null,
      job_id: updates.job_id || null
    }
    
    const { data, error } = await supabase
      .from('contact_interactions')
      .update(cleanedUpdates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating interaction: ${error.message}`)
    }

    return data
  }

  static async deleteInteraction(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('contact_interactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Error deleting interaction: ${error.message}`)
    }
  }

  // Contact Job Relationship operations
  static async getContactJobs(contactId: string): Promise<ContactJob[]> {
    const { data, error } = await supabase
      .from('contact_jobs')
      .select(`
        *,
        jobs (
          id,
          company,
          role,
          status
        )
      `)
      .eq('contact_id', contactId)

    if (error) {
      throw new Error(`Error fetching contact jobs: ${error.message}`)
    }

    return data || []
  }

  static async createContactJob(contactJobData: ContactJobFormData): Promise<ContactJob> {
    const { data, error } = await supabase
      .from('contact_jobs')
      .insert([contactJobData])
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating contact job relationship: ${error.message}`)
    }

    return data
  }

  static async deleteContactJob(id: string): Promise<void> {
    const { error } = await supabase
      .from('contact_jobs')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Error deleting contact job relationship: ${error.message}`)
    }
  }

  // Utility functions
  static getContactInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  static getContactFullName(firstName: string, lastName: string): string {
    return `${firstName} ${lastName}`.trim()
  }

  static getCategoryColor(category: Contact['category']): string {
    const colors = {
      recruiter: '#3B82F6', // Blue
      hiring_manager: '#10B981', // Green
      colleague: '#F59E0B', // Yellow
      networking: '#8B5CF6', // Purple
      referral: '#EF4444', // Red
      other: '#6B7280' // Gray
    }
    return colors[category] || colors.other
  }

  static getCategoryIcon(category: Contact['category']): string {
    const icons = {
      recruiter: '👔',
      hiring_manager: '👨‍💼',
      colleague: '👥',
      networking: '🤝',
      referral: '📞',
      other: '👤'
    }
    return icons[category] || icons.other
  }

  static getInteractionTypeIcon(type: ContactInteraction['interaction_type']): string {
    const icons = {
      email: '📧',
      call: '📞',
      meeting: '🤝',
      linkedin_message: '💼',
      note: '📝',
      coffee_chat: '☕',
      referral_request: '📤'
    }
    return icons[type] || '📝'
  }

  static getInteractionTypeColor(type: ContactInteraction['interaction_type']): string {
    const colors = {
      email: '#3B82F6',
      call: '#10B981',
      meeting: '#F59E0B',
      linkedin_message: '#8B5CF6',
      note: '#6B7280',
      coffee_chat: '#EF4444',
      referral_request: '#EC4899'
    }
    return colors[type] || '#6B7280'
  }

  static formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  static formatDateTime(date: string): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  static getFollowUpStatus(followUpDate?: string): 'overdue' | 'today' | 'upcoming' | 'none' {
    if (!followUpDate) return 'none'
    
    const today = new Date()
    const followUp = new Date(followUpDate)
    const diffTime = followUp.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'overdue'
    if (diffDays === 0) return 'today'
    return 'upcoming'
  }

  static validateLinkedInUrl(url: string): boolean {
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/
    return linkedinRegex.test(url)
  }

  static extractLinkedInUsername(url: string): string | null {
    const match = url.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/)
    return match ? match[1] : null
  }
} 