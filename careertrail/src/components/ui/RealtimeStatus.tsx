'use client'

import { useState, useEffect } from 'react'

interface RealtimeStatusProps {
  getSubscriptionStatus: () => Record<string, string>
  className?: string
}

export default function RealtimeStatus({ getSubscriptionStatus, className = '' }: RealtimeStatusProps) {
  const [status, setStatus] = useState<Record<string, string>>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateStatus = () => {
      setStatus(getSubscriptionStatus())
    }

    // Update status immediately
    updateStatus()

    // Update status every 5 seconds
    const interval = setInterval(updateStatus, 5000)

    return () => clearInterval(interval)
  }, [getSubscriptionStatus])

  const activeSubscriptions = Object.entries(status).filter(([_, state]) => state === 'subscribed')

  if (!isVisible && activeSubscriptions.length === 0) {
    return null
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">Real-time Status</h3>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-1">
          {Object.entries(status).map(([channel, state]) => (
            <div key={channel} className="flex items-center justify-between text-xs">
              <span className="text-gray-600 capitalize">{channel.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                state === 'subscribed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {state}
              </span>
            </div>
          ))}
        </div>

        {activeSubscriptions.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{activeSubscriptions.length} active subscription{activeSubscriptions.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 