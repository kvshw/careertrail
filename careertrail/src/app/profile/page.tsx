'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { UserProfile, UserProfileFormData } from '@/lib/supabase'
import { ProfileService } from '@/lib/profile'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Toast from '@/components/dashboard/Toast'
import { useRouter } from 'next/navigation'


export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'security'>('profile')
  const [formData, setFormData] = useState<UserProfileFormData>({
    first_name: '',
    last_name: '',
    display_name: '',
    bio: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    phone: '',
    timezone: 'UTC',
    preferences: {
      email_notifications: true,
      weekly_summary: true,
      job_alerts: true
    }
  })
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'info'
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      
      const userProfile = await ProfileService.getUserProfile(user.id)
      
      if (userProfile) {
        setProfile(userProfile)
        setFormData({
          first_name: userProfile.first_name || '',
          last_name: userProfile.last_name || '',
          display_name: userProfile.display_name || '',
          bio: userProfile.bio || '',
          location: userProfile.location || '',
          website: userProfile.website || '',
          linkedin: userProfile.linkedin || '',
          github: userProfile.github || '',
          phone: userProfile.phone || '',
          timezone: userProfile.timezone || 'UTC',
          preferences: userProfile.preferences || {
            email_notifications: true,
            weekly_summary: true,
            job_alerts: true
          }
        })
      } else {
        handleError('Failed to load or create profile. Please try refreshing the page.')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      handleError('Failed to load profile. Please try refreshing the page.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user?.id) return

    try {
      setSaving(true)
      const updatedProfile = await ProfileService.upsertUserProfile(user.id, formData)
      
      if (updatedProfile) {
        setProfile(updatedProfile)
        handleSuccess('Profile updated successfully!')
      } else {
        handleError('Failed to update profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      handleError('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user?.id) return

    try {
      setUploadingAvatar(true)
      const avatarUrl = await ProfileService.uploadAvatar(user.id, file)
      
      if (avatarUrl) {
        // Update profile with new avatar URL
        const updatedProfile = await ProfileService.upsertUserProfile(user.id, {
          ...formData,
          avatar_url: avatarUrl
        })
        
        if (updatedProfile) {
          setProfile(updatedProfile)
          setFormData(prev => ({ ...prev, avatar_url: avatarUrl }))
          handleSuccess('Avatar updated successfully!')
        }
      } else {
        handleError('Failed to upload avatar')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      handleError('Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleError = (message: string) => {
    setToast({ show: true, message, type: 'error' })
  }

  const handleSuccess = (message: string) => {
    setToast({ show: true, message, type: 'success' })
  }

  const getDisplayName = () => {
    if (profile?.display_name) return profile.display_name
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    if (profile?.first_name) return profile.first_name
    return user?.email?.split('@')[0] || 'User'
  }

  const getInitials = () => {
    const name = getDisplayName()
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/signin')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar currentPage="profile" />
      
      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <Header
          title="Profile & Settings"
          subtitle="Manage your account and preferences"
          showSearch={false}
        />
        
        {/* Content */}
        <main className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Header */}
            <Card className="p-8">
              <div className="flex items-center space-x-6">
                {/* Avatar Section */}
                <div className="relative">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {getInitials()}
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-700 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                    {uploadingAvatar ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </label>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{getDisplayName()}</h1>
                  <p className="text-gray-600 mb-1">{user?.email}</p>
                  {profile?.location && (
                    <p className="text-gray-500 text-sm flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profile.location}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-white rounded-2xl p-1 shadow-sm">
              {[
                { id: 'profile', label: 'Profile', icon: '👤' },
                { id: 'settings', label: 'Settings', icon: '⚙️' },
                { id: 'security', label: 'Security', icon: '🔒' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/50'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'profile' && (
                <Card>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          value={formData.first_name || ''}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors text-gray-900 placeholder-gray-500"
                          placeholder="Enter your first name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={formData.last_name || ''}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors text-gray-900 placeholder-gray-500"
                          placeholder="Enter your last name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                        <input
                          type="text"
                          value={formData.display_name || ''}
                          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors text-gray-900 placeholder-gray-500"
                          placeholder="How should we display your name?"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          value={formData.location || ''}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors text-gray-900 placeholder-gray-500"
                          placeholder="City, Country"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors text-gray-900 placeholder-gray-500"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                        <input
                          type="url"
                          value={formData.website || ''}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors text-gray-900 placeholder-gray-500"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                        <input
                          type="url"
                          value={formData.linkedin || ''}
                          onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors text-gray-900 placeholder-gray-500"
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                        <input
                          type="url"
                          value={formData.github || ''}
                          onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors text-gray-900 placeholder-gray-500"
                          placeholder="https://github.com/yourusername"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        value={formData.bio || ''}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors resize-none text-gray-900 placeholder-gray-500"
                        placeholder="Tell us a bit about yourself..."
                      />
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                      <Button
                        onClick={handleSaveProfile}
                        loading={saving}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === 'settings' && (
                <Card>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <h3 className="font-medium text-gray-900">Email Notifications</h3>
                          <p className="text-sm text-gray-600">Receive updates about your job applications</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.preferences?.email_notifications || false}
                            onChange={(e) => setFormData({
                              ...formData,
                              preferences: {
                                ...formData.preferences,
                                email_notifications: e.target.checked
                              }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <h3 className="font-medium text-gray-900">Weekly Summary</h3>
                          <p className="text-sm text-gray-600">Get a weekly digest of your job search activity</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.preferences?.weekly_summary || false}
                            onChange={(e) => setFormData({
                              ...formData,
                              preferences: {
                                ...formData.preferences,
                                weekly_summary: e.target.checked
                              }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <h3 className="font-medium text-gray-900">Job Alerts</h3>
                          <p className="text-sm text-gray-600">Receive notifications about new job opportunities</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.preferences?.job_alerts || false}
                            onChange={(e) => setFormData({
                              ...formData,
                              preferences: {
                                ...formData.preferences,
                                job_alerts: e.target.checked
                              }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                      <Button
                        onClick={handleSaveProfile}
                        loading={saving}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Preferences'}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === 'security' && (
                <Card>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                    
                    <div className="space-y-6">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h3 className="font-medium text-gray-900 mb-2">Change Password</h3>
                        <p className="text-sm text-gray-600 mb-4">Update your account password for enhanced security</p>
                        <Button variant="outline">
                          Change Password
                        </Button>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h3 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-600 mb-4">Add an extra layer of security to your account</p>
                        <Button variant="outline">
                          Enable 2FA
                        </Button>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h3 className="font-medium text-gray-900 mb-2">Active Sessions</h3>
                        <p className="text-sm text-gray-600 mb-4">Manage your active login sessions</p>
                        <Button variant="outline">
                          View Sessions
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  )
} 