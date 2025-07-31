'use client'

import { useState, useEffect } from 'react'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface RealtimeToastProps {
  payload: RealtimePostgresChangesPayload<any> | null
  onClose: () => void
}

export default function RealtimeToast({ payload, onClose }: RealtimeToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (payload) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Wait for animation to complete
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [payload, onClose])

  if (!payload || !isVisible) return null

  const { eventType, table, new: newRecord, old: oldRecord } = payload

  const getMessage = () => {
    const tableName = table.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    
    switch (eventType) {
      case 'INSERT':
        return `${tableName} added successfully`
      case 'UPDATE':
        return `${tableName} updated successfully`
      case 'DELETE':
        return `${tableName} deleted successfully`
      default:
        return `${tableName} changed`
    }
  }

  const getIcon = () => {
    switch (eventType) {
      case 'INSERT':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )
      case 'UPDATE':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )
      case 'DELETE':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const getColor = () => {
    switch (eventType) {
      case 'INSERT':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'UPDATE':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'DELETE':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${getColor()}`}>
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{getMessage()}</p>
          <p className="text-xs opacity-75">Real-time update</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
} 