'use client'

import { useState } from 'react'
import { Document, DocumentFormData, Job, Folder } from '@/lib/supabase'
import { DocumentService } from '@/lib/documents'
import { FolderService } from '@/lib/folders'
import { cn } from '@/lib/utils'
import DocumentEditModal from './DocumentEditModal'

interface DocumentListProps {
  documents: Document[]
  jobs: Job[]
  folders: Folder[]
  selectedFolderId: string | null
  onDelete: (id: string) => Promise<void>
  onUpdate: (id: string, updates: Partial<DocumentFormData>) => Promise<void>
  onError: (message: string) => void
  onSuccess: (message: string) => void
  onConfirmDelete: (id: string, documentName: string) => void
  className?: string
}

export default function DocumentList({ 
  documents, 
  jobs,
  folders,
  selectedFolderId,
  onDelete, 
  onUpdate,
  onError, 
  onSuccess,
  onConfirmDelete,
  className 
}: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const handleDelete = async (id: string) => {
    const document = documents.find(d => d.id === id)
    const documentName = document ? document.name : 'this document'
    onConfirmDelete(id, documentName)
  }

  const handleDownload = async (doc: Document) => {
    try {
      const url = await DocumentService.getDownloadUrl(doc.file_path)
      const link = window.document.createElement('a')
      link.href = url
      link.download = doc.name
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
    } catch (error) {
      onError('Failed to download document')
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    const matchesFolder = selectedFolderId === null || doc.folder_id === selectedFolderId
    return matchesSearch && matchesCategory && matchesFolder
  })

  const categories = [
    { value: 'all', label: 'All Documents', icon: '📁' },
    { value: 'resume', label: 'Resumes', icon: '📋' },
    { value: 'cover_letter', label: 'Cover Letters', icon: '✉️' },
    { value: 'portfolio', label: 'Portfolios', icon: '🎨' },
    { value: 'certificate', label: 'Certificates', icon: '🏆' },
    { value: 'other', label: 'Other', icon: '📎' }
  ]

  if (documents.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-64", className)}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents</h3>
          <p className="text-gray-600">Upload your first document to get started.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-colors"
        >
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.icon} {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((document, index) => (
          <div
            key={`${document.id}-${index}`}
            className="bg-white rounded-xl border border-gray-200/50 p-4 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-lg">
                      {DocumentService.getCategoryIcon(document.category)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <h4 className="font-semibold text-gray-900 truncate break-words">{document.name}</h4>
                  <p className="text-sm text-gray-600 truncate">
                    {DocumentService.getCategoryLabel(document.category)}
                  </p>
                </div>
              </div>
                             <div className="flex items-center space-x-1">
                 <button
                   onClick={() => setEditingDocument(document)}
                   className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                   title="Edit"
                 >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                   </svg>
                 </button>
                 <button
                   onClick={() => handleDownload(document)}
                   className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                   title="Download"
                 >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                 </button>
                 <button
                   onClick={() => handleDelete(document.id)}
                   disabled={deletingId === document.id}
                   className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                   title="Delete"
                 >
                   {deletingId === document.id ? (
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                   ) : (
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                     </svg>
                   )}
                 </button>
               </div>
            </div>

            <div className="space-y-2">
              {document.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{document.description}</p>
              )}
              
              {/* Linked Job Information */}
              {document.job_id && (() => {
                const linkedJob = jobs.find(job => job.id === document.job_id)
                return linkedJob ? (
                  <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg border border-blue-200/50">
                    <span className="text-blue-600 text-sm">💼</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-900 truncate">
                        {linkedJob.company}
                      </p>
                      <p className="text-xs text-blue-700 truncate">
                        {linkedJob.role} ({linkedJob.status})
                      </p>
                    </div>
                  </div>
                ) : null
              })()}
              
              {/* Folder Information */}
              {document.folder_id && (() => {
                const linkedFolder = folders.find(folder => folder.id === document.folder_id)
                return linkedFolder ? (
                  <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg border border-green-200/50">
                    <span className="text-green-600 text-sm">{FolderService.getFolderIcon(linkedFolder.color)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-900 truncate">
                        {linkedFolder.name}
                      </p>
                      <p className="text-xs text-green-700 truncate">
                        Folder
                      </p>
                    </div>
                  </div>
                ) : null
              })()}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{DocumentService.formatFileSize(document.file_size)}</span>
                <span>{new Date(document.created_at).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">
                  {DocumentService.getFileIcon(document.file_type)}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {document.file_type.split('/')[1]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && documents.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No documents match your search criteria.</p>
        </div>
      )}

      {/* Edit Modal */}
      {editingDocument && (
        <DocumentEditModal
          document={editingDocument}
          jobs={jobs}
          folders={folders}
          onClose={() => setEditingDocument(null)}
          onUpdate={onUpdate}
          onError={onError}
          onSuccess={onSuccess}
        />
      )}
    </div>
  )
} 