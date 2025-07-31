'use client'

import { useState, useEffect } from 'react'
import { Folder, FolderFormData } from '@/lib/supabase'
import { FolderService } from '@/lib/folders'

interface FolderModalProps {
  folder?: Folder | null
  folders: Folder[]
  onClose: () => void
  onSubmit: (folderData: FolderFormData) => Promise<void>
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export default function FolderModal({
  folder,
  folders,
  onClose,
  onSubmit,
  onError,
  onSuccess
}: FolderModalProps) {
  const [formData, setFormData] = useState<FolderFormData>({
    name: '',
    description: '',
    color: '#3B82F6',
    parent_folder_id: undefined
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!folder

  useEffect(() => {
    if (folder) {
      setFormData({
        name: folder.name,
        description: folder.description || '',
        color: folder.color,
        parent_folder_id: folder.parent_folder_id || undefined
      })
    }
  }, [folder])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      onError('Folder name is required')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onSuccess(isEditing ? 'Folder updated successfully!' : 'Folder created successfully!')
      onClose()
    } catch (error) {
      onError(isEditing ? 'Failed to update folder' : 'Failed to create folder')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onClose()
  }

  const availableParentFolders = folders.filter(f => f.id !== folder?.id)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Folder' : 'Create New Folder'}
            </h2>
            <button 
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Folder Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
                rows={2}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Folder
              </label>
              <select
                value={formData.parent_folder_id || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  parent_folder_id: e.target.value || undefined 
                }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-colors"
              >
                <option value="">Root folder</option>
                {availableParentFolders.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
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
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={cn(
                      "w-8 h-8 rounded-lg border-2 transition-all",
                      formData.color === color
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
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.name.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-pink-500 border border-transparent rounded-xl hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                  </div>
                ) : (
                  isEditing ? 'Update Folder' : 'Create Folder'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
} 