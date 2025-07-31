'use client'

import { useState } from 'react'
import { Job } from '@/lib/supabase'
import { Company } from '@/lib/supabase'
import CompanySearch from '@/components/ui/CompanySearch'
import { cn } from '@/lib/utils'
import { LinkedInJobParser } from '@/lib/linkedin-parser'

interface JobCardProps {
  job: Job
  onUpdate: (id: string, updates: Partial<Job>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isEditing?: boolean
  onClose?: () => void
}

export default function JobCard({ job, onUpdate, onDelete, isEditing: externalIsEditing, onClose }: JobCardProps) {
  const [internalIsEditing, setInternalIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    company: job.company,
    role: job.role,
    status: job.status,
    applied_date: job.applied_date,
    link: job.link || '',
    notes: job.notes || ''
  })
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isParsingLinkedIn, setIsParsingLinkedIn] = useState(false)

  const isEditing = externalIsEditing !== undefined ? externalIsEditing : internalIsEditing

  const handleSave = async () => {
    if (!formData.company.trim() || !formData.role.trim()) {
      return
    }

    setSaving(true)
    try {
      await onUpdate(job.id, formData)
      if (externalIsEditing !== undefined) {
        onClose?.()
      } else {
        setInternalIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating job:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      company: job.company,
      role: job.role,
      status: job.status,
      applied_date: job.applied_date,
      link: job.link || '',
      notes: job.notes || ''
    })
    if (externalIsEditing !== undefined) {
      onClose?.()
    } else {
      setInternalIsEditing(false)
    }
  }

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company)
    // Update the company name in form data
    setFormData(prev => ({ ...prev, company: company.name }))
    // Optionally auto-fill the link if the company has a website
    if (company.website && !formData.link) {
      setFormData(prev => ({ ...prev, link: company.website || '' }))
    }
  }

  const handleLinkedInUrlChange = async (url: string) => {
    setFormData(prev => ({ ...prev, link: url }))
    
    // Check if it's a LinkedIn job URL
    if (LinkedInJobParser.isValidLinkedInJobUrl(url)) {
      setIsParsingLinkedIn(true)
      try {
        // Attempt to scrape full job details from LinkedIn
        const jobData = await LinkedInJobParser.fetchJobDetails(url)
        
        if (jobData) {
          // Update form with scraped information
          setFormData(prev => ({
            ...prev,
            role: jobData.role || prev.role,
            company: jobData.company || prev.company,
            notes: jobData.description || prev.notes // Store description in notes field
          }))
          
          console.log('LinkedIn job details scraped successfully:', jobData)
        } else {
          // Fallback to URL parsing if scraping fails
          const parsedData = LinkedInJobParser.parseLinkedInJobUrl(url)
          setFormData(prev => ({
            ...prev,
            role: parsedData.jobTitle || prev.role,
            company: parsedData.company || prev.company
          }))
          
          console.log('LinkedIn URL detected but scraping failed, using URL parsing')
        }
      } catch (error) {
        console.error('Error processing LinkedIn URL:', error)
        
        // Fallback to URL parsing
        const parsedData = LinkedInJobParser.parseLinkedInJobUrl(url)
        setFormData(prev => ({
          ...prev,
          role: parsedData.jobTitle || prev.role,
          company: parsedData.company || prev.company
        }))
      } finally {
        setIsParsingLinkedIn(false)
      }
    }
  }

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

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/50 p-4 shadow-sm">
        <div className="space-y-4">
          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company *
            </label>
            <CompanySearch
              value={formData.company}
              onChange={(companyName) => {
                setFormData(prev => ({ ...prev, company: companyName }))
                // Clear selected company when user manually types
                if (selectedCompany && selectedCompany.name !== companyName) {
                  setSelectedCompany(null)
                }
              }}
              onCompanySelect={handleCompanySelect}
              placeholder="Search for a company..."
              error={!formData.company.trim()}
            />
            {selectedCompany && (
              <div className="mt-2 flex items-center space-x-2 text-xs text-gray-600">
                <span>Selected:</span>
                <span className="font-medium">{selectedCompany.name}</span>
                {selectedCompany.industry && (
                  <>
                    <span>•</span>
                    <span>{selectedCompany.industry}</span>
                  </>
                )}
                <span>•</span>
                <span>{selectedCompany.country}</span>
              </div>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role/Position *
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              placeholder="e.g., Software Engineer, Product Manager"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Job['status'] }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-colors"
              required
            >
              <option value="applied">Applied</option>
              <option value="interviewing">Interviewing</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Applied Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Applied Date *
            </label>
            <input
              type="date"
              value={formData.applied_date}
              onChange={(e) => setFormData(prev => ({ ...prev, applied_date: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-colors"
              required
            />
          </div>

          {/* Job Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Link
            </label>
            <div className="relative">
              <input
                type="url"
                value={formData.link}
                onChange={(e) => handleLinkedInUrlChange(e.target.value)}
                placeholder="https://www.linkedin.com/jobs/view/4257191625 or company career page"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors"
              />
              {isParsingLinkedIn && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            {formData.link && LinkedInJobParser.isValidLinkedInJobUrl(formData.link) && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <div className="text-xs text-blue-800">
                    <div className="font-medium mb-1">LinkedIn Job Detected!</div>
                    <div className="text-blue-600">
                      Job ID: {LinkedInJobParser.extractJobId(formData.link)}
                    </div>
                    <div className="text-blue-600 mt-1">
                      Attempting to extract job details automatically...
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes about this application..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.company.trim() || !formData.role.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-pink-500 border border-transparent rounded-xl hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200/50 p-4 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {job.company.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">{job.company}</h4>
            <p className="text-sm text-gray-600 truncate">{job.role}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setInternalIsEditing(true)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(job.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            getStatusColor(job.status)
          )}>
            {getStatusIcon(job.status)}
            <span className="ml-1 capitalize">{job.status}</span>
          </span>
          <span className="text-xs text-gray-500">
            Applied: {new Date(job.applied_date).toLocaleDateString()}
          </span>
        </div>

        {job.link && (
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <a
              href={job.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors truncate"
            >
              View Job Posting
            </a>
          </div>
        )}

        {job.notes && (
          <p className="text-sm text-gray-600 line-clamp-2">{job.notes}</p>
        )}
      </div>
    </div>
  )
} 