'use client'

import { useState, useRef, useCallback } from 'react'
import { DocumentFormData, Folder, FolderFormData, Job } from '@/lib/supabase'
import { FolderService } from '@/lib/folders'
import { cn } from '@/lib/utils'

interface DocumentUploadProps {
  folders: Folder[]
  jobs: Job[]
  onUpload: (file: File, documentData: DocumentFormData) => Promise<void>
  onCreateFolder?: (folderData: FolderFormData) => Promise<Folder>
  onError: (message: string) => void
  onSuccess: (message: string) => void
  className?: string
}

export default function DocumentUpload({ 
  folders,
  jobs,
  onUpload, 
  onCreateFolder,
  onError, 
  onSuccess, 
  className 
}: DocumentUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentData, setDocumentData] = useState<DocumentFormData>({
    name: '',
    description: '',
    category: 'other',
    job_id: undefined,
    folder_id: undefined
  })
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [newFolderData, setNewFolderData] = useState<FolderFormData>({
    name: '',
    description: '',
    color: '#3B82F6'
  })
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [])

  const handleFileSelect = (file: File) => {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      onError('File size must be less than 10MB')
      return
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      onError('File type not supported. Please upload PDF, Word, or image files.')
      return
    }

    setSelectedFile(file)
    // Auto-fill name if not already set
    if (!documentData.name) {
      setDocumentData(prev => ({
        ...prev,
        name: file.name.replace(/\.[^/.]+$/, '') // Remove file extension
      }))
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderData.name.trim()) {
      onError('Folder name is required')
      return
    }

    if (!onCreateFolder) {
      onError('Folder creation not available')
      return
    }

    setIsCreatingFolder(true)
    try {
      const newFolder = await onCreateFolder(newFolderData)
      // Set the newly created folder as selected
      setDocumentData(prev => ({ ...prev, folder_id: newFolder.id }))
      setShowCreateFolder(false)
      setNewFolderData({ name: '', description: '', color: '#3B82F6' })
      onSuccess('Folder created successfully!')
    } catch (error) {
      onError('Failed to create folder')
    } finally {
      setIsCreatingFolder(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile || !documentData.name.trim()) {
      onError('Please select a file and provide a name')
      return
    }

    setIsUploading(true)
    try {
      await onUpload(selectedFile, documentData)
      onSuccess('Document uploaded successfully!')
      
      // Reset form
      setSelectedFile(null)
      setDocumentData({
        name: '',
        description: '',
        category: 'other',
        job_id: undefined,
        folder_id: undefined
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('image')) return '🖼️'
    if (fileType.includes('text')) return '📄'
    return '📎'
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Drag & Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200",
          isDragOver
            ? "border-blue-500 bg-blue-50/50"
            : "border-gray-300 hover:border-gray-400",
          selectedFile && "border-green-500 bg-green-50/50"
        )}
      >
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-3xl">{getFileIcon(selectedFile.type)}</span>
              <div className="text-left">
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your document here
              </p>
              <p className="text-gray-600 mb-4">
                or click to browse files
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Choose File
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Supports PDF, Word, and image files up to 10MB
            </p>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          className="hidden"
        />
      </div>

      {/* Document Details Form */}
      {selectedFile && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Name *
            </label>
            <input
              type="text"
              value={documentData.name}
              onChange={(e) => setDocumentData(prev => ({ ...prev, name: e.target.value }))}
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
              value={documentData.category}
              onChange={(e) => setDocumentData(prev => ({ ...prev, category: e.target.value as DocumentFormData['category'] }))}
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
              Folder
            </label>
            <div className="space-y-2">
              <select
                value={documentData.folder_id || ''}
                onChange={(e) => setDocumentData(prev => ({ 
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
              
              <button
                type="button"
                onClick={() => setShowCreateFolder(true)}
                className="w-full px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
              >
                + Create New Folder
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link to Job Application (Optional)
            </label>
            <select
              value={documentData.job_id || ''}
              onChange={(e) => setDocumentData(prev => ({ 
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
              Description
            </label>
            <textarea
              value={documentData.description || ''}
              onChange={(e) => setDocumentData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description of the document"
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isUploading || !documentData.name.trim()}
                          className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              'Upload Document'
            )}
          </button>
        </form>
      )}

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create New Folder</h2>
                <button 
                  onClick={() => setShowCreateFolder(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleCreateFolder(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Folder Name *
                  </label>
                  <input
                    type="text"
                    value={newFolderData.name}
                    onChange={(e) => setNewFolderData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter folder name"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newFolderData.description || ''}
                    onChange={(e) => setNewFolderData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Folder Color
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {FolderService.getDefaultColors().map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewFolderData(prev => ({ ...prev, color }))}
                        className={cn(
                          "w-8 h-8 rounded-lg border-2 transition-all",
                          newFolderData.color === color
                            ? "border-gray-900 scale-110"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateFolder(false)}
                    disabled={isCreatingFolder}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingFolder || !newFolderData.name.trim()}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-pink-500 border border-transparent rounded-xl hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isCreatingFolder ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      'Create Folder'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 