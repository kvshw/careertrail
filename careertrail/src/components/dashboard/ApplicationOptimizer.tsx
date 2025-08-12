'use client'

import { useState } from 'react'
import { ApplicationOptimizationResult } from '@/lib/ai-job-optimization'

interface ApplicationOptimizerProps {
  isOpen: boolean
  onClose: () => void
  initialContent?: string
  initialContentType?: 'resume' | 'cover_letter'
  jobDescription?: string
  documentId?: string
  userId?: string
  documentName?: string
}

export default function ApplicationOptimizer({
  isOpen,
  onClose,
  initialContent = '',
  initialContentType = 'resume',
  jobDescription = '',
  documentId,
  userId,
  documentName
}: ApplicationOptimizerProps) {
  const [currentContent, setCurrentContent] = useState(initialContent)
  const [contentType, setContentType] = useState<'resume' | 'cover_letter'>(initialContentType)
  const [jobDesc, setJobDesc] = useState(jobDescription)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [result, setResult] = useState<ApplicationOptimizationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showComparison, setShowComparison] = useState(false)

  const handleOptimize = async () => {
    if (!currentContent.trim() || !jobDesc.trim()) {
      setError('Please provide both your content and the job description')
      return
    }

    try {
      setError(null)
      setIsOptimizing(true)

      const response = await fetch('/api/ai/optimize-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: jobDesc,
          currentContent: currentContent,
          contentType: contentType,
          documentId,
          userId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to optimize application')
      }

      const optimizationResult = await response.json()
      setResult(optimizationResult)
    } catch (error) {
      // Don't show error if request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Optimization request was cancelled')
        setError(null)
        return
      }
      console.error('Optimization error:', error)
      setError(error instanceof Error ? error.message : 'Failed to optimize application')
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleCopyOptimized = () => {
    if (result?.optimizedContent) {
      navigator.clipboard.writeText(result.optimizedContent)
    }
  }

  const handleReplaceOriginal = () => {
    if (result?.optimizedContent) {
      setCurrentContent(result.optimizedContent)
      setResult(null)
      setShowComparison(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                🎯 AI Application Optimizer{documentName && ` - ${documentName}`}
                {result && (
                  <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    +{result.improvementPercentage.toFixed(1)}% improvement
                  </span>
                )}
              </h2>
              <p className="text-gray-600 mt-1">
                Optimize your {contentType} to perfectly match the job requirements
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Input Form */}
          {!result && (
            <div className="space-y-6">
              {/* Content Type Selection */}
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-3">
                  Content Type
                </label>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setContentType('resume')}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      contentType === 'resume'
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    📄 Resume/CV
                  </button>
                  <button
                    onClick={() => setContentType('cover_letter')}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      contentType === 'cover_letter'
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    ✉️ Cover Letter
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Content */}
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-3">
                    Your Current {contentType === 'resume' ? 'Resume' : 'Cover Letter'}
                  </label>
                  <textarea
                    value={currentContent}
                    onChange={(e) => setCurrentContent(e.target.value)}
                    placeholder={`Paste your current ${contentType === 'resume' ? 'resume' : 'cover letter'} content here...`}
                    className="w-full h-80 px-4 py-3 border-2 border-gray-300 rounded-xl text-base text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Job Description */}
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-3">
                    Target Job Description
                  </label>
                  <textarea
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    placeholder="Paste the complete job description here..."
                    className="w-full h-80 px-4 py-3 border-2 border-gray-300 rounded-xl text-base text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Optimize Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleOptimize}
                  disabled={isOptimizing || !currentContent.trim() || !jobDesc.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  {isOptimizing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Optimizing...
                    </div>
                  ) : (
                    '🚀 Optimize Application'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-6">
              {/* Improvement Summary */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎉 Optimization Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{result.originalScore}%</div>
                    <div className="text-sm text-gray-600">Original Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.optimizedScore}%</div>
                    <div className="text-sm text-gray-600">Optimized Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">+{result.improvementPercentage.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Improvement</div>
                  </div>
                </div>
              </div>

              {/* Keyword Analysis */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🔑 Keyword Matching</h4>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Before:</span> {result.keywordMatches.before} keywords → 
                  <span className="font-medium text-green-600"> After:</span> {result.keywordMatches.after} keywords
                  {result.keywordMatches.addedKeywords.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium">Added keywords:</span> {result.keywordMatches.addedKeywords.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Changes Summary */}
              {(result.changes.added.length > 0 || result.changes.modified.length > 0 || result.changes.removed.length > 0) && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">📝 Key Changes Made</h4>
                  {result.changes.added.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium text-green-600">Added:</span>
                      <ul className="list-disc list-inside ml-4 text-gray-700">
                        {result.changes.added.map((change, index) => (
                          <li key={index}>{change}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.changes.modified.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium text-blue-600">Modified:</span>
                      <ul className="list-disc list-inside ml-4 text-gray-700">
                        {result.changes.modified.map((change, index) => (
                          <li key={index}>{change}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.changes.removed.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium text-orange-600">Removed:</span>
                      <ul className="list-disc list-inside ml-4 text-gray-700">
                        {result.changes.removed.map((change, index) => (
                          <li key={index}>{change}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Reasoning */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">🧠 Optimization Strategy</h4>
                <p className="text-sm text-gray-700">{result.reasoning}</p>
              </div>

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">💡 Additional Recommendations</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {result.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  {showComparison ? 'Hide' : 'Show'} Comparison
                </button>
                <button
                  onClick={handleCopyOptimized}
                  className="px-6 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  📋 Copy Optimized Content
                </button>
                <button
                  onClick={handleReplaceOriginal}
                  className="px-6 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                >
                  ✅ Use This Version
                </button>
                <button
                  onClick={() => {
                    setResult(null)
                    setShowComparison(false)
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  🔄 Start Over
                </button>
              </div>

              {/* Comparison View */}
              {showComparison && (
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">📊 Before vs After Comparison</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Original ({result.originalScore}% match)</h5>
                      <div className="h-80 p-4 bg-red-50 border border-red-200 rounded-lg overflow-y-auto text-sm">
                        <pre className="whitespace-pre-wrap text-gray-700">{currentContent}</pre>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Optimized ({result.optimizedScore}% match)</h5>
                      <div className="h-80 p-4 bg-green-50 border border-green-200 rounded-lg overflow-y-auto text-sm">
                        <pre className="whitespace-pre-wrap text-gray-700">{result.optimizedContent}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
