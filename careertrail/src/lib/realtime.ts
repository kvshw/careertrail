import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { Job, Document, Folder, Contact, ContactInteraction, Interview } from './supabase'

export type RealtimeCallback<T extends Record<string, any>> = (payload: RealtimePostgresChangesPayload<T>) => void

export interface RealtimeSubscriptions {
  jobs?: RealtimeChannel
  documents?: RealtimeChannel
  folders?: RealtimeChannel
  contacts?: RealtimeChannel
  contactInteractions?: RealtimeChannel
  interviews?: RealtimeChannel
}

export class RealtimeService {
  private subscriptions: RealtimeSubscriptions = {}

  /**
   * Subscribe to real-time changes for jobs
   */
  subscribeToJobs(userId: string, callback: RealtimeCallback<Job>) {
    if (this.subscriptions.jobs) {
      this.subscriptions.jobs.unsubscribe()
    }

    this.subscriptions.jobs = supabase
      .channel('jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()

    return this.subscriptions.jobs
  }

  /**
   * Subscribe to real-time changes for documents
   */
  subscribeToDocuments(userId: string, callback: RealtimeCallback<Document>) {
    if (this.subscriptions.documents) {
      this.subscriptions.documents.unsubscribe()
    }

    this.subscriptions.documents = supabase
      .channel('documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()

    return this.subscriptions.documents
  }

  /**
   * Subscribe to real-time changes for folders
   */
  subscribeToFolders(userId: string, callback: RealtimeCallback<Folder>) {
    if (this.subscriptions.folders) {
      this.subscriptions.folders.unsubscribe()
    }

    this.subscriptions.folders = supabase
      .channel('folders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'folders',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()

    return this.subscriptions.folders
  }

  /**
   * Subscribe to real-time changes for contacts
   */
  subscribeToContacts(userId: string, callback: RealtimeCallback<Contact>) {
    if (this.subscriptions.contacts) {
      this.subscriptions.contacts.unsubscribe()
    }

    this.subscriptions.contacts = supabase
      .channel('contacts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()

    return this.subscriptions.contacts
  }

  /**
   * Subscribe to real-time changes for contact interactions
   */
  subscribeToContactInteractions(userId: string, callback: RealtimeCallback<ContactInteraction>) {
    if (this.subscriptions.contactInteractions) {
      this.subscriptions.contactInteractions.unsubscribe()
    }

    this.subscriptions.contactInteractions = supabase
      .channel('contact-interactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_interactions',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()

    return this.subscriptions.contactInteractions
  }

  /**
   * Subscribe to real-time changes for interviews
   */
  subscribeToInterviews(userId: string, callback: RealtimeCallback<Interview>) {
    if (this.subscriptions.interviews) {
      this.subscriptions.interviews.unsubscribe()
    }

    this.subscriptions.interviews = supabase
      .channel('interviews-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interviews',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()

    return this.subscriptions.interviews
  }

  /**
   * Subscribe to all real-time changes for a user
   */
  subscribeToAll(userId: string, callbacks: {
    jobs?: RealtimeCallback<Job>
    documents?: RealtimeCallback<Document>
    folders?: RealtimeCallback<Folder>
    contacts?: RealtimeCallback<Contact>
    contactInteractions?: RealtimeCallback<ContactInteraction>
    interviews?: RealtimeCallback<Interview>
  }) {
    if (callbacks.jobs) {
      this.subscribeToJobs(userId, callbacks.jobs)
    }
    if (callbacks.documents) {
      this.subscribeToDocuments(userId, callbacks.documents)
    }
    if (callbacks.folders) {
      this.subscribeToFolders(userId, callbacks.folders)
    }
    if (callbacks.contacts) {
      this.subscribeToContacts(userId, callbacks.contacts)
    }
    if (callbacks.contactInteractions) {
      this.subscribeToContactInteractions(userId, callbacks.contactInteractions)
    }
    if (callbacks.interviews) {
      this.subscribeToInterviews(userId, callbacks.interviews)
    }
  }

  /**
   * Unsubscribe from all real-time channels
   */
  unsubscribeAll() {
    Object.values(this.subscriptions).forEach(channel => {
      if (channel) {
        channel.unsubscribe()
      }
    })
    this.subscriptions = {}
  }

  /**
   * Unsubscribe from a specific channel
   */
  unsubscribe(channelName: keyof RealtimeSubscriptions) {
    const channel = this.subscriptions[channelName]
    if (channel) {
      channel.unsubscribe()
      delete this.subscriptions[channelName]
    }
  }

  /**
   * Get the current subscription status
   */
  getSubscriptionStatus() {
    return Object.entries(this.subscriptions).reduce((acc, [key, channel]) => {
      acc[key as keyof RealtimeSubscriptions] = channel?.subscription?.state || 'unsubscribed'
      return acc
    }, {} as Record<keyof RealtimeSubscriptions, string>)
  }
}

// Export a singleton instance
export const realtimeService = new RealtimeService() 