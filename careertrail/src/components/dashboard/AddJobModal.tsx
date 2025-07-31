'use client'

import { useState, useEffect, useRef } from 'react'
import { JobFormData } from '@/lib/supabase'
import CompanySearch from '@/components/ui/CompanySearch'
import { CompanyService } from '@/lib/companies'

interface AddJobModalProps {
  onClose: () => void
  onSubmit: (jobData: JobFormData) => Promise<void>
}

// Storage keys for persistence
const LINKEDIN_EXTRACTION_STORAGE_KEY = 'careertrail-linkedin-extraction'
const FORM_DATA_STORAGE_KEY = 'careertrail-add-job-form'

export default function AddJobModal({ onClose, onSubmit }: AddJobModalProps) {
  const [formData, setFormData] = useState<JobFormData>({
    company: '',
    role: '',
    status: 'applied',
    applied_date: new Date().toISOString().split('T')[0],
    link: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isParsingLinkedIn, setIsParsingLinkedIn] = useState(false)
  const [linkedInStatus, setLinkedInStatus] = useState<'idle' | 'parsing' | 'success' | 'error' | 'info'>('idle')
  const [linkedInMessage, setLinkedInMessage] = useState('')
  const [extractedData, setExtractedData] = useState<{
    company: string
    role: string
    location: string
    description: string
  } | null>(null)
  const [showCompanyCreationPrompt, setShowCompanyCreationPrompt] = useState(false)
  const [pendingCompanyName, setPendingCompanyName] = useState('')

  // Load persisted state on component mount
  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        // Load form data
        const savedFormData = localStorage.getItem(FORM_DATA_STORAGE_KEY)
        if (savedFormData) {
          const parsed = JSON.parse(savedFormData)
          setFormData(prev => ({ ...prev, ...parsed }))
        }

        // Load LinkedIn extraction state
        const savedExtraction = localStorage.getItem(LINKEDIN_EXTRACTION_STORAGE_KEY)
        if (savedExtraction) {
          const parsed = JSON.parse(savedExtraction)
          setLinkedInStatus(parsed.status || 'idle')
          setLinkedInMessage(parsed.message || '')
          setExtractedData(parsed.extractedData || null)
          setIsParsingLinkedIn(parsed.isParsing || false)
          setShowCompanyCreationPrompt(parsed.showCompanyCreationPrompt || false)
          setPendingCompanyName(parsed.pendingCompanyName || '')
          
          // Check if we need to show company creation prompt
          if (parsed.extractedData?.company && parsed.extractedData.company.trim()) {
            // Check if company exists in database
            try {
              const existingCompanies = await CompanyService.searchCompanies(parsed.extractedData.company, 1)
              const companyExists = existingCompanies.some(company => 
                company.name.toLowerCase() === parsed.extractedData.company.toLowerCase()
              )
              
              if (!companyExists) {
                setPendingCompanyName(parsed.extractedData.company)
                setShowCompanyCreationPrompt(true)
              }
            } catch (error) {
              console.error('Error checking if company exists on load:', error)
              // If there's an error, don't show the prompt to be safe
            }
          }
        }
      } catch (error) {
        console.error('Error loading persisted state:', error)
      }
    }

    loadPersistedState()
  }, [])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(FORM_DATA_STORAGE_KEY, JSON.stringify(formData))
    } catch (error) {
      console.error('Error saving form data:', error)
    }
  }, [formData])

  // Save LinkedIn extraction state to localStorage whenever it changes
  useEffect(() => {
    try {
      const extractionState = {
        status: linkedInStatus,
        message: linkedInMessage,
        extractedData,
        isParsing: isParsingLinkedIn,
        showCompanyCreationPrompt,
        pendingCompanyName
      }
      localStorage.setItem(LINKEDIN_EXTRACTION_STORAGE_KEY, JSON.stringify(extractionState))
    } catch (error) {
      console.error('Error saving extraction state:', error)
    }
  }, [linkedInStatus, linkedInMessage, extractedData, isParsingLinkedIn, showCompanyCreationPrompt, pendingCompanyName])

  // Clear storage when modal is closed
  const handleClose = () => {
    try {
      localStorage.removeItem(FORM_DATA_STORAGE_KEY)
      localStorage.removeItem(LINKEDIN_EXTRACTION_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing storage:', error)
    }
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.company.trim() || !formData.role.trim()) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit(formData)
      
      // Clear storage on successful submission
      try {
        localStorage.removeItem(FORM_DATA_STORAGE_KEY)
        localStorage.removeItem(LINKEDIN_EXTRACTION_STORAGE_KEY)
      } catch (error) {
        console.error('Error clearing storage:', error)
      }
      
      onClose()
    } catch (error) {
      console.error('Error adding job:', error)
      alert('Failed to add job. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValidLinkedInJobUrl = (url: string): boolean => {
    return url.includes('linkedin.com/jobs/view/') || url.includes('linkedin.com/jobs/')
  }

  const handleLinkedInUrlChange = async (url: string) => {
    setFormData(prev => ({ ...prev, link: url }))
    
    // Check if it's a LinkedIn job URL
    if (isValidLinkedInJobUrl(url)) {
      setIsParsingLinkedIn(true)
      setLinkedInStatus('parsing')
      setLinkedInMessage('AI-powered extraction in progress... This may take 10-15 seconds as we bypass LinkedIn\'s security measures.')
      
      try {
        const response = await fetch('/api/linkedin-job', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url })
        })

        if (!response.ok) {
          throw new Error('Failed to process LinkedIn URL')
        }

        const jobData = await response.json()
        
        // Store extracted data
        setExtractedData({
          company: jobData.company || '',
          role: jobData.role || '',
          location: jobData.location || '',
          description: jobData.description || ''
        })
        
        // Update form with extracted data
        setFormData(prev => ({
          ...prev,
          role: jobData.role || prev.role,
          company: jobData.company || prev.company,
          notes: jobData.description ? `${jobData.description}\n\n${prev.notes || ''}`.trim() : prev.notes
        }))
        
        // Show appropriate message based on what was extracted
        if (jobData.company && jobData.role && jobData.role !== 'Job from LinkedIn') {
          setLinkedInStatus('success')
          setLinkedInMessage(`Successfully extracted job details! Company: ${jobData.company}, Role: ${jobData.role}${jobData.location ? `, Location: ${jobData.location}` : ''}`)
          
          // Check if company exists in database and prompt creation if needed
          if (jobData.company) {
            try {
              // Search for the company in the database
              const existingCompanies = await CompanyService.searchCompanies(jobData.company, 1)
              const companyExists = existingCompanies.some(company => 
                company.name.toLowerCase() === jobData.company.toLowerCase()
              )
              
              if (!companyExists) {
                // Company doesn't exist, show creation prompt
                setPendingCompanyName(jobData.company)
                setShowCompanyCreationPrompt(true)
              } else {
                // Company exists, don't show prompt
                setShowCompanyCreationPrompt(false)
                setPendingCompanyName('')
              }
            } catch (error) {
              console.error('Error checking if company exists:', error)
              // If there's an error checking, don't show the prompt to be safe
              setShowCompanyCreationPrompt(false)
              setPendingCompanyName('')
            }
          }
        } else if (jobData.role && jobData.role !== 'Job from LinkedIn') {
          setLinkedInStatus('success')
          setLinkedInMessage(`Successfully extracted job title: ${jobData.role}. Please select or create the company below.`)
        } else {
          setLinkedInStatus('info')
          setLinkedInMessage('LinkedIn job detected. AI extraction attempted but LinkedIn\'s advanced security measures prevented full automation. Please fill in the remaining details manually.')
        }
        
        console.log('LinkedIn job processing completed:', jobData)
        
      } catch (error) {
        console.error('Error processing LinkedIn URL:', error)
        
        setLinkedInStatus('error')
        setLinkedInMessage('LinkedIn processing failed. Please fill in job details manually.')
      } finally {
        setIsParsingLinkedIn(false)
      }
    } else {
      setLinkedInStatus('idle')
      setLinkedInMessage('')
      setExtractedData(null)
      setShowCompanyCreationPrompt(false)
    }
  }

  const handleCompanySelect = (companyName: string) => {
    setFormData(prev => ({ ...prev, company: companyName }))
    setShowCompanyCreationPrompt(false)
  }

  const handleCompanySelectFromDropdown = (company: any) => {
    setFormData(prev => ({ ...prev, company: company.name }))
    setShowCompanyCreationPrompt(false)
  }

  const handleCompanyCreated = (companyName: string) => {
    setFormData(prev => ({ ...prev, company: companyName }))
    setShowCompanyCreationPrompt(false)
    setLinkedInMessage(`Company "${companyName}" created successfully! Job details are ready to submit.`)
  }

  const getLinkedInStatusColor = () => {
    switch (linkedInStatus) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'parsing': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getLinkedInIcon = () => {
    switch (linkedInStatus) {
      case 'success': return (
        <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      )
      case 'error': return (
        <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      )
      case 'info': return (
        <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      )
      default: return (
        <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add New Job</h2>
            <button 
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* LinkedIn URL - Main Feature */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn Job URL (Recommended) 🔗
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => handleLinkedInUrlChange(e.target.value)}
                  placeholder="https://www.linkedin.com/jobs/view/4257191625"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors"
                />
                {isParsingLinkedIn && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Paste a LinkedIn job URL to automatically extract job details
              </p>
              
              {/* LinkedIn Status Display */}
              {formData.link && isValidLinkedInJobUrl(formData.link) && (
                <div className={`mt-3 p-4 border rounded-xl ${getLinkedInStatusColor()}`}>
                  <div className="flex items-start space-x-3">
                    {getLinkedInIcon()}
                    <div className="flex-1">
                      <div className="text-sm font-medium mb-1">
                        {linkedInStatus === 'success' ? '✅ LinkedIn Job Details Extracted!' : 
                         linkedInStatus === 'error' ? '❌ LinkedIn Detection Failed' :
                         linkedInStatus === 'info' ? 'ℹ️ LinkedIn Job Detected' :
                         '🔄 Processing LinkedIn URL...'}
                      </div>
                      <div className="text-sm text-current">
                        {linkedInMessage || 'Attempting to extract job details automatically...'}
                      </div>
                      {linkedInStatus === 'idle' && (
                        <div className="text-current mt-1 text-xs">
                          Job ID: {formData.link.split('/').pop()?.split('?')[0]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Extracted Data Preview */}
            {extractedData && linkedInStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h3 className="text-sm font-medium text-green-800 mb-3">📋 Extracted Information</h3>
                <div className="space-y-2 text-sm">
                  {extractedData.company && (
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-medium">Company:</span>
                      <span className="text-green-700">{extractedData.company}</span>
                    </div>
                  )}
                  {extractedData.role && (
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-medium">Role:</span>
                      <span className="text-green-700">{extractedData.role}</span>
                    </div>
                  )}
                  {extractedData.location && (
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-medium">Location:</span>
                      <span className="text-green-700">{extractedData.location}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Company Creation Prompt */}
            {showCompanyCreationPrompt && pendingCompanyName && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">
                      🏢 Company Not Found: &quot;{pendingCompanyName}&quot;
                    </h3>
                    <p className="text-sm text-blue-700 mb-3">
                      This company was extracted from LinkedIn but doesn&apos;t exist in our database. 
                      Please create it below to continue with your job application.
                    </p>
                    <div className="bg-white border border-blue-200 rounded-lg p-3">
                      <CompanySearch
                        value={formData.company}
                        onChange={handleCompanySelect}
                        onCompanySelect={handleCompanySelectFromDropdown}
                        placeholder={`Create: ${pendingCompanyName}`}
                        autoPopulate={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Company Selection/Creation */}
            {!showCompanyCreationPrompt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company *
                </label>
                <CompanySearch
                  value={formData.company}
                  onChange={handleCompanySelect}
                  onCompanySelect={handleCompanySelectFromDropdown}
                  placeholder={extractedData?.company ? `Found: ${extractedData.company}` : "Search for a company..."}
                />
                {extractedData?.company && !formData.company && (
                  <p className="text-xs text-blue-600 mt-1">
                    💡 Company &quot;{extractedData.company}&quot; was extracted from LinkedIn. Please select it above or create a new company entry.
                  </p>
                )}
              </div>
            )}

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                placeholder="e.g., Software Engineer, Product Manager"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors"
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
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as JobFormData['status'] }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-colors"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-colors"
                required
              />
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:from-orange-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 