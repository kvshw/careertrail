'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-xl border-b border-orange-200/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3-3 3" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  CareerTrail
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/signin"
                className="text-gray-700 hover:text-orange-600 px-4 py-2 rounded-2xl text-sm font-medium transition-colors"
              >
                Sign In
              </a>
              <a
                href="/signup"
                className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-2 rounded-2xl text-sm font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started Free
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23f97316%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 text-sm font-medium mb-8 border border-orange-200">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3-3 3" />
              </svg>
              ✨ Trusted by 10,000+ professionals worldwide
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Land Your Dream Job
              <span className="block bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent font-bold">
                in Half the Time
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
              Stop losing track of applications and missing opportunities. CareerTrail transforms your job search 
              from chaotic to strategic, helping you build meaningful connections and land interviews 
              that actually lead to offers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <a
                href="/signup"
                className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:from-orange-600 hover:to-pink-600 transition-all duration-200 flex items-center shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                🚀 Start Free Today
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a
                href="/signin"
                className="text-gray-700 hover:text-orange-600 px-8 py-4 rounded-2xl text-lg font-medium border-2 border-orange-200 hover:border-orange-300 transition-all duration-200 hover:bg-orange-50"
              >
                Sign In
              </a>
            </div>

            {/* Hero Image */}
            <div className="relative max-w-5xl mx-auto">
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200/30">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-orange-600 font-medium">✨ Live Dashboard</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">Your Job Search, Simplified</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      Finally, a dashboard that actually helps you get hired! 🎯 See your progress, track your connections, 
                      and never miss another opportunity again.
                    </p>
                    <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Real-time application tracking
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Cross-device synchronization
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Enterprise-grade security
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-8 border border-orange-100">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-orange-100">
                        <div>
                          <span className="text-sm font-medium text-gray-700">🎯 Active Applications</span>
                          <p className="text-xs text-orange-600">Track your progress</p>
                        </div>
                        <span className="text-3xl font-bold text-orange-600">24</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-pink-100">
                        <div>
                          <span className="text-sm font-medium text-gray-700">📅 Upcoming Interviews</span>
                          <p className="text-xs text-pink-600">Never miss one</p>
                        </div>
                        <span className="text-3xl font-bold text-pink-600">8</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-yellow-100">
                        <div>
                          <span className="text-sm font-medium text-gray-700">🤝 Network Contacts</span>
                          <p className="text-xs text-yellow-600">Build relationships</p>
                        </div>
                        <span className="text-3xl font-bold text-yellow-600">15</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Benefits Section */}
      <div className="py-24 bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why CareerTrail Users Get Hired Faster
            </h2>
                          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The average CareerTrail user lands their dream job 47% faster than traditional job seekers. 
                Here&apos;s how we make the difference.
              </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Benefit 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3-3 3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Never Miss an Opportunity</h3>
              <p className="text-gray-600 leading-relaxed">
                Automated tracking ensures you follow up on every application at the right time! 
                No more wondering if you should call or email - we tell you exactly when and how.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">🤝 Build Meaningful Connections</h3>
              <p className="text-gray-600 leading-relaxed">
                Transform casual networking into powerful relationships! Track every interaction 
                and build a network that opens doors to opportunities you never knew existed.
              </p>
            </div>

                        {/* Benefit 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Data-Driven Success</h3>
              <p className="text-gray-600 leading-relaxed">
                Understand what works and what doesn&apos;t! Our analytics show you exactly where 
                to focus your efforts for maximum impact and faster results.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">⏰ Save Hours Every Week</h3>
              <p className="text-gray-600 leading-relaxed">
                Stop spending time on manual tracking and organization! Focus on what matters: 
                preparing for interviews and building your career, not managing spreadsheets.
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">💪 Interview with Confidence</h3>
              <p className="text-gray-600 leading-relaxed">
                Walk into every interview prepared! Access your research, company notes, 
                and contact history instantly, so you can focus on making a great impression.
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">❤️ Land Jobs You Love</h3>
              <p className="text-gray-600 leading-relaxed">
                By tracking what works and building strong relationships, you&apos;ll find yourself 
                in positions that align with your values and advance your career goals!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Powerful Tools That Actually Work
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We&apos;ve built the features that successful job seekers actually need. 
              No fluff, just tools that help you get hired faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Job Tracking */}
            <div className="bg-white rounded-2xl p-8 border border-orange-200/30 hover:shadow-xl transition-all duration-300 hover:border-orange-300">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Application Tracking</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Stop losing track of where you applied. Our intelligent system automatically 
                organizes your applications and tells you exactly when to follow up.
              </p>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  One-click LinkedIn job import
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Automated follow-up reminders
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Smart status categorization
                </div>
              </div>
            </div>

            {/* Document Management */}
            <div className="bg-white rounded-2xl p-8 border border-pink-200/30 hover:shadow-xl transition-all duration-300 hover:border-pink-300">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Document Management</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Never scramble for the right resume again. Our intelligent system organizes 
                your documents and suggests the perfect version for each application.
              </p>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  AI-powered document suggestions
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Version control & history
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Instant document access
                </div>
              </div>
            </div>

            {/* Contact Management */}
            <div className="bg-white rounded-2xl p-8 border border-purple-200/30 hover:shadow-xl transition-all duration-300 hover:border-purple-300">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Relationship Intelligence</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Transform casual connections into career opportunities. Our system helps you 
                build and nurture relationships that actually lead to job offers.
              </p>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Smart interaction tracking
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Automated follow-up scheduling
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Relationship strength scoring
                </div>
              </div>
            </div>

            {/* Interview Management */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200/50 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Interview Scheduler</h3>
              <p className="text-gray-600 mb-6">
                Schedule and track interviews with ease. Never miss an important 
                meeting or follow-up with our comprehensive interview management.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Calendar integration
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Interview preparation
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Round tracking
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200/50 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Analytics</h3>
              <p className="text-gray-600 mb-6">
                Get insights into your job search performance. Track your progress 
                and optimize your strategy with data-driven insights.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Application success rates
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Time-to-interview tracking
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Performance insights
                </div>
              </div>
            </div>

            {/* Real-time Sync */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200/50 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3-3 3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Real-time Sync</h3>
              <p className="text-gray-600 mb-6">
                Access your job search data from anywhere. All your information 
                syncs instantly across all your devices.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Cross-device sync
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Instant updates
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Offline support
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              How CareerTrail Gets You Hired
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The traditional job search is broken. Here&apos;s how we&apos;re fixing it to help you 
              land the best opportunities faster than ever before.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">🎯 Stop the Chaos</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Most job seekers lose track of applications, miss follow-ups, and waste time 
                      on manual organization. CareerTrail eliminates this chaos with intelligent 
                      automation that keeps everything organized and actionable!
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">🤝 Build Real Relationships</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Networking isn&apos;t about collecting business cards—it&apos;s about building 
                      meaningful relationships! Our system helps you track every interaction, 
                      remember important details, and follow up at the right time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">💪 Interview Like a Pro</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Walk into every interview with complete context! Access company research, 
                      contact history, and preparation notes instantly. Focus on making a great 
                      impression, not remembering details.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">🚀 Land Your Dream Job</h3>
                    <p className="text-gray-600 leading-relaxed">
                      By staying organized, building relationships, and interviewing confidently, 
                      you&apos;ll find yourself in positions that align with your values and advance 
                      your career goals!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-3xl p-8 border border-orange-100">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">The CareerTrail Advantage</h3>
                  <p className="text-gray-600">See the difference in your job search results</p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Average Time to Job Offer</span>
                      <span className="text-xs text-gray-500">Traditional vs CareerTrail</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div className="bg-gray-400 h-3 rounded-full" style={{width: "100%"}}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900">6 months</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div className="bg-gray-900 h-3 rounded-full" style={{width: "53%"}}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900">3.2 months</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Interview Success Rate</span>
                      <span className="text-xs text-gray-500">CareerTrail users</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">73%</div>
                    <p className="text-sm text-gray-600">vs 45% industry average</p>
                  </div>

                  <div className="bg-white rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Salary Increase</span>
                      <span className="text-xs text-gray-500">Average for CareerTrail users</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">+28%</div>
                    <p className="text-sm text-gray-600">Better job opportunities</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="py-24 bg-gradient-to-br from-yellow-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Real Stories, Real Results
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don&apos;t just take our word for it. Here&apos;s how CareerTrail is helping professionals 
              land their dream jobs and advance their careers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200/30">
              <div className="flex items-center mb-6">
                <div className="flex space-x-1 mr-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500">3 months ago</span>
              </div>
              
              <blockquote className="text-lg text-gray-900 mb-6 leading-relaxed">
                &ldquo;CareerTrail completely transformed my job search. The LinkedIn integration saved me hours, 
                and the contact tracking helped me build meaningful relationships. I landed my dream job 
                at Google within 3 months!&rdquo;
              </blockquote>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">SC</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Chen</div>
                  <div className="text-gray-600">Senior Software Engineer at Google</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl p-8 border border-pink-200/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="flex space-x-1 mr-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500">1 month ago</span>
              </div>
              
              <blockquote className="text-lg text-gray-900 mb-6 leading-relaxed">
                &ldquo;I was spending 10+ hours a week managing my job search. CareerTrail cut that down to 2 hours! 
                The automated follow-ups and interview prep tools are game-changers.&rdquo;
              </blockquote>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-semibold">MJ</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Michael Johnson</div>
                  <div className="text-pink-600">Product Manager at Microsoft</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join 10,000+ professionals who&apos;ve already transformed their job search with CareerTrail. 
            Start your journey to better opportunities today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="/signup"
              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:from-orange-600 hover:to-pink-600 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              🚀 Start Free Today
            </a>
            <a
              href="/signin"
              className="text-gray-700 hover:text-orange-600 px-8 py-4 rounded-2xl text-lg font-medium border-2 border-orange-200 hover:border-orange-300 transition-all duration-200 hover:bg-orange-50"
            >
              Sign In
            </a>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center text-sm text-gray-500">
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No credit card required
            </div>
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Free forever plan
            </div>
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cancel anytime
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3-3 3" />
                  </svg>
                </div>
                <span className="text-xl font-bold">CareerTrail</span>
              </div>
              <p className="text-gray-400">
                The all-in-one job search platform that helps you track applications, 
                manage documents, and land interviews with confidence.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Job Tracking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Document Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Tracker</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Interview Scheduler</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CareerTrail. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
