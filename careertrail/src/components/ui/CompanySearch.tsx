'use client'

import { useState, useEffect, useRef } from 'react'
import { Company } from '@/lib/supabase'
import { CompanyService } from '@/lib/companies'
import { cn } from '@/lib/utils'

interface CompanySearchProps {
  value: string
  onChange: (companyName: string) => void
  onCompanySelect?: (company: Company) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  error?: boolean
  autoPopulate?: boolean
}

export default function CompanySearch({
  value,
  onChange,
  onCompanySelect,
  placeholder = "Search for a company...",
  className,
  disabled = false,
  error = false,
  autoPopulate = true
}: CompanySearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddNew, setShowAddNew] = useState(false)
  const [newCompanyData, setNewCompanyData] = useState({
    name: '',
    country: 'USA',
    industry: '',
    website: ''
  })
  const [creatingCompany, setCreatingCompany] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (value.length >= 2) {
        setLoading(true)
        try {
          const results = await CompanyService.searchCompanies(value, 10)
          setSuggestions(results)
          setShowAddNew(results.length === 0 || !results.some(c => c.name.toLowerCase() === value.toLowerCase()))
        } catch (error) {
          console.error('Error searching companies:', error)
          setSuggestions([])
          setShowAddNew(true)
        } finally {
          setLoading(false)
        }
      } else {
        setSuggestions([])
        setShowAddNew(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [value])

  // Auto-populate company name when "Add new company" is shown
  useEffect(() => {
    if (showAddNew && value && autoPopulate && !newCompanyData.name) {
      setNewCompanyData(prev => ({ ...prev, name: value }))
    }
  }, [showAddNew, value, newCompanyData.name, autoPopulate])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setIsOpen(true)
  }

  const handleCompanySelect = (company: Company) => {
    onChange(company.name)
    onCompanySelect?.(company)
    setIsOpen(false)
    setShowAddNew(false)
  }

  const handleAddNewCompany = async () => {
    if (!newCompanyData.name.trim()) return

    setCreatingCompany(true)
    try {
      const company = await CompanyService.createCompany({
        name: newCompanyData.name.trim(),
        country: newCompanyData.country,
        industry: newCompanyData.industry || undefined,
        website: newCompanyData.website || undefined
      })
      
      onChange(company.name)
      onCompanySelect?.(company)
      setIsOpen(false)
      setShowAddNew(false)
      setNewCompanyData({ name: '', country: 'USA', industry: '', website: '' })
    } catch (error) {
      console.error('Error creating company:', error)
    } finally {
      setCreatingCompany(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && showAddNew && newCompanyData.name.trim()) {
      e.preventDefault()
      handleAddNewCompany()
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors",
          error && "border-red-300 focus:ring-red-500 focus:border-red-300",
          disabled && "bg-gray-100 cursor-not-allowed",
          className
        )}
      />

      {/* Loading indicator */}
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (suggestions.length > 0 || showAddNew) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
          {/* Suggestions */}
          {suggestions.map((company) => (
            <button
              key={company.id}
              onClick={() => handleCompanySelect(company)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {company.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {company.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {company.industry && `${company.industry} • `}{company.country}
                  </div>
                </div>
                {company.website && (
                  <div className="flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}

          {/* Add new company option */}
          {showAddNew && (
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <div className="text-sm font-medium text-gray-900 mb-3">
                Add new company: &quot;{value}&quot;
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={newCompanyData.name}
                    onChange={(e) => setNewCompanyData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter company name"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      value={newCompanyData.country}
                      onChange={(e) => setNewCompanyData(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="USA">USA</option>
                      <option value="Finland">Finland</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <select
                      value={newCompanyData.industry}
                      onChange={(e) => setNewCompanyData(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">Select Industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Consumer Goods">Consumer Goods</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Website (optional)
                  </label>
                  <input
                    type="url"
                    value={newCompanyData.website}
                    onChange={(e) => setNewCompanyData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://www.company.com"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  />
                </div>

                <button
                  onClick={handleAddNewCompany}
                  disabled={creatingCompany || !newCompanyData.name.trim()}
                  className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {creatingCompany ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Adding...</span>
                    </div>
                  ) : (
                    'Add Company'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 