'use client'

import { useState } from 'react'
import { ContactInteraction, Job } from '@/lib/supabase'
import { ContactService } from '@/lib/contacts'

interface ContactTimelineProps {
  interactions: ContactInteraction[]
  jobs: Job[]
  onEditInteraction: (interaction: ContactInteraction) => void
  onDeleteInteraction: (id: string) => void
  onError: (message: string) => void
  onSuccess: (message: string) => void
  onConfirmDeleteInteraction: (id: string, interactionType: string) => void
}

export default function ContactTimeline({
  interactions,
  jobs,
  onEditInteraction,
  onDeleteInteraction,
  onError,
  onSuccess,
  onConfirmDeleteInteraction
}: ContactTimelineProps) {
  const [expandedInteraction, setExpandedInteraction] = useState<string | null>(null)

  const getJobName = (jobId?: string) => {
    if (!jobId) return null
    const job = jobs.find(j => j.id === jobId)
    return job ? `${job.role} at ${job.company}` : null
  }

  const getFollowUpStatus = (followUpDate?: string) => {
    if (!followUpDate) return null
    
    const now = new Date()
    const followUp = new Date(followUpDate)
    const diffDays = Math.ceil((followUp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { status: 'overdue', text: 'Overdue', color: 'text-red-600 bg-red-50' }
    if (diffDays === 0) return { status: 'today', text: 'Today', color: 'text-orange-600 bg-orange-50' }
    if (diffDays <= 3) return { status: 'soon', text: 'Soon', color: 'text-yellow-600 bg-yellow-50' }
    return { status: 'upcoming', text: 'Upcoming', color: 'text-green-600 bg-green-50' }
  }

  if (interactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No interactions yet</h3>
        <p className="text-gray-600">Start building your relationship by logging your first interaction.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Interaction Timeline</h3>
        <span className="text-sm text-gray-500">{interactions.length} interactions</span>
      </div>
      
      <div className="space-y-4">
        {interactions.map((interaction, index) => {
          const jobName = getJobName(interaction.job_id)
          const followUpStatus = getFollowUpStatus(interaction.follow_up_date)
          const isExpanded = expandedInteraction === interaction.id
          
          return (
            <div
              key={`${interaction.id}-${index}`}
              className="bg-white rounded-xl border border-gray-200/50 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Interaction Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${ContactService.getInteractionTypeColor(interaction.interaction_type)}`}>
                    {ContactService.getInteractionTypeIcon(interaction.interaction_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">
                        {interaction.subject || ContactService.getInteractionTypeIcon(interaction.interaction_type)}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        interaction.direction === 'outbound' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {interaction.direction === 'outbound' ? 'Outbound' : 'Inbound'}
                      </span>
                      {interaction.response_received && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          ✓ Response
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{ContactService.formatDateTime(interaction.created_at)}</span>
                      {jobName && (
                        <span className="text-blue-600">• {jobName}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {followUpStatus && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${followUpStatus.color}`}>
                      {followUpStatus.text}
                    </span>
                  )}
                  <button
                    onClick={() => setExpandedInteraction(isExpanded ? null : interaction.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg 
                      className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {interaction.content && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Content</h5>
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        {interaction.content}
                      </p>
                    </div>
                  )}
                  
                  {interaction.follow_up_date && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Follow-up</h5>
                      <p className="text-sm text-gray-600">
                        {ContactService.formatDateTime(interaction.follow_up_date)}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => onEditInteraction(interaction)}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        onConfirmDeleteInteraction(interaction.id, interaction.interaction_type)
                      }}
                      className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 