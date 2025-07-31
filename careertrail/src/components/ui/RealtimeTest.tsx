'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Button from './Button'

interface RealtimeTestProps {
  userId: string
  className?: string
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

export default function RealtimeTest({ 
  userId, 
  className = '',
  onSuccess,
  onError
}: RealtimeTestProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const createTestJob = async () => {
    setIsLoading(true)
    try {
      const testJob = {
        company: 'Test Company',
        role: 'Test Role',
        status: 'applied' as const,
        applied_date: new Date().toISOString().split('T')[0],
        notes: 'This is a test job created for real-time testing',
        user_id: userId
      }

      const { data, error } = await supabase
        .from('jobs')
        .insert([testJob])
        .select()

      if (error) {
        console.error('Error creating test job:', error)
        onError?.('Failed to create test job')
      } else {
        console.log('Test job created:', data)
        onSuccess?.('Test job created! Check the jobs list for real-time updates.')
      }
    } catch (error) {
      console.error('Error creating test job:', error)
      onError?.('Failed to create test job')
    } finally {
      setIsLoading(false)
    }
  }

  const createTestDocument = async () => {
    setIsLoading(true)
    try {
      const testDocument = {
        name: 'Test Document',
        description: 'This is a test document for real-time testing',
        category: 'other' as const,
        file_path: '/test/test-document.pdf',
        file_size: 1024,
        file_type: 'application/pdf',
        version: 1,
        is_active: true,
        user_id: userId
      }

      const { data, error } = await supabase
        .from('documents')
        .insert([testDocument])
        .select()

      if (error) {
        console.error('Error creating test document:', error)
        onError?.('Failed to create test document')
      } else {
        console.log('Test document created:', data)
        onSuccess?.('Test document created! Check the documents list for real-time updates.')
      }
    } catch (error) {
      console.error('Error creating test document:', error)
      onError?.('Failed to create test document')
    } finally {
      setIsLoading(false)
    }
  }

  const createTestContact = async () => {
    setIsLoading(true)
    try {
      const testContact = {
        first_name: 'Test',
        last_name: 'Contact',
        email: 'test@example.com',
        company: 'Test Company',
        role: 'Test Role',
        category: 'other' as const,
        status: 'active' as const,
        tags: ['test'],
        user_id: userId
      }

      const { data, error } = await supabase
        .from('contacts')
        .insert([testContact])
        .select()

      if (error) {
        console.error('Error creating test contact:', error)
        onError?.('Failed to create test contact')
      } else {
        console.log('Test contact created:', data)
        onSuccess?.('Test contact created! Check the contacts list for real-time updates.')
      }
    } catch (error) {
      console.error('Error creating test contact:', error)
      onError?.('Failed to create test contact')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className={`fixed bottom-4 left-4 z-50 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors ${className}`}
      >
        Test Real-time
      </button>
    )
  }

  return (
    <div className={`fixed bottom-4 left-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Real-time Test</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-2">
        <Button
          onClick={createTestJob}
          disabled={isLoading}
          size="sm"
          className="w-full"
        >
          {isLoading ? 'Creating...' : 'Create Test Job'}
        </Button>
        
        <Button
          onClick={createTestDocument}
          disabled={isLoading}
          size="sm"
          variant="secondary"
          className="w-full"
        >
          {isLoading ? 'Creating...' : 'Create Test Document'}
        </Button>
        
        <Button
          onClick={createTestContact}
          disabled={isLoading}
          size="sm"
          variant="secondary"
          className="w-full"
        >
          {isLoading ? 'Creating...' : 'Create Test Contact'}
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 mt-3">
        These will create test data and trigger real-time updates across all tabs.
      </p>
    </div>
  )
} 