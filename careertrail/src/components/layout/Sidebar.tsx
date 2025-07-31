'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeTab?: 'list' | 'metrics' | 'documents' | 'contacts' | 'interviews'
  onTabChange?: (tab: 'list' | 'metrics' | 'documents' | 'contacts' | 'interviews') => void
  currentPage?: 'dashboard' | 'profile'
}

export default function Sidebar({ activeTab, onTabChange, currentPage = 'dashboard' }: SidebarProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navigationItems: Array<{
    id: 'list' | 'metrics' | 'documents' | 'contacts' | 'interviews'
    label: string
    icon: React.ReactNode
  }> = [
    {
      id: 'list',
      label: 'Job List',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      id: 'metrics',
      label: 'Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      id: 'interviews',
      label: 'Interviews',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ]

  const handleNavigation = (itemId: string) => {
    if (currentPage === 'dashboard' && onTabChange) {
      onTabChange(itemId as any)
    } else if (currentPage === 'profile') {
      // Navigate to dashboard with the selected tab
      router.push(`/dashboard?tab=${itemId}`)
    }
  }

  const handleProfileClick = () => {
    if (currentPage !== 'profile') {
      router.push('/profile')
    }
  }

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-white/95 backdrop-blur-xl border-r border-orange-200/30 transition-all duration-300 z-40 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-orange-200/30">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3-3 3" />
              </svg>
            </div>
            <span className="font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">CareerTrail</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-orange-50 transition-colors"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.id)}
            className={cn(
              "w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group",
              isCollapsed ? "justify-center" : "",
              (currentPage === 'dashboard' && activeTab === item.id)
                ? "bg-gradient-to-r from-orange-50 to-pink-50 text-orange-700 border border-orange-200/50 shadow-sm"
                : "text-gray-700 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-pink-50/50 hover:text-orange-600 hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            <div className={cn(
              "flex items-center justify-center w-5 h-5 flex-shrink-0 transition-all duration-200",
              isCollapsed ? "" : "mr-3",
              (currentPage === 'dashboard' && activeTab === item.id)
                ? "text-orange-600"
                : "text-gray-500 group-hover:text-orange-500"
            )}>
              {item.icon}
            </div>
            {!isCollapsed && (
              <span className={cn(
                "truncate transition-colors duration-200",
                (currentPage === 'dashboard' && activeTab === item.id)
                  ? "text-orange-700"
                  : "text-gray-700 group-hover:text-orange-600"
              )}>
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* User Profile - Fixed at bottom */}
      <div className="mt-auto p-4 border-t border-orange-200/30">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-white text-sm font-medium">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 ml-3">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email || 'User'}
              </p>
              <p className="text-xs text-orange-600 font-medium">✨ Active</p>
            </div>
          )}
          {!isCollapsed && (
            <div className="flex space-x-1 ml-2">
              <button
                onClick={handleProfileClick}
                className="p-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                title="Profile Settings"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <button
                onClick={() => signOut()}
                className="p-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                title="Sign Out"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 