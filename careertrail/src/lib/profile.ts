import { supabase } from './supabase'
import { UserProfile, UserProfileFormData } from './supabase'

export class ProfileService {
  // Get user profile or create one if it doesn't exist
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return null
      }
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          return await this.createDefaultProfile(userId)
        }
        console.error('Error fetching user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getUserProfile:', error)
      return null
    }
  }

  // Create a default profile for a user
  static async createDefaultProfile(userId: string): Promise<UserProfile | null> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return null
      }
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          display_name: userId.split('@')[0], // Use email prefix as display name
          preferences: {
            email_notifications: true,
            weekly_summary: true,
            job_alerts: true
          }
        })
        .select()
        .single()

      if (error) {
        // If profile already exists, try to fetch it instead
        if (error.code === '23505') {
          return await this.getUserProfile(userId)
        }
        console.error('Error creating default profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createDefaultProfile:', error)
      return null
    }
  }

  // Create or update user profile
  static async upsertUserProfile(userId: string, profileData: UserProfileFormData): Promise<UserProfile | null> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return null
      }
      
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          ...profileData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single()

      if (error) {
        console.error('Error upserting user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in upsertUserProfile:', error)
      return null
    }
  }

  // Upload avatar
  static async uploadAvatar(userId: string, file: File): Promise<string | null> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return null
      }
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError)
        return null
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error in uploadAvatar:', error)
      return null
    }
  }

  // Delete avatar
  static async deleteAvatar(userId: string, avatarUrl: string): Promise<boolean> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return false
      }
      
      // Extract file path from URL
      const urlParts = avatarUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `avatars/${fileName}`

      const { error } = await supabase.storage
        .from('user-avatars')
        .remove([filePath])

      if (error) {
        console.error('Error deleting avatar:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteAvatar:', error)
      return false
    }
  }

  // Update user preferences
  static async updatePreferences(userId: string, preferences: UserProfileFormData['preferences']): Promise<boolean> {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return false
      }
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          preferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating preferences:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updatePreferences:', error)
      return false
    }
  }
} 