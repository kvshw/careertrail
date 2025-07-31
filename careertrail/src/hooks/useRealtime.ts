import { useEffect, useCallback } from 'react'
import { realtimeService, RealtimeCallback } from '@/lib/realtime'
import { Job, Document, Folder, Contact, ContactInteraction, Interview } from '@/lib/supabase'

interface UseRealtimeOptions {
  userId: string
  onJobsChange?: (jobs: Job[]) => void
  onDocumentsChange?: (documents: Document[]) => void
  onFoldersChange?: (folders: Folder[]) => void
  onContactsChange?: (contacts: Contact[]) => void
  onContactInteractionsChange?: (interactions: ContactInteraction[]) => void
  onInterviewsChange?: (interviews: Interview[]) => void
}

export function useRealtime({
  userId,
  onJobsChange,
  onDocumentsChange,
  onFoldersChange,
  onContactsChange,
  onContactInteractionsChange,
  onInterviewsChange
}: UseRealtimeOptions) {
  
  // Create callbacks that handle the real-time updates
  const handleJobsChange: RealtimeCallback<Job> = useCallback((payload) => {
    console.log('Real-time jobs change:', payload)
    if (onJobsChange) {
      // The callback will need to fetch updated data or handle the change appropriately
      onJobsChange([]) // This will be handled by the component
    }
  }, [onJobsChange])

  const handleDocumentsChange: RealtimeCallback<Document> = useCallback((payload) => {
    console.log('Real-time documents change:', payload)
    if (onDocumentsChange) {
      onDocumentsChange([]) // This will be handled by the component
    }
  }, [onDocumentsChange])

  const handleFoldersChange: RealtimeCallback<Folder> = useCallback((payload) => {
    console.log('Real-time folders change:', payload)
    if (onFoldersChange) {
      onFoldersChange([]) // This will be handled by the component
    }
  }, [onFoldersChange])

  const handleContactsChange: RealtimeCallback<Contact> = useCallback((payload) => {
    console.log('Real-time contacts change:', payload)
    if (onContactsChange) {
      onContactsChange([]) // This will be handled by the component
    }
  }, [onContactsChange])

  const handleContactInteractionsChange: RealtimeCallback<ContactInteraction> = useCallback((payload) => {
    console.log('Real-time contact interactions change:', payload)
    if (onContactInteractionsChange) {
      onContactInteractionsChange([]) // This will be handled by the component
    }
  }, [onContactInteractionsChange])

  const handleInterviewsChange: RealtimeCallback<Interview> = useCallback((payload) => {
    console.log('Real-time interviews change:', payload)
    if (onInterviewsChange) {
      onInterviewsChange([]) // This will be handled by the component
    }
  }, [onInterviewsChange])

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