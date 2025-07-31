'use client'

import { useState, useEffect } from 'react'
import { ContactInteraction, ContactInteractionFormData, Job } from '@/lib/supabase'
import { ContactService } from '@/lib/contacts'

interface ContactInteractionModalProps {
  interaction?: ContactInteraction
  contactId: string
  jobs: Job[]
  onClose: () => void
  onSubmit: (interactionData: ContactInteractionFormData) => Promise<void>
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function ContactInteractionModal({
  interaction,
  contactId,
  jobs,
  onClose,
  onSubmit,
  onError,
  onSuccess
}: ContactInteractionModalProps) {
  const [formData, setFormData] = useState<ContactInteractionFormData>({
    contact_id: contactId,
    interaction_type: 'email',
    subject: '',
    content: '',
    direction: 'outbound',
    response_received: false,
    follow_up_date: '',
    job_id: undefined
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (interaction) {
      setFormData({
        contact_id: interaction.contact_id,
        interaction_type: interaction.interaction_type,
        subject: interaction.subject || '',
        content: interaction.content || '',
        direction: interaction.direction,
        response_received: interaction.response_received,
        follow_up_date: interaction.follow_up_date || '',
        job_id: interaction.job_id || undefined
      })
    }
  }, [interaction])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!(formData.subject?.trim()) && !(formData.content?.trim())) {
      onError('Please provide either a subject or content for the interaction')
      return
    }

    try {
      setIsSubmitting(true)
      
      // Clean up the form data before submitting
      const cleanedFormData = {
        ...formData,
        follow_up_date: formData.follow_up_date?.trim() ? formData.follow_up_date : undefined,
        job_id: formData.job_id || undefined
      }
      
      await onSubmit(cleanedFormData)
      onSuccess(interaction ? 'Interaction updated successfully!' : 'Interaction logged successfully!')
      onClose()
    } catch (error) {
      console.error('Error submitting interaction:', error)
      onError('Failed to save interaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof ContactInteractionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {interaction ? 'Edit Interaction' : 'Log Interaction'}
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
            {/* Interaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interaction Type *
              </label>
              <select
                value={formData.interaction_type}
                onChange={(e) => handleInputChange('interaction_type', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                required
              >
                <option value="email">Email</option>
                <option value="call">Phone Call</option>
                <option value="meeting">Meeting</option>
                <option value="linkedin_message">LinkedIn Message</option>
                <option value="note">Note</option>
                <option value="coffee_chat">Coffee Chat</option>
                <option value="referral_request">Referral Request</option>
              </select>
            </div>

            {/* Direction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Direction *
              </label>
              <select
                value={formData.direction}
                onChange={(e) => handleInputChange('direction', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                required
              >
                <option value="outbound">Outbound (You → Them)</option>
                <option value="inbound">Inbound (Them → You)</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Brief subject or topic"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Details about the interaction..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 resize-none"
              />
            </div>

            {/* Job Association */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Job (Optional)
              </label>
              <select
                value={formData.job_id || ''}
                onChange={(e) => handleInputChange('job_id', e.target.value || undefined)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              >
                <option value="">No job association</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.role} at {job.company}
                  </option>
                ))}
              </select>
            </div>

            {/* Response Received */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="response_received"
                checked={formData.response_received}
                onChange={(e) => handleInputChange('response_received', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="response_received" className="ml-2 text-sm text-gray-700">
                Response received
              </label>
            </div>

            {/* Follow-up Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Follow-up Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={formData.follow_up_date}
                onChange={(e) => handleInputChange('follow_up_date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:from-orange-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : (interaction ? 'Update Interaction' : 'Log Interaction')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 