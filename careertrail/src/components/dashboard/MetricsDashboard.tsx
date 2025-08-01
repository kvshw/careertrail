'use client'

import { useState, useEffect } from 'react'
import { Job, JobMetrics } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

// Define a unified activity interface
interface RecentActivity {
  id: string
  type: 'job' | 'document' | 'contact' | 'interview' | 'status_change'
  title: string
  description: string
  timestamp: string
  icon: string
  color: string
  metadata?: any
}

interface MetricsDashboardProps {
  jobs: Job[]
  onError?: (message: string) => void
}

export default function MetricsDashboard({ jobs, onError }: MetricsDashboardProps) {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<JobMetrics | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      calculateMetrics()
      fetchRecentActivities()
    } else {
      setLoading(false)
    }
  }, [user, jobs])

  const calculateMetrics = async () => {
    try {
      setLoading(true)
      
      // Calculate basic metrics from jobs data
      const totalApplications = jobs.length
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const applicationsThisMonth = jobs.filter(job => 
        new Date(job.applied_date) >= thisMonth
      ).length

      // Calculate status breakdown
      const statusBreakdown = {
        applied: jobs.filter(job => job.status === 'applied').length,
        interviewing: jobs.filter(job => job.status === 'interviewing').length,
        offer: jobs.filter(job => job.status === 'offer').length,
        rejected: jobs.filter(job => job.status === 'rejected').length,
      }

      // Calculate rates
      const interviewRate = totalApplications > 0 ? 
        ((statusBreakdown.interviewing + statusBreakdown.offer) / totalApplications * 100) : 0
      
      const offerRate = totalApplications > 0 ? 
        (statusBreakdown.offer / totalApplications * 100) : 0

      // Calculate average response time (simplified - using days since applied)
      const responseTimes = jobs
        .filter(job => job.status !== 'applied')
        .map(job => {
          const appliedDate = new Date(job.applied_date)
          const updatedDate = new Date(job.updated_at)
          return Math.ceil((updatedDate.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24))
        })
        .filter(time => time > 0)

      const averageResponseTime = responseTimes.length > 0 ? 
        Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0

      // Get top companies
      const companyCounts = jobs.reduce((acc, job) => {
        acc[job.company] = (acc[job.company] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const topCompanies = Object.entries(companyCounts)
        .map(([company, count]) => ({ company, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Fetch recent activities
      if (!supabase) {
        console.error('Supabase client not initialized')
        return
      }
      
      const { data: activities, error } = await supabase
        .from('job_activities')
        .select('*')
        .eq('user_id', user?.id)
        .order('activity_date', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching activities:', error)
        onError?.('Failed to load recent activities')
      }

      const recentActivity = activities || []

      setMetrics({
        totalApplications,
        applicationsThisMonth,
        interviewRate,
        offerRate,
        averageResponseTime,
        statusBreakdown,
        recentActivity,
        topCompanies,
      })
    } catch (error) {
      console.error('Error calculating metrics:', error)
      onError?.('Failed to calculate metrics')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivities = async () => {
    if (!supabase || !user) return

    try {
      const activities: RecentActivity[] = []

      // Fetch recent jobs
      const { data: recentJobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (recentJobs) {
        recentJobs.forEach(job => {
          activities.push({
            id: `job-${job.id}`,
            type: 'job',
            title: `Applied to ${job.role}`,
            description: `at ${job.company}`,
            timestamp: job.created_at,
            icon: '💼',
            color: 'blue',
            metadata: job
          })
        })
      }

      // Fetch recent documents
      const { data: recentDocuments } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (recentDocuments) {
        recentDocuments.forEach(doc => {
          activities.push({
            id: `doc-${doc.id}`,
            type: 'document',
            title: `Uploaded ${doc.name}`,
            description: `${doc.category} document`,
            timestamp: doc.created_at,
            icon: '📄',
            color: 'green',
            metadata: doc
          })
        })
      }

      // Fetch recent contacts
      const { data: recentContacts } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (recentContacts) {
        recentContacts.forEach(contact => {
          activities.push({
            id: `contact-${contact.id}`,
            type: 'contact',
            title: `Added ${contact.first_name} ${contact.last_name}`,
            description: `${contact.role || 'Contact'} at ${contact.company || 'Unknown Company'}`,
            timestamp: contact.created_at,
            icon: '👤',
            color: 'purple',
            metadata: contact
          })
        })
      }

      // Fetch recent interviews
      const { data: recentInterviews } = await supabase
        .from('interviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (recentInterviews) {
        recentInterviews.forEach(interview => {
          activities.push({
            id: `interview-${interview.id}`,
            type: 'interview',
            title: `Scheduled ${interview.title}`,
            description: `${interview.interview_type} interview`,
            timestamp: interview.created_at,
            icon: '📅',
            color: 'orange',
            metadata: interview
          })
        })
      }

      // Sort all activities by timestamp and take the most recent 10
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)

      setRecentActivities(sortedActivities)
    } catch (error) {
      console.error('Error fetching recent activities:', error)
      onError?.('Failed to load recent activities')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job Search Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No data available yet. Start adding job applications to see your metrics!</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800'
      case 'interviewing': return 'bg-yellow-100 text-yellow-800'
      case 'offer': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Total Applications</p>
                <p className="text-3xl font-bold text-blue-900">{metrics.totalApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-2xl">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Interview Rate</p>
                <p className="text-3xl font-bold text-green-900">{metrics.interviewRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-2xl">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Offer Rate</p>
                <p className="text-3xl font-bold text-purple-900">{metrics.offerRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200/50">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-2xl">
                <span className="text-2xl">⏱️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-600">Avg Response</p>
                <p className="text-3xl font-bold text-orange-900">{metrics.averageResponseTime} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Application Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(metrics.statusBreakdown).map(([status, count]) => (
              <div key={status} className="text-center">
                <div className={cn(
                  "inline-flex items-center px-4 py-2 rounded-2xl text-sm font-medium mb-3",
                  getStatusColor(status)
                )}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
                <p className="text-3xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-500">
                  {metrics.totalApplications > 0 ? ((count / metrics.totalApplications) * 100).toFixed(1) : 0}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Companies and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Companies */}
        <Card>
          <CardHeader>
            <CardTitle>Top Companies</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.topCompanies.length > 0 ? (
              <div className="space-y-4">
                {metrics.topCompanies.map((company, index) => (
                  <div key={company.company} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                      <span className="font-medium text-gray-900">{company.company}</span>
                    </div>
                    <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                      {company.count} applications
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No company data available</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className={cn(
                      "p-2 rounded-lg",
                      activity.color === 'blue' && "bg-blue-100",
                      activity.color === 'green' && "bg-green-100", 
                      activity.color === 'purple' && "bg-purple-100",
                      activity.color === 'orange' && "bg-orange-100"
                    )}>
                      <span className="text-lg">{activity.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 