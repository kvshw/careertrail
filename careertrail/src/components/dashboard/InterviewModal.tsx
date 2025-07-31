'use client'

import { useState, useEffect } from 'react'
import { Interview, InterviewFormData, Job } from '@/lib/supabase'
import { InterviewService } from '@/lib/interviews'
import Button from '@/components/ui/Button'

interface InterviewModalProps {
  interview?: Interview
  jobs: Job[]
  onClose: () => void
  onSubmit: (interviewData: InterviewFormData) => Promise<void>
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function InterviewModal({
  interview,
  jobs,
  onClose,
  onSubmit,
  onError,
  onSuccess
}: InterviewModalProps) {
  const [formData, setFormData] = useState<InterviewFormData>({
    job_id: '',
    title: '',
    interview_type: 'phone',
    status: 'scheduled',
    scheduled_date: '',
    duration_minutes: 60,
    location: '',
    meeting_url: '',
    interviewer_name: '',
    interviewer_role: '',
    interviewer_email: '',
    notes: '',
    preparation_notes: '',
    feedback: '',
    outcome: 'pending'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (interview) {
      setFormData({
        job_id: interview.job_id || '',
        title: interview.title,
        interview_type: interview.interview_type,
        status: interview.status,
        scheduled_date: interview.scheduled_date.slice(0, 16), // Format for datetime-local input
        duration_minutes: interview.duration_minutes,
        location: interview.location || '',
        meeting_url: interview.meeting_url || '',
        interviewer_name: interview.interviewer_name || '',
        interviewer_role: interview.interviewer_role || '',
        interviewer_email: interview.interviewer_email || '',
        notes: interview.notes || '',
        preparation_notes: interview.preparation_notes || '',
        feedback: interview.feedback || '',
        outcome: interview.outcome || 'pending'
      })
    }
  }, [interview])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      onError('Please provide an interview title')
      return
    }

    if (!formData.scheduled_date) {
      onError('Please select a scheduled date')
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit(formData)
      onSuccess(interview ? 'Interview updated successfully!' : 'Interview scheduled successfully!')
      onClose()
    } catch (error) {
      console.error('Error submitting interview:', error)
      onError('Failed to save interview')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof InterviewFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {interview ? 'Edit Interview' : 'Schedule Interview'}
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
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Technical Interview with John Doe"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                required
              />
            </div>

            {/* Job Association */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Job (Optional)
              </label>
              <select
                value={formData.job_id}
                onChange={(e) => handleInputChange('job_id', e.target.value || undefined)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="">No job association</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.role} at {job.company}
                  </option>
                ))}
              </select>
            </div>

            {/* Interview Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Type *
              </label>
              <select
                value={formData.interview_type}
                onChange={(e) => handleInputChange('interview_type', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                required
              >
                <option value="phone">Phone Call</option>
                <option value="video">Video Call</option>
                <option value="onsite">On-site</option>
                <option value="technical">Technical</option>
                <option value="behavioral">Behavioral</option>
                <option value="final">Final Round</option>
                <option value="coffee_chat">Coffee Chat</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Scheduled Date & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value) || 60)}
                  min="15"
                  max="480"
                  step="15"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                />
              </div>
            </div>

            {/* Location & Meeting URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Office address or meeting location"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting URL
                </label>
                <input
                  type="url"
                  value={formData.meeting_url}
                  onChange={(e) => handleInputChange('meeting_url', e.target.value)}
                  placeholder="Zoom, Teams, or other meeting link"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Interviewer Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interviewer Name
                </label>
                <input
                  type="text"
                  value={formData.interviewer_name}
                  onChange={(e) => handleInputChange('interviewer_name', e.target.value)}
                  placeholder="Interviewer's name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={formData.interviewer_role}
                  onChange={(e) => handleInputChange('interviewer_role', e.target.value)}
                  placeholder="e.g., Senior Engineer"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.interviewer_email}
                  onChange={(e) => handleInputChange('interviewer_email', e.target.value)}
                  placeholder="interviewer@company.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes about the interview..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 resize-none"
              />
            </div>

            {/* Preparation Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preparation Notes
              </label>
              <textarea
                value={formData.preparation_notes}
                onChange={(e) => handleInputChange('preparation_notes', e.target.value)}
                placeholder="Research notes, questions to ask, topics to prepare..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 resize-none"
              />
            </div>

            {/* Status & Outcome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outcome
                </label>
                <select
                  value={formData.outcome}
                  onChange={(e) => handleInputChange('outcome', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="pending">Pending</option>
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                  <option value="neutral">Neutral</option>
                  <option value="offer">Offer</option>
                  <option value="rejection">Rejection</option>
                  <option value="next_round">Next Round</option>
                </select>
              </div>
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback
              </label>
              <textarea
                value={formData.feedback}
                onChange={(e) => handleInputChange('feedback', e.target.value)}
                placeholder="Post-interview feedback and notes..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 resize-none"
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
                {isSubmitting ? 'Saving...' : (interview ? 'Update Interview' : 'Schedule Interview')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 