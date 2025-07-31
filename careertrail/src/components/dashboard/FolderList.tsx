'use client'

import { useState, useCallback } from 'react'
import { Folder } from '@/lib/supabase'
import { FolderService } from '@/lib/folders'
import { cn } from '@/lib/utils'

interface FolderListProps {
  folders: Folder[]
  selectedFolderId: string | null
  onSelectFolder: (folderId: string | null) => void
  onEditFolder: (folder: Folder) => void
  onDeleteFolder: (id: string) => Promise<void>
  onError: (message: string) => void
  onSuccess: (message: string) => void
  onConfirmDelete: (id: string, folderName: string) => void
  className?: string
}

export default function FolderList({
  folders,
  selectedFolderId,
  onSelectFolder,
  onEditFolder,
  onDeleteFolder,
  onError,
  onSuccess,
  onConfirmDelete,
  className
}: FolderListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [lastClickTime, setLastClickTime] = useState<number>(0)
  const [selectingFolderId, setSelectingFolderId] = useState<string | null>(null)

  // Debounced folder selection to prevent rapid state changes
  const handleFolderSelect = useCallback((folderId: string | null) => {
    const now = Date.now()
    if (now - lastClickTime < 300) {
      // Prevent rapid clicks within 300ms
      return
    }
    setLastClickTime(now)
    setSelectingFolderId(folderId)
    
    console.log('FolderList: Selecting folder:', folderId, 'Current selectedFolderId:', selectedFolderId)
    
    // Immediate selection without delay
    onSelectFolder(folderId)
    setSelectingFolderId(null)
  }, [onSelectFolder, lastClickTime, selectedFolderId])

  const handleDelete = async (id: string) => {
    const folder = folders.find(f => f.id === id)
    const folderName = folder ? folder.name : 'this folder'
    onConfirmDelete(id, folderName)
  }

  const toggleExpanded = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const renderFolder = (folder: Folder, level: number = 0) => {
    const hasChildren = folders.some(f => f.parent_folder_id === folder.id)
    const isExpanded = expandedFolders.has(folder.id)
    const isSelected = selectedFolderId === folder.id
    const isSelecting = selectingFolderId === folder.id

    // Debug logging
    if (isSelected) {
      console.log('FolderList: Folder is selected:', folder.name, 'selectedFolderId:', selectedFolderId)
    }

    return (
      <div key={folder.id} className="space-y-1">
        <div
          className={cn(
            "flex items-center space-x-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 group",
            isSelected
              ? "bg-blue-50 border border-blue-200"
              : "hover:bg-gray-50 border border-transparent"
          )}
          style={{ marginLeft: `${level * 16}px` }}
          onClick={() => handleFolderSelect(folder.id)}
        >
          {/* Expand/Collapse button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded(folder.id)
              }}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isExpanded ? "rotate-90" : ""
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Folder icon */}
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: folder.color }}
          >
            {FolderService.getFolderIcon(folder.color)}
          </div>

          {/* Folder name */}
          <span
            className={cn(
              "flex-1 text-sm font-medium truncate",
              isSelected ? "text-blue-700" : "text-gray-900"
            )}
          >
            {FolderService.formatFolderName(folder.name)}
          </span>

          {/* Actions */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEditFolder(folder)
              }}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit folder"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(folder.id)
              }}
              disabled={deletingId === folder.id}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
              title="Delete folder"
            >
              {deletingId === folder.id ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {folders
              .filter(f => f.parent_folder_id === folder.id)
              .map(childFolder => renderFolder(childFolder, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const rootFolders = folders.filter(f => !f.parent_folder_id)

  // Debug logging for "All Documents"
  console.log('FolderList: selectedFolderId:', selectedFolderId, 'selectingFolderId:', selectingFolderId)

  return (
    <div className={cn("space-y-2", className)}>
      {/* Root folder (All Documents) */}
      <div
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 group",
          selectedFolderId === null
            ? "bg-blue-50 border border-blue-200"
            : "hover:bg-gray-50 border border-transparent"
        )}
        onClick={() => handleFolderSelect(null)}
      >
        <div className="w-6 h-6 rounded-lg bg-gray-500 flex items-center justify-center text-white text-sm font-medium">
          📁
        </div>
        <span
          className={cn(
            "flex-1 text-sm font-medium",
            selectedFolderId === null ? "text-blue-700" : "text-gray-900"
          )}
        >
          All Documents
        </span>
      </div>

      {/* User folders */}
      {rootFolders.map(folder => renderFolder(folder))}

      {folders.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">No folders yet</p>
        </div>
      )}
    </div>
  )
} 