'use client'

import { useState, useMemo } from 'react'
import { Contact, ContactFormData } from '@/lib/supabase'
import { ContactService } from '@/lib/contacts'
import ContactCard from './ContactCard'
import ContactModal from './ContactModal'

interface ContactListProps {
  contacts: Contact[]
  onCreate: (contactData: ContactFormData) => Promise<void>
  onUpdate: (id: string, updates: Partial<ContactFormData>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onError: (message: string) => void
  onSuccess: (message: string) => void
  onLogInteraction?: (contactId: string) => void
  onConfirmDelete: (id: string, contactName: string) => void
  showModal?: boolean
  onCloseModal?: () => void
}

export default function ContactList({ 
  contacts, 
  onCreate, 
  onUpdate, 
  onDelete, 
  onError, 
  onSuccess, 
  onLogInteraction,
  onConfirmDelete,
  showModal,
  onCloseModal
}: ContactListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  
  // Use external modal control if provided
  const isModalOpen = showModal !== undefined ? showModal : showContactModal
  const closeModal = onCloseModal || (() => setShowContactModal(false))

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = 
        contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = categoryFilter === 'all' || contact.category === categoryFilter
      const matchesStatus = statusFilter === 'all' || contact.status === statusFilter
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [contacts, searchTerm, categoryFilter, statusFilter])

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact)
    setShowContactModal(true)
  }

  const handleCreateContact = () => {
    setSelectedContact(null)
    setShowContactModal(true)
  }

  const handleContactSubmit = async (contactData: ContactFormData) => {
    try {
      if (selectedContact) {
        await onUpdate(selectedContact.id, contactData)
      } else {
        await onCreate(contactData)
      }
      setShowContactModal(false)
      setSelectedContact(null)
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to save contact')
    }
  }

  const getCategoryStats = () => {
    const stats = contacts.reduce((acc, contact) => {
      acc[contact.category] = (acc[contact.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return stats
  }

  const categoryStats = getCategoryStats()

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-xl border border-gray-200/50 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Contacts</h2>
            <p className="text-gray-600 mt-1">
              {contacts.length} total contact{contacts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(categoryStats).map(([category, count]) => (
            <div key={category} className="text-center">
              <div 
                className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center text-xl"
                style={{ backgroundColor: ContactService.getCategoryColor(category as Contact['category']) + '20' }}
              >
                {ContactService.getCategoryIcon(category as Contact['category'])}
              </div>
              <div className="text-sm font-medium text-gray-900">{count}</div>
              <div className="text-xs text-gray-500 capitalize">{category.replace('_', ' ')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200/50 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-colors"
          >
            <option value="all">All Categories</option>
            <option value="recruiter">Recruiter</option>
            <option value="hiring_manager">Hiring Manager</option>
            <option value="colleague">Colleague</option>
            <option value="networking">Networking</option>
            <option value="referral">Referral</option>
            <option value="other">Other</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-colors"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Contact Grid */}
      {filteredContacts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200/50 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first contact'
            }
          </p>
          {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
            <button
              onClick={handleCreateContact}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-medium rounded-xl hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Contact
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact, index) => (
            <ContactCard
              key={`${contact.id}-${index}`}
              contact={contact}
              onEdit={() => handleEditContact(contact)}
              onDelete={() => onDelete(contact.id)}
              onError={onError}
              onSuccess={onSuccess}
              onLogInteraction={onLogInteraction ? () => onLogInteraction(contact.id) : undefined}
              onConfirmDelete={(contactName) => onConfirmDelete(contact.id, contactName)}
            />
          ))}
        </div>
      )}

      {/* Contact Modal */}
      {isModalOpen && (
        <ContactModal
          contact={selectedContact}
          onClose={() => {
            closeModal()
            setSelectedContact(null)
          }}
          onSubmit={handleContactSubmit}
          onError={onError}
          onSuccess={onSuccess}
        />
      )}
    </div>
  )
} 