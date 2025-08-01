'use client'

import { useState } from 'react'
import { Document, DocumentFormData, Job, Folder } from '@/lib/supabase'
import { DocumentService } from '@/lib/documents'
import { FolderService } from '@/lib/folders'

interface DocumentEditModalProps {
  document: Document
  jobs: Job[]
  folders: Folder[]
  onClose: () => void
  onUpdate: (id: string, updates: Partial<DocumentFormData>) => Promise<void>
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function DocumentEditModal({
  document,
  jobs,
  folders,
  onClose,
  onUpdate,
  onError,
  onSuccess
}: DocumentEditModalProps) {
  const [formData, setFormData] = useState<DocumentFormData>({
    name: document.name,
    description: document.description || '',
    category: document.category,
    job_id: document.job_id || undefined,
    folder_id: document.folder_id || undefined
  })
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      onError('Document name is required')
      return
    }

    setIsUpdating(true)
    try {
      await onUpdate(document.id, formData)
      onSuccess('Document updated successfully!')
      onClose()
    } catch (error) {
      onError('Failed to update document')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Edit Document</h2>
            <button 
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Document Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 h-10 w-10">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-lg">
                    {DocumentService.getCategoryIcon(document.category)}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Current file</p>
                <p className="font-medium text-gray-900 truncate">{document.name}</p>
                <p className="text-xs text-gray-500">
                  {DocumentService.formatFileSize(document.file_size)} • {document.file_type.split('/')[1]}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter document name"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as DocumentFormData['category'] }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-colors"
              >
                <option value="resume">📋 Resume</option>
                <option value="cover_letter">✉️ Cover Letter</option>
                <option value="portfolio">🎨 Portfolio</option>
                <option value="certificate">🏆 Certificate</option>
                <option value="other">📎 Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description of the document"
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link to Job Application (Optional)
              </label>
              <select
                value={formData.job_id || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  job_id: e.target.value || undefined 
                }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-colors"
              >
                <option value="">💼 No job linked</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>
                    🏢 {job.company} - {job.role} ({job.status})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Link this document to a specific job application for easy reference
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Folder
              </label>
              <select
                value={formData.folder_id || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  folder_id: e.target.value || undefined 
                }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-colors"
              >
                <option value="">📁 Root folder (No folder)</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {FolderService.getFolderIcon(folder.color)} {folder.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Move this document to a different folder for better organization
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating || !formData.name.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-pink-500 border border-transparent rounded-xl hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  'Update Document'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 