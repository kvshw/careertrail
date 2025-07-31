'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title: string
  subtitle?: string
  showSearch?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  actions?: React.ReactNode
}

export default function Header({ 
  title, 
  subtitle, 
  showSearch = false, 
  searchPlaceholder = "Search...",
  onSearch,
  actions 
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-orange-200/30">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Title Section */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">
                {subtitle}
              </p>
            )}
          </div>

          {/* Search Section */}
          {showSearch && (
            <div className="flex-1 max-w-md mx-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50/50 hover:bg-gray-50 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Actions Section */}
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 