'use client'

import { useState } from 'react'
import { Job } from '@/lib/supabase'
import JobCard from './JobCard'
import StatusBoard from './StatusBoard'
import { cn } from '@/lib/utils'

interface JobListProps {
  jobs: Job[]
  onUpdate: (id: string, updates: Partial<Job>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onError: (message: string) => void
  onSuccess: (message: string) => void
  onConfirmDelete: (id: string, jobName: string) => void
}

export default function JobList({ jobs, onUpdate, onDelete, onError, onSuccess, onConfirmDelete }: JobListProps) {
  const [editingJob, setEditingJob] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'company' | 'role' | 'status' | 'applied_date' | 'created_at'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const sortedJobs = [...jobs].sort((a, b) => {
    let aValue: any = a[sortBy]
    let bValue: any = b[sortBy]

    // Handle date sorting
    if (sortBy === 'applied_date' || sortBy === 'created_at') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }

    // Handle string sorting
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800'
      case 'interviewing':
        return 'bg-yellow-100 text-yellow-800'
      case 'offer':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: Job['status']) => {
    switch (status) {
      case 'applied':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'interviewing':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'offer':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'rejected':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const renderListView = () => {
    if (jobs.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Job Applications</h3>
            <p className="text-gray-600">Start by adding your first job application to track your progress.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors" onClick={() => handleSort('company')}>
                  <div className="flex items-center space-x-1">
                    <span>Company</span>
                    {sortBy === 'company' && (
                      <svg className={cn("w-4 h-4", sortOrder === 'asc' ? 'rotate-180' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors" onClick={() => handleSort('role')}>
                  <div className="flex items-center space-x-1">
                    <span>Role</span>
                    {sortBy === 'role' && (
                      <svg className={cn("w-4 h-4", sortOrder === 'asc' ? 'rotate-180' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    {sortBy === 'status' && (
                      <svg className={cn("w-4 h-4", sortOrder === 'asc' ? 'rotate-180' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors" onClick={() => handleSort('applied_date')}>
                  <div className="flex items-center space-x-1">
                    <span>Applied Date</span>
                    {sortBy === 'applied_date' && (
                      <svg className={cn("w-4 h-4", sortOrder === 'asc' ? 'rotate-180' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors" onClick={() => handleSort('created_at')}>
                  <div className="flex items-center space-x-1">
                    <span>Added</span>
                    {sortBy === 'created_at' && (
                      <svg className={cn("w-4 h-4", sortOrder === 'asc' ? 'rotate-180' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200/50">
              {sortedJobs.map((job, index) => (
                <tr key={`${job.id}-${index}`} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {job.company.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{job.company}</div>
                        {job.link && (
                          <a 
                            href={job.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            View Job →
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{job.role}</div>
                    {job.notes && (
                      <div className="text-sm text-gray-500 truncate max-w-xs" title={job.notes}>
                        {job.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      getStatusColor(job.status)
                    )}>
                      {getStatusIcon(job.status)}
                      <span className="ml-1 capitalize">{job.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(job.applied_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(job.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingJob(editingJob === job.id ? null : job.id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {editingJob === job.id ? 'Cancel' : 'Edit'}
                      </button>
                      <button
                        onClick={() => onDelete(job.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderKanbanView = () => {
    return (
      <StatusBoard
        jobs={jobs}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onError={onError}
        onSuccess={onSuccess}
        onConfirmDelete={onConfirmDelete}
      />
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Job Applications</h3>
          <p className="text-gray-600">Start by adding your first job application to track your progress.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* View Mode Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-1">
        <div className="flex">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200",
              viewMode === 'list'
                ? "bg-blue-50 text-blue-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>List View</span>
            </div>
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200",
              viewMode === 'kanban'
                ? "bg-blue-50 text-blue-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Kanban Board</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? renderListView() : renderKanbanView()}

      {/* Edit Modal for each job */}
      {editingJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Job Application</h3>
                <button
                  onClick={() => setEditingJob(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <JobCard
                job={jobs.find(j => j.id === editingJob)!}
                onUpdate={onUpdate}
                onDelete={onDelete}
                isEditing={true}
                onClose={() => setEditingJob(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 