'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Job, JobFormData, Document, DocumentFormData, Folder, FolderFormData, Contact, ContactFormData, ContactInteraction, ContactInteractionFormData, Interview, InterviewFormData } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { DocumentService } from '@/lib/documents'
import { FolderService } from '@/lib/folders'
import { ContactService } from '@/lib/contacts'
import { InterviewService } from '@/lib/interviews'
import { useAuth } from '@/contexts/AuthContext'
import { useRealtimeState } from '@/hooks/useRealtimeState'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import AddJobModal from './AddJobModal'
import JobList from './JobList'
import MetricsDashboard from './MetricsDashboard'
import DocumentUpload from './DocumentUpload'
import DocumentList from './DocumentList'
import FolderList from './FolderList'
import FolderModal from './FolderModal'
import ContactList from './ContactList'
import ContactInteractionModal from './ContactInteractionModal'
import ContactTimeline from './ContactTimeline'
import InterviewList from './InterviewList'
import InterviewModal from './InterviewModal'
import Toast from './Toast'
import RealtimeStatus from '@/components/ui/RealtimeStatus'
import ConfirmModal from '@/components/ui/ConfirmModal'

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [jobs, setJobs] = useState<Job[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [contactInteractions, setContactInteractions] = useState<ContactInteraction[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDocumentUpload, setShowDocumentUpload] = useState(false)
  const [showInteractionModal, setShowInteractionModal] = useState(false)
  const [selectedContactForInteraction, setSelectedContactForInteraction] = useState<string | null>(null)
  const [editingInteraction, setEditingInteraction] = useState<ContactInteraction | null>(null)
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => Promise<void>
    variant?: 'danger' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
    variant: 'danger'
  })
  
  // Track if data has been loaded to prevent unnecessary re-fetching
  const dataLoadedRef = useRef(false)
  
  // Real-time state management
  const { getSubscriptionStatus } = useRealtimeState({
    userId: user?.id || '',
    jobs,
    documents,
    folders,
    contacts,
    contactInteractions,
    interviews,
    onJobsChange: (updatedJobs) => {
      console.log('Real-time jobs update:', updatedJobs)
      setJobs(updatedJobs)
    },
    onDocumentsChange: (updatedDocuments) => {
      console.log('Real-time documents update:', updatedDocuments)
      setDocuments(updatedDocuments)
    },
    onFoldersChange: (updatedFolders) => {
      console.log('Real-time folders update:', updatedFolders)
      setFolders(updatedFolders)
    },
    onContactsChange: (updatedContacts) => {
      console.log('Real-time contacts update:', updatedContacts)
      setContacts(updatedContacts)
    },
    onContactInteractionsChange: (updatedInteractions) => {
      console.log('Real-time contact interactions update:', updatedInteractions)
      setContactInteractions(updatedInteractions)
    },
    onInterviewsChange: (updatedInterviews) => {
      console.log('Real-time interviews update:', updatedInterviews)
      setInterviews(updatedInterviews)
    }
  })
  
  // Get active tab from URL or default to 'board'
  const urlTab = searchParams.get('tab') as 'list' | 'metrics' | 'documents' | 'contacts' | 'interviews' | null
  
  // Get stored tab from localStorage as fallback
  const getStoredTab = (): 'list' | 'metrics' | 'documents' | 'contacts' | 'interviews' => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('careertrail-active-tab')
      if (stored && ['list', 'metrics', 'documents', 'contacts', 'interviews'].includes(stored)) {
        return stored as 'list' | 'metrics' | 'documents' | 'contacts' | 'interviews'
      }
    }
    return 'list'
  }
  
  const [activeTab, setActiveTab] = useState<'list' | 'metrics' | 'documents' | 'contacts' | 'interviews'>(
    urlTab && ['list', 'metrics', 'documents', 'contacts', 'interviews'].includes(urlTab) ? urlTab : getStoredTab()
  )
  
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'info'
  })

  // Update URL when activeTab changes
  const handleTabChange = (newTab: 'list' | 'metrics' | 'documents' | 'contacts' | 'interviews') => {
    setActiveTab(newTab)
    
    // Update URL
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', newTab)
    router.push(`/dashboard?${params.toString()}`, { scroll: false })
    
    // Store in localStorage as backup
    if (typeof window !== 'undefined') {
      localStorage.setItem('careertrail-active-tab', newTab)
    }
  }

  useEffect(() => {
    if (user && !dataLoadedRef.current) {
      dataLoadedRef.current = true
      fetchJobs()
      fetchDocuments()
      fetchFolders()
      fetchContacts()
      fetchContactInteractions()
      fetchInterviews()
    }
  }, [user])

  // Sync activeTab with URL changes
  useEffect(() => {
    if (urlTab && ['list', 'metrics', 'documents', 'contacts', 'interviews'].includes(urlTab)) {
      setActiveTab(urlTab)
      // Also update localStorage to keep it in sync
      if (typeof window !== 'undefined') {
        localStorage.setItem('careertrail-active-tab', urlTab)
      }
    } else if (!urlTab && typeof window !== 'undefined') {
      // If no URL tab, try to restore from localStorage
      const stored = localStorage.getItem('careertrail-active-tab')
      if (stored && ['list', 'metrics', 'documents', 'contacts', 'interviews'].includes(stored)) {
        setActiveTab(stored as 'list' | 'metrics' | 'documents' | 'contacts' | 'interviews')
        // Update URL to match localStorage
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', stored)
        router.push(`/dashboard?${params.toString()}`, { scroll: false })
      }
    }
  }, [urlTab, searchParams, router])

  const fetchJobs = async () => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return
      }
      
      // Only show loading if we don't have any jobs data yet
      if (jobs.length === 0) {
        setLoading(true)
      }
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching jobs:', error)
        throw error
      }

      setJobs(data || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
      handleError('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const fetchDocuments = async () => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return
      }
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching documents:', error)
        throw error
      }

      setDocuments(data || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
      handleError('Failed to load documents')
    }
  }

  const fetchFolders = async () => {
    try {
      if (!user?.id) return
      const folders = await FolderService.getFolders(user.id)
      setFolders(folders)
    } catch (error) {
      console.error('Error fetching folders:', error)
      handleError('Failed to load folders')
    }
  }

  const fetchContacts = async () => {
    try {
      if (!user?.id) return
      const contacts = await ContactService.getContacts(user.id)
      setContacts(contacts)
    } catch (error) {
      console.error('Error fetching contacts:', error)
      handleError('Failed to load contacts')
    }
  }

  const fetchContactInteractions = async () => {
    try {
      if (!user?.id) return
      const interactions = await ContactService.getAllContactInteractions(user.id)
      setContactInteractions(interactions)
    } catch (error) {
      console.error('Error fetching contact interactions:', error)
      handleError('Failed to load contact interactions')
    }
  }

  const fetchInterviews = async () => {
    try {
      if (!user?.id) return
      const interviews = await InterviewService.getInterviews(user.id)
      setInterviews(interviews)
    } catch (error) {
      console.error('Error fetching interviews:', error)
      handleError('Failed to load interviews')
    }
  }

  const handleAddJob = async (jobData: JobFormData) => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized')
        return
      }
      
      const { data, error } = await supabase
        .from('jobs')
        .insert([{ ...jobData, user_id: user?.id }])
        .select()

      if (error) {
        console.error('Error adding job:', error)
        throw error
      }

      if (data) {
        setJobs([data[0], ...jobs])
        setShowAddModal(false)
        handleSuccess('Job added successfully!')
      }
    } catch (error) {
      console.error('Error adding job:', error)
      handleError('Failed to add job')
    }
  }

  const handleDeleteJob = async (id: string) => {
    const job = jobs.find(j => j.id === id)
    const jobName = job ? `${job.role} at ${job.company}` : 'this job'
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Job Application',
      message: `Are you sure you want to delete "${jobName}"? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          if (!supabase) {
            console.error('Supabase client not initialized')
            return
          }
          
          const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id)
            .eq('user_id', user?.id)

          if (error) {
            console.error('Error deleting job:', error)
            throw error
          }

          setJobs(jobs.filter(job => job.id !== id))
          handleSuccess('Job deleted successfully!')
        } catch (error) {
          console.error('Error deleting job:', error)
          handleError('Failed to delete job')
        }
      }
    })
  }

  const handleUpdateJob = async (id: string, updates: Partial<Job>) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }
      
      if (!supabase) {
        console.error('Supabase client not initialized')
        return
      }
      
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: JSON.stringify(error, null, 2)
        })
        throw error
      }
      
      if (data && data.length > 0) {
        setJobs(jobs.map(job => job.id === id ? data[0] : job))
      } else {
        throw new Error('No data returned from update')
      }
    } catch (error) {
      console.error('Error updating job:', error)
      throw error
    }
  }

  const handleUploadDocument = async (file: File, documentData: DocumentFormData) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const document = await DocumentService.uploadDocument(file, documentData, user.id)
      setDocuments([document, ...documents])
      setShowDocumentUpload(false)
      handleSuccess('Document uploaded successfully!')
    } catch (error) {
      console.error('Error uploading document:', error)
      throw error
    }
  }

  const handleDeleteDocument = async (id: string) => {
    const document = documents.find(d => d.id === id)
    const documentName = document ? document.name : 'this document'
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Document',
      message: `Are you sure you want to delete "${documentName}"? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          if (!supabase) {
            console.error('Supabase client not initialized')
            return
          }
          
          const { error } = await supabase
            .from('documents')
            .update({ is_active: false })
            .eq('id', id)
            .eq('user_id', user?.id)

          if (error) {
            console.error('Error deleting document:', error)
            throw error
          }

          setDocuments(documents.filter(doc => doc.id !== id))
          handleSuccess('Document deleted successfully!')
        } catch (error) {
          console.error('Error deleting document:', error)
          throw error
        }
      }
    })
  }

  const handleConfirmDocumentDelete = (id: string, documentName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Document',
      message: `Are you sure you want to delete "${documentName}"? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          if (!supabase) {
            console.error('Supabase client not initialized')
            return
          }
          
          const { error } = await supabase
            .from('documents')
            .update({ is_active: false })
            .eq('id', id)
            .eq('user_id', user?.id)

          if (error) {
            console.error('Error deleting document:', error)
            throw error
          }

          setDocuments(documents.filter(doc => doc.id !== id))
          handleSuccess('Document deleted successfully!')
        } catch (error) {
          console.error('Error deleting document:', error)
          handleError('Failed to delete document')
        }
      }
    })
  }

  const handleUpdateDocument = async (id: string, updates: Partial<DocumentFormData>) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      if (!supabase) {
        console.error('Supabase client not initialized')
        return
      }

      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating document:', error)
        throw error
      }

      setDocuments(documents.map(doc => doc.id === id ? data : doc))
      handleSuccess('Document updated successfully!')
    } catch (error) {
      console.error('Error updating document:', error)
      throw error
    }
  }

  const handleCreateFolder = async (folderData: FolderFormData): Promise<Folder> => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const folder = await FolderService.createFolder(folderData, user.id)
      setFolders([folder, ...folders])
      return folder
    } catch (error) {
      console.error('Error creating folder:', error)
      throw error
    }
  }

  const handleUpdateFolder = async (folderData: FolderFormData) => {
    try {
      if (!user?.id || !editingFolder) {
        throw new Error('User not authenticated or no folder selected')
      }

      const folder = await FolderService.updateFolder(editingFolder.id, folderData, user.id)
      setFolders(folders.map(f => f.id === editingFolder.id ? folder : f))
      handleSuccess('Folder updated successfully!')
    } catch (error) {
      console.error('Error updating folder:', error)
      throw error
    }
  }

  const handleDeleteFolder = async (id: string) => {
    const folder = folders.find(f => f.id === id)
    const folderName = folder ? folder.name : 'this folder'
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Folder',
      message: `Are you sure you want to delete "${folderName}"? This will also delete all documents in this folder. This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          if (!user?.id) {
            throw new Error('User not authenticated')
          }

          await FolderService.deleteFolder(id, user.id)
          setFolders(folders.filter(f => f.id !== id))
          // If the deleted folder was selected, go back to root
          if (selectedFolderId === id) {
            setSelectedFolderId(null)
          }
          handleSuccess('Folder deleted successfully!')
        } catch (error) {
          console.error('Error deleting folder:', error)
          throw error
        }
      }
    })
  }

  const handleConfirmFolderDelete = (id: string, folderName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Folder',
      message: `Are you sure you want to delete "${folderName}"? This will also delete all documents in this folder. This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          if (!user?.id) {
            throw new Error('User not authenticated')
          }

          await FolderService.deleteFolder(id, user.id)
          setFolders(folders.filter(f => f.id !== id))
          // If the deleted folder was selected, go back to root
          if (selectedFolderId === id) {
            setSelectedFolderId(null)
          }
          handleSuccess('Folder deleted successfully!')
        } catch (error) {
          console.error('Error deleting folder:', error)
          handleError('Failed to delete folder')
        }
      }
    })
  }

  const handleFolderSubmit = async (folderData: FolderFormData) => {
    if (editingFolder) {
      await handleUpdateFolder(folderData)
    } else {
      await handleCreateFolder(folderData)
    }
  }

  // Contact management functions
  const handleCreateContact = async (contactData: ContactFormData) => {
    try {
      if (!user?.id) throw new Error('User not authenticated')
      const contact = await ContactService.createContact(contactData, user.id)
      setContacts([contact, ...contacts])
      handleSuccess('Contact created successfully!')
    } catch (error) {
      console.error('Error creating contact:', error)
      throw error
    }
  }

  const handleUpdateContact = async (id: string, updates: Partial<ContactFormData>) => {
    try {
      if (!user?.id) throw new Error('User not authenticated')
      const contact = await ContactService.updateContact(id, updates, user.id)
      setContacts(contacts.map(c => c.id === id ? contact : c))
      handleSuccess('Contact updated successfully!')
    } catch (error) {
      console.error('Error updating contact:', error)
      throw error
    }
  }

  const handleDeleteContact = async (id: string) => {
    const contact = contacts.find(c => c.id === id)
    const contactName = contact ? `${contact.first_name} ${contact.last_name}` : 'this contact'
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Contact',
      message: `Are you sure you want to delete "${contactName}"? This will also delete all interactions with this contact. This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          if (!user?.id) throw new Error('User not authenticated')
          await ContactService.deleteContact(id, user.id)
          setContacts(contacts.filter(c => c.id !== id))
          handleSuccess('Contact deleted successfully!')
        } catch (error) {
          console.error('Error deleting contact:', error)
          throw error
        }
      }
    })
  }

  const handleConfirmContactDelete = (id: string, contactName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Contact',
      message: `Are you sure you want to delete "${contactName}"? This will also delete all interactions with this contact. This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          if (!user?.id) throw new Error('User not authenticated')
          await ContactService.deleteContact(id, user.id)
          setContacts(contacts.filter(c => c.id !== id))
          handleSuccess('Contact deleted successfully!')
        } catch (error) {
          console.error('Error deleting contact:', error)
          handleError('Failed to delete contact')
        }
      }
    })
  }

  const handleConfirmJobDelete = (id: string, jobName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Job Application',
      message: `Are you sure you want to delete "${jobName}"? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          if (!supabase) {
            console.error('Supabase client not initialized')
            return
          }
          
          const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id)
            .eq('user_id', user?.id)

          if (error) {
            console.error('Error deleting job:', error)
            throw error
          }

          setJobs(jobs.filter(job => job.id !== id))
          handleSuccess('Job deleted successfully!')
        } catch (error) {
          console.error('Error deleting job:', error)
          handleError('Failed to delete job')
        }
      }
    })
  }

  // Contact interaction management functions
  const handleCreateInteraction = async (interactionData: ContactInteractionFormData) => {
    try {
      if (!user?.id) throw new Error('User not authenticated')
      const interaction = await ContactService.createInteraction(interactionData, user.id)
      setContactInteractions([interaction, ...contactInteractions])
      handleSuccess('Interaction logged successfully!')
    } catch (error) {
      console.error('Error creating interaction:', error)
      throw error
    }
  }

  const handleUpdateInteraction = async (id: string, updates: Partial<ContactInteractionFormData>) => {
    try {
      if (!user?.id) throw new Error('User not authenticated')
      const interaction = await ContactService.updateInteraction(id, updates, user.id)
      setContactInteractions(contactInteractions.map(i => i.id === id ? interaction : i))
      handleSuccess('Interaction updated successfully!')
    } catch (error) {
      console.error('Error updating interaction:', error)
      throw error
    }
  }

  const handleDeleteInteraction = async (id: string) => {
    const interaction = contactInteractions.find(i => i.id === id)
    const interactionType = interaction ? interaction.interaction_type.replace(/_/g, ' ') : 'this interaction'
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Interaction',
      message: `Are you sure you want to delete this ${interactionType}? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          if (!user?.id) throw new Error('User not authenticated')
          await ContactService.deleteInteraction(id, user.id)
          setContactInteractions(contactInteractions.filter(i => i.id !== id))
          handleSuccess('Interaction deleted successfully!')
        } catch (error) {
          console.error('Error deleting interaction:', error)
          throw error
        }
      }
    })
  }

  const handleLogInteraction = (contactId: string) => {
    setSelectedContactForInteraction(contactId)
    setEditingInteraction(null)
    setShowInteractionModal(true)
  }

  const handleEditInteraction = (interaction: ContactInteraction) => {
    setSelectedContactForInteraction(interaction.contact_id)
    setEditingInteraction(interaction)
    setShowInteractionModal(true)
  }

  // Interview management functions
  const handleCreateInterview = async (interviewData: InterviewFormData) => {
    try {
      if (!user?.id) throw new Error('User not authenticated')
      const interview = await InterviewService.createInterview(interviewData, user.id)
      setInterviews([interview, ...interviews])
      handleSuccess('Interview scheduled successfully!')
    } catch (error) {
      console.error('Error creating interview:', error)
      throw error
    }
  }

  const handleUpdateInterview = async (id: string, updates: Partial<InterviewFormData>) => {
    try {
      if (!user?.id) throw new Error('User not authenticated')
      const interview = await InterviewService.updateInterview(id, updates, user.id)
      setInterviews(interviews.map(i => i.id === id ? interview : i))
      handleSuccess('Interview updated successfully!')
    } catch (error) {
      console.error('Error updating interview:', error)
      throw error
    }
  }

  const handleDeleteInterview = async (id: string) => {
    const interview = interviews.find(i => i.id === id)
    const interviewTitle = interview ? interview.title : 'this interview'
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Interview',
      message: `Are you sure you want to delete "${interviewTitle}"? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          if (!user?.id) throw new Error('User not authenticated')
          await InterviewService.deleteInterview(id, user.id)
          setInterviews(interviews.filter(i => i.id !== id))
          handleSuccess('Interview deleted successfully!')
        } catch (error) {
          console.error('Error deleting interview:', error)
          handleError('Failed to delete interview')
        }
      }
    })
  }

  const handleConfirmInterviewDelete = (id: string, interviewTitle: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Interview',
      message: `Are you sure you want to delete "${interviewTitle}"? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          if (!user?.id) throw new Error('User not authenticated')
          await InterviewService.deleteInterview(id, user.id)
          setInterviews(interviews.filter(i => i.id !== id))
          handleSuccess('Interview deleted successfully!')
        } catch (error) {
          console.error('Error deleting interview:', error)
          handleError('Failed to delete interview')
        }
      }
    })
  }

  const handleConfirmInteractionDelete = (id: string, interactionType: string) => {
    const interactionTypeName = interactionType.replace(/_/g, ' ')
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Interaction',
      message: `Are you sure you want to delete this ${interactionTypeName}? This action cannot be undone.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          if (!user?.id) throw new Error('User not authenticated')
          await ContactService.deleteInteraction(id, user.id)
          setContactInteractions(contactInteractions.filter(i => i.id !== id))
          handleSuccess('Interaction deleted successfully!')
        } catch (error) {
          console.error('Error deleting interaction:', error)
          handleError('Failed to delete interaction')
        }
      }
    })
  }

  const handleEditInterview = (interview: Interview) => {
    setEditingInterview(interview)
    setShowInterviewModal(true)
  }

  const handleError = (message: string) => {
    setToast({ show: true, message, type: 'error' })
  }

  const handleSuccess = (message: string) => {
    setToast({ show: true, message, type: 'success' })
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getTabContent = () => {
    switch (activeTab) {
      case 'list':
        return (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border-0 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 bg-gray-100 hover:bg-gray-200 transition-colors duration-150 text-gray-900 font-normal"
              >
                <option value="all">All Status</option>
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Job List */}
            <JobList
              jobs={filteredJobs}
              onUpdate={handleUpdateJob}
              onDelete={handleDeleteJob}
              onError={handleError}
              onSuccess={handleSuccess}
              onConfirmDelete={handleConfirmJobDelete}
            />
          </div>
        )
      
      case 'metrics':
        return (
          <MetricsDashboard
            jobs={jobs}
            onError={handleError}
          />
        )
      
      case 'documents':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Folder Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200/50 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Folders</h3>
                  <button
                    onClick={() => {
                      setEditingFolder(null)
                      setShowFolderModal(true)
                    }}
                    className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                    title="Create folder"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <FolderList
                  folders={folders}
                  selectedFolderId={selectedFolderId}
                  onSelectFolder={setSelectedFolderId}
                  onEditFolder={(folder) => {
                    setEditingFolder(folder)
                    setShowFolderModal(true)
                  }}
                  onDeleteFolder={handleDeleteFolder}
                  onError={handleError}
                  onSuccess={handleSuccess}
                  onConfirmDelete={handleConfirmFolderDelete}
                />
              </div>
            </div>

            {/* Documents Content */}
            <div className="lg:col-span-3">
              <DocumentList
                documents={documents}
                selectedFolderId={selectedFolderId}
                onDelete={handleDeleteDocument}
                onUpdate={handleUpdateDocument}
                onError={handleError}
                onSuccess={handleSuccess}
                onConfirmDelete={handleConfirmDocumentDelete}
              />
            </div>
          </div>
        )
      
      case 'contacts':
        return (
          <div className="space-y-6">
            <ContactList
              contacts={contacts}
              onCreate={handleCreateContact}
              onUpdate={handleUpdateContact}
              onDelete={handleDeleteContact}
              onError={handleError}
              onSuccess={handleSuccess}
              onLogInteraction={handleLogInteraction}
              onConfirmDelete={handleConfirmContactDelete}
              showModal={showContactModal}
              onCloseModal={() => setShowContactModal(false)}
            />
            
            {/* Interaction Timeline */}
            <div className="bg-white rounded-xl border border-gray-200/50 p-6 shadow-sm">
              <ContactTimeline
                interactions={contactInteractions}
                jobs={jobs}
                onEditInteraction={handleEditInteraction}
                onDeleteInteraction={handleDeleteInteraction}
                onError={handleError}
                onSuccess={handleSuccess}
                onConfirmDeleteInteraction={handleConfirmInteractionDelete}
              />
            </div>
          </div>
        )
      
      case 'interviews':
        return (
          <div className="space-y-6">
            <InterviewList
              interviews={interviews}
              jobs={jobs}
              onUpdate={handleUpdateInterview}
              onDelete={handleDeleteInterview}
              onEdit={handleEditInterview}
              onError={handleError}
              onSuccess={handleSuccess}
              onConfirmDelete={handleConfirmInterviewDelete}
            />
          </div>
        )
      
      default:
        return null
    }
  }

  const getHeaderConfig = () => {
    switch (activeTab) {
      case 'list':
        return {
          title: 'Job Applications',
          subtitle: 'View and manage your job applications in list or Kanban board format',
          showSearch: true,
          searchPlaceholder: 'Search jobs...',
          onSearch: setSearchTerm,
          actions: (
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowAddModal(true)}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Add Job
              </Button>
            </div>
          )
        }
      
      case 'metrics':
        return {
          title: 'Analytics & Metrics',
          subtitle: 'Track your job search performance and insights',
          showSearch: false
        }
      
      case 'documents':
        return {
          title: 'Documents',
          subtitle: 'Manage resumes, cover letters, and other job-related documents',
          showSearch: false,
          actions: (
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowDocumentUpload(true)}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Upload Document
              </Button>
            </div>
          )
        }
      
      case 'contacts':
        return {
          title: 'Contacts',
          subtitle: 'Track recruiter and networking contacts',
          showSearch: false,
          actions: (
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowContactModal(true)}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Add Contact
              </Button>
            </div>
          )
        }
      
      case 'interviews':
        return {
          title: 'Interviews',
          subtitle: 'Schedule and track interview details',
          showSearch: false,
          actions: (
            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  setEditingInterview(null)
                  setShowInterviewModal(true)
                }}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Schedule Interview
              </Button>
            </div>
          )
        }
      
      default:
        return {
          title: 'Dashboard',
          subtitle: 'Manage your job applications',
          showSearch: false
        }
    }
  }

  if (loading) {
    return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
    )
  }

  const headerConfig = getHeaderConfig()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} currentPage="dashboard" />
      
      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <Header {...headerConfig} />
        
        {/* Content */}
        <main className="p-6">
          {getTabContent()}
        </main>
      </div>

      {/* Add Job Modal */}
      {showAddModal && (
        <AddJobModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddJob}
        />
      )}

      {/* Document Upload Modal */}
      {showDocumentUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Upload Document</h2>
                <button 
                  onClick={() => setShowDocumentUpload(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <DocumentUpload
                folders={folders}
                onUpload={handleUploadDocument}
                onCreateFolder={handleCreateFolder}
                onError={handleError}
                onSuccess={handleSuccess}
              />
            </div>
          </div>
        </div>
      )}

      {/* Folder Modal */}
      {showFolderModal && (
        <FolderModal
          folder={editingFolder}
          folders={folders}
          onClose={() => {
            setShowFolderModal(false)
            setEditingFolder(null)
          }}
          onSubmit={handleFolderSubmit}
          onError={handleError}
          onSuccess={handleSuccess}
        />
      )}

      {/* Contact Interaction Modal */}
      {showInteractionModal && selectedContactForInteraction && (
        <ContactInteractionModal
          interaction={editingInteraction || undefined}
          contactId={selectedContactForInteraction}
          jobs={jobs}
          onClose={() => {
            setShowInteractionModal(false)
            setSelectedContactForInteraction(null)
            setEditingInteraction(null)
          }}
          onSubmit={editingInteraction ? 
            (updates) => handleUpdateInteraction(editingInteraction.id, updates) :
            handleCreateInteraction
          }
          onError={handleError}
          onSuccess={handleSuccess}
        />
      )}

      {/* Interview Modal */}
      {showInterviewModal && (
        <InterviewModal
          interview={editingInterview || undefined}
          jobs={jobs}
          onClose={() => {
            setShowInterviewModal(false)
            setEditingInterview(null)
          }}
          onSubmit={editingInterview ? 
            (updates) => handleUpdateInterview(editingInterview.id, updates) :
            handleCreateInterview
          }
          onError={handleError}
          onSuccess={handleSuccess}
        />
      )}

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Real-time Status (for debugging) */}
      <RealtimeStatus getSubscriptionStatus={getSubscriptionStatus} />

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          variant={confirmModal.variant}
        />
      )}
    </div>
  )
} 