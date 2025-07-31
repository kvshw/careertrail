'use client'

import { useState } from 'react'
import { Contact } from '@/lib/supabase'
import { ContactService } from '@/lib/contacts'

interface ContactCardProps {
  contact: Contact
  onEdit: () => void
  onDelete: () => void
  onError: (message: string) => void
  onSuccess: (message: string) => void
  onLogInteraction?: () => void
  onConfirmDelete: (contactName: string) => void
}

export default function ContactCard({ 
  contact, 
  onEdit, 
  onDelete, 
  onError, 
  onSuccess, 
  onLogInteraction,
  onConfirmDelete 
}: ContactCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    const contactName = ContactService.getContactFullName(contact.first_name, contact.last_name)
    onConfirmDelete(contactName)
  }

  const initials = ContactService.getContactInitials(contact.first_name, contact.last_name)
  const fullName = ContactService.getContactFullName(contact.first_name, contact.last_name)
  const categoryColor = ContactService.getCategoryColor(contact.category)
  const categoryIcon = ContactService.getCategoryIcon(contact.category)

  return (
    <div className="bg-white rounded-xl border border-gray-200/50 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-lg"
            style={{ backgroundColor: categoryColor }}
          >
            {initials}
          </div>
          
          {/* Name and Category */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{fullName}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{categoryIcon}</span>
              <span className="text-sm text-gray-600 capitalize">{contact.category.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          contact.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : contact.status === 'inactive'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {contact.status}
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        {contact.company && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>{contact.company}</span>
          </div>
        )}
        
        {contact.role && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
            <span>{contact.role}</span>
          </div>
        )}

        {contact.email && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{contact.email}</span>
          </div>
        )}

        {contact.phone && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{contact.phone}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {contact.tags && contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {contact.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg"
            >
              {tag}
            </span>
          ))}
          {contact.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
              +{contact.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Relationship Strength */}
      {contact.relationship_strength && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Relationship Strength</span>
            <span>{contact.relationship_strength}/5</span>
          </div>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <div
                key={star}
                className={`w-4 h-4 rounded-full ${
                  star <= contact.relationship_strength! 
                    ? 'bg-blue-500' 
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex space-x-2">
          {contact.email && (
            <button
              onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="Send email"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          )}
          
          {contact.phone && (
            <button
              onClick={() => window.open(`tel:${contact.phone}`, '_blank')}
              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
              title="Call"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
          )}
          
          {contact.linkedin_url && (
            <button
              onClick={() => window.open(contact.linkedin_url, '_blank')}
              className="p-2 text-gray-400 hover:text-blue-700 transition-colors"
              title="View LinkedIn"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </button>
          )}
        </div>

        {/* Edit/Delete Actions */}
        <div className="flex space-x-1">
          {onLogInteraction && (
            <button
              onClick={onLogInteraction}
              className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
              title="Log interaction"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
          
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit contact"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
            title="Delete contact"
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 