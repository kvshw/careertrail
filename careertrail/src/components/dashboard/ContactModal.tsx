'use client'

import { useState, useEffect } from 'react'
import { Contact, ContactFormData } from '@/lib/supabase'
import { ContactService } from '@/lib/contacts'

interface ContactModalProps {
  contact?: Contact | null
  onClose: () => void
  onSubmit: (contactData: ContactFormData) => Promise<void>
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function ContactModal({ contact, onClose, onSubmit, onError, onSuccess }: ContactModalProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    linkedin_url: '',
    category: 'networking',
    status: 'active',
    source: undefined,
    relationship_strength: undefined,
    notes: '',
    tags: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (contact) {
      setFormData({
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        role: contact.role || '',
        linkedin_url: contact.linkedin_url || '',
        category: contact.category,
        status: contact.status,
        source: contact.source,
        relationship_strength: contact.relationship_strength,
        notes: contact.notes || '',
        tags: contact.tags || []
      })
    }
  }, [contact])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      onError('First name and last name are required')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onSuccess(contact ? 'Contact updated successfully!' : 'Contact created successfully!')
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to save contact')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const handleLinkedInUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, linkedin_url: url }))
    
    // Auto-validate LinkedIn URL
    if (url && !ContactService.validateLinkedInUrl(url)) {
      // URL is invalid, but we'll let the user continue
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {contact ? 'Edit Contact' : 'Add New Contact'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors"
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role/Title
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors"
                  placeholder="Enter job title"
                />
              </div>
            </div>

            {/* LinkedIn URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => handleLinkedInUrlChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors"
                placeholder="https://linkedin.com/in/username"
              />
              {formData.linkedin_url && !ContactService.validateLinkedInUrl(formData.linkedin_url) && (
                <p className="text-sm text-yellow-600 mt-1">Please enter a valid LinkedIn profile URL</p>
              )}
            </div>

            {/* Category and Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Contact['category'] }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-colors"
                >
                  <option value="recruiter">Recruiter</option>
                  <option value="hiring_manager">Hiring Manager</option>
                  <option value="colleague">Colleague</option>
                  <option value="networking">Networking</option>
                  <option value="referral">Referral</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Contact['status'] }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-colors"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source
                </label>
                <select
                  value={formData.source || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    source: e.target.value ? e.target.value as Contact['source'] : undefined 
                  }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-colors"
                >
                  <option value="">Select source</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="referral">Referral</option>
                  <option value="cold_outreach">Cold Outreach</option>
                  <option value="event">Event</option>
                  <option value="mutual_connection">Mutual Connection</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Relationship Strength */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship Strength
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, relationship_strength: star }))}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        formData.relationship_strength && star <= formData.relationship_strength
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {star}
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {formData.relationship_strength ? `${formData.relationship_strength}/5` : 'Not set'}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors"
                    placeholder="Add a tag and press Enter"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-lg"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors resize-none"
                placeholder="Add any additional notes about this contact..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-pink-500 border border-transparent rounded-xl hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  contact ? 'Update Contact' : 'Create Contact'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 