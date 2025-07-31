'use client'

import { useState } from 'react'
import { Interview, Job } from '@/lib/supabase'
import { InterviewService } from '@/lib/interviews'
import Button from '@/components/ui/Button'

interface InterviewListProps {
  interviews: Interview[]
  jobs: Job[]
  onUpdate: (id: string, updates: Partial<Interview>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onEdit: (interview: Interview) => void
  onError: (message: string) => void
  onSuccess: (message: string) => void
  onConfirmDelete: (id: string, interviewTitle: string) => void
}

export default function InterviewList({
  interviews,
  jobs,
  onUpdate,
  onDelete,
  onEdit,
  onError,
  onSuccess,
  onConfirmDelete
}: InterviewListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStatusChange = async (interviewId: string, newStatus: Interview['status']) => {
    try {
      setIsSubmitting(true)
      await onUpdate(interviewId, { status: newStatus })
      onSuccess('Interview status updated successfully!')
    } catch (error) {
      console.error('Error updating interview status:', error)
      onError('Failed to update interview status')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (interviewId: string) => {
    const interview = interviews.find(i => i.id === interviewId)
    const interviewTitle = interview ? interview.title : 'this interview'
    onConfirmDelete(interviewId, interviewTitle)
  }

  if (interviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews scheduled</h3>
        <p className="text-gray-600">Get started by scheduling your first interview.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {interviews.map((interview, index) => (
        <div
          key={`${interview.id}-${index}`}
          className="bg-white rounded-xl border border-gray-200/50 p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">
                  {InterviewService.getInterviewTypeIcon(interview.interview_type)}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{interview.title}</h3>
                  {interview.jobs && (
                    <p className="text-sm text-gray-600">
                      {interview.jobs.role} at {interview.jobs.company}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Scheduled</p>
                  <p className="text-sm font-medium text-gray-900">
                    {InterviewService.formatDateTime(interview.scheduled_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Duration</p>
                  <p className="text-sm font-medium text-gray-900">
                    {interview.duration_minutes} minutes
                  </p>
                </div>
                {interview.location && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="text-sm font-medium text-gray-900">{interview.location}</p>
                  </div>
                )}
                {interview.interviewer_name && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Interviewer</p>
                    <p className="text-sm font-medium text-gray-900">
                      {interview.interviewer_name}
                      {interview.interviewer_role && ` (${interview.interviewer_role})`}
                    </p>
                  </div>
                )}
              </div>

              {interview.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{interview.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${InterviewService.getInterviewTypeColor(interview.interview_type)}`}
                >
                  {interview.interview_type.replace('_', ' ')}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${InterviewService.getStatusColor(interview.status)}`}
                >
                  {interview.status.replace('_', ' ')}
                </span>
                {interview.outcome && (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${InterviewService.getOutcomeColor(interview.outcome)}`}
                  >
                    {interview.outcome.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <select
                value={interview.status}
                onChange={(e) => handleStatusChange(interview.id, e.target.value as Interview['status'])}
                disabled={isSubmitting}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rescheduled">Rescheduled</option>
                <option value="no_show">No Show</option>
              </select>

              <Button
                onClick={() => onEdit(interview)}
                disabled={isSubmitting}
                variant="secondary"
                size="sm"
              >
                Edit
              </Button>

              <Button
                onClick={() => handleDelete(interview.id)}
                disabled={isSubmitting}
                variant="danger"
                size="sm"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 