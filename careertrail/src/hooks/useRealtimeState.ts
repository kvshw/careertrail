import { useEffect, useCallback, useRef } from 'react'
import { realtimeService, RealtimeCallback } from '@/lib/realtime'
import { Job, Document, Folder, Contact, ContactInteraction, Interview } from '@/lib/supabase'

interface UseRealtimeStateOptions {
  userId: string
  jobs?: Job[]
  documents?: Document[]
  folders?: Folder[]
  contacts?: Contact[]
  contactInteractions?: ContactInteraction[]
  interviews?: Interview[]
  onJobsChange?: (jobs: Job[]) => void
  onDocumentsChange?: (documents: Document[]) => void
  onFoldersChange?: (folders: Folder[]) => void
  onContactsChange?: (contacts: Contact[]) => void
  onContactInteractionsChange?: (interactions: ContactInteraction[]) => void
  onInterviewsChange?: (interviews: Interview[]) => void
}

export function useRealtimeState({
  userId,
  jobs = [],
  documents = [],
  folders = [],
  contacts = [],
  contactInteractions = [],
  interviews = [],
  onJobsChange,
  onDocumentsChange,
  onFoldersChange,
  onContactsChange,
  onContactInteractionsChange,
  onInterviewsChange
}: UseRealtimeStateOptions) {
  
  // Use refs to store the latest state values
  const jobsRef = useRef<Job[]>(jobs)
  const documentsRef = useRef<Document[]>(documents)
  const foldersRef = useRef<Folder[]>(folders)
  const contactsRef = useRef<Contact[]>(contacts)
  const contactInteractionsRef = useRef<ContactInteraction[]>(contactInteractions)
  const interviewsRef = useRef<Interview[]>(interviews)

  // Update refs when props change
  useEffect(() => {
    jobsRef.current = jobs
  }, [jobs])

  useEffect(() => {
    documentsRef.current = documents
  }, [documents])

  useEffect(() => {
    foldersRef.current = folders
  }, [folders])

  useEffect(() => {
    contactsRef.current = contacts
  }, [contacts])

  useEffect(() => {
    contactInteractionsRef.current = contactInteractions
  }, [contactInteractions])

  useEffect(() => {
    interviewsRef.current = interviews
  }, [interviews])

  // Helper function to update state based on real-time payload
  const updateState = useCallback(<T extends { id: string }>(
    currentItems: T[],
    payload: any,
    onUpdate: (items: T[]) => void
  ) => {
    const { eventType, new: newRecord, old: oldRecord } = payload

    let updatedItems: T[]

    switch (eventType) {
      case 'INSERT':
        // Add new item to the beginning of the list
        updatedItems = [newRecord, ...currentItems]
        break
      
      case 'UPDATE':
        // Update existing item
        updatedItems = currentItems.map(item => 
          item.id === newRecord.id ? newRecord : item
        )
        break
      
      case 'DELETE':
        // Remove deleted item
        updatedItems = currentItems.filter(item => item.id !== oldRecord.id)
        break
      
      default:
        updatedItems = currentItems
    }

    onUpdate(updatedItems)
  }, [])

  // Create callbacks that handle the real-time updates
  const handleJobsChange: RealtimeCallback<Job> = useCallback((payload) => {
    console.log('Real-time jobs change:', payload)
    if (onJobsChange) {
      updateState(jobsRef.current, payload, onJobsChange)
    }
  }, [onJobsChange, updateState])

  const handleDocumentsChange: RealtimeCallback<Document> = useCallback((payload) => {
    console.log('Real-time documents change:', payload)
    if (onDocumentsChange) {
      updateState(documentsRef.current, payload, onDocumentsChange)
    }
  }, [onDocumentsChange, updateState])

  const handleFoldersChange: RealtimeCallback<Folder> = useCallback((payload) => {
    console.log('Real-time folders change:', payload)
    if (onFoldersChange) {
      updateState(foldersRef.current, payload, onFoldersChange)
    }
  }, [onFoldersChange, updateState])

  const handleContactsChange: RealtimeCallback<Contact> = useCallback((payload) => {
    console.log('Real-time contacts change:', payload)
    if (onContactsChange) {
      updateState(contactsRef.current, payload, onContactsChange)
    }
  }, [onContactsChange, updateState])

  const handleContactInteractionsChange: RealtimeCallback<ContactInteraction> = useCallback((payload) => {
    console.log('Real-time contact interactions change:', payload)
    if (onContactInteractionsChange) {
      updateState(contactInteractionsRef.current, payload, onContactInteractionsChange)
    }
  }, [onContactInteractionsChange, updateState])

  const handleInterviewsChange: RealtimeCallback<Interview> = useCallback((payload) => {
    console.log('Real-time interviews change:', payload)
    if (onInterviewsChange) {
      updateState(interviewsRef.current, payload, onInterviewsChange)
    }
  }, [onInterviewsChange, updateState])

  // Set up subscriptions when the component mounts
  useEffect(() => {
    if (!userId) return

    const callbacks: any = {}
    
    if (onJobsChange) callbacks.jobs = handleJobsChange
    if (onDocumentsChange) callbacks.documents = handleDocumentsChange
    if (onFoldersChange) callbacks.folders = handleFoldersChange
    if (onContactsChange) callbacks.contacts = handleContactsChange
    if (onContactInteractionsChange) callbacks.contactInteractions = handleContactInteractionsChange
    if (onInterviewsChange) callbacks.interviews = handleInterviewsChange

    // Subscribe to all requested channels
    realtimeService.subscribeToAll(userId, callbacks)

    // Cleanup subscriptions when component unmounts
    return () => {
      realtimeService.unsubscribeAll()
    }
  }, [
    userId,
    handleJobsChange,
    handleDocumentsChange,
    handleFoldersChange,
    handleContactsChange,
    handleContactInteractionsChange,
    handleInterviewsChange,
    onJobsChange,
    onDocumentsChange,
    onFoldersChange,
    onContactsChange,
    onContactInteractionsChange,
    onInterviewsChange
  ])

  // Return subscription status for debugging
  const getSubscriptionStatus = useCallback(() => {
    return realtimeService.getSubscriptionStatus()
  }, [])

  return {
    getSubscriptionStatus
  }
} 