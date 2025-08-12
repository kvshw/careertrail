'use client'

import { useState, useRef, useEffect } from 'react'
import { DocumentAnalysisResult, AIDocumentAnalysisService } from '@/lib/ai-document-analysis'
import { Job } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { fetchWithTimeout, clipboardUtils } from '@/lib/error-handling'

interface AIDocumentAnalysisProps {
  jobs: Job[]
  onClose: () => void
  initialContent?: string
  initialDocumentType?: 'resume' | 'cover_letter' | 'other'
  autoAnalyze?: boolean
  documentId?: string
  userId?: string
  initialAnalysis?: DocumentAnalysisResult
}

export default function AIDocumentAnalysis({ jobs, onClose, initialContent, initialDocumentType, autoAnalyze, documentId, userId, initialAnalysis }: AIDocumentAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<DocumentAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [documentContent, setDocumentContent] = useState('')
  const [documentType, setDocumentType] = useState<'resume' | 'cover_letter' | 'other'>('resume')
  const [targetRole, setTargetRole] = useState('')
  const [targetCompany, setTargetCompany] = useState('')
  const [industry, setIndustry] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setError(null)
      setIsAnalyzing(true)
      
      // Extract text from file
      const text = await AIDocumentAnalysisService.extractTextFromDocument(file)
      setDocumentContent(text)
      
      // Auto-detect document type from filename
      const detectedType = AIDocumentAnalysisService.getDocumentTypeFromFilename(file.name)
      setDocumentType(detectedType)
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process file')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAnalyze = async () => {
    // Check both current state and initial content
    const contentToAnalyze = documentContent || initialContent || ''
    if (!contentToAnalyze.trim()) {
      setError('Please provide document content')
      return
    }

    // Prevent analysis of non-resume/cover letter documents
    if (documentType === 'other') {
      setError('❌ Document Type Not Supported\n\nThis document is marked as "Other" which is not a resume or cover letter. Our AI analysis is specifically designed for resumes and cover letters only.\n\nPlease:\n• Select "Resume/CV" if this is a resume\n• Select "Cover Letter" if this is a cover letter\n• Use a different tool for other document types')
      return
    }

    try {
      setError(null)
      setIsAnalyzing(true)
      
      // Create abort controller for this request
      const controller = new AbortController()
      setAbortController(controller)

      const response = await fetchWithTimeout('/api/ai/analyze-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        timeout: 60000, // 60 second timeout for AI analysis
        body: JSON.stringify({
          content: contentToAnalyze,
          documentType,
          targetRole: targetRole || undefined,
          targetCompany: targetCompany || undefined,
          industry: industry || undefined,
          documentId,
          userId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze document')
      }

      const result = await response.json()
      setAnalysis(result)
    } catch (error) {
      // Don't show error if request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Analysis request was cancelled')
        setError(null)
        return
      }
      console.error('Analysis error:', error)
      setError(error instanceof Error ? error.message : 'Failed to analyze document')
    } finally {
      setIsAnalyzing(false)
      setAbortController(null)
    }
  }

  const handlePasteContent = async () => {
    try {
      const text = await clipboardUtils.readText()
      setDocumentContent(text)
      setError(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to read clipboard. Please paste manually.')
    }
  }

  // Prefill content and optionally auto-analyze when opened from upload or existing document
  useEffect(() => {
    if (initialAnalysis && initialDocumentType !== 'other') {
      setAnalysis(initialAnalysis)
    }
    if (initialContent) {
      setDocumentContent(initialContent)
      // Clear any existing errors when content is provided
      setError(null)
    }
    if (initialDocumentType) {
      setDocumentType(initialDocumentType)
    }
  }, [initialContent, initialDocumentType, initialAnalysis])

  useEffect(() => {
    if (autoAnalyze && !initialAnalysis && (initialContent || '').trim() && (initialDocumentType !== 'other')) {
      // defer to ensure state applied
      const t = setTimeout(() => {
        handleAnalyze()
      }, 0)
      return () => clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAnalyze, initialContent, initialAnalysis, initialDocumentType])

  // Cleanup on unmount to prevent runtime.lastError
  useEffect(() => {
    return () => {
      if (abortController) {
        console.log('Cleaning up AbortController on unmount')
        abortController.abort()
      }
    }
  }, [abortController])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">🤖 AI Document Analysis</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-800 mt-2">
            Get AI-powered feedback on your documents with current best practices and tips
          </p>
        </div>

        <div className="p-6">
          {!analysis ? (
            <div className="space-y-6">
              {/* Document Type Selection */}
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-3">
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => {
                    const newType = e.target.value as any
                    setDocumentType(newType)
                    // Clear analysis and stop analyzing if switching to "other" type
                    if (newType === 'other') {
                      setAnalysis(null)
                      setError(null)
                      setIsAnalyzing(false) // Stop any ongoing analysis
                      // Abort any ongoing API request
                      if (abortController) {
                        abortController.abort()
                        setAbortController(null)
                      }
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base text-gray-900 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="resume">📄 Resume/CV</option>
                  <option value="cover_letter">✉️ Cover Letter</option>
                  <option value="other">📋 Other Document</option>
                </select>
                {documentType === 'other' && (
                  <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-700 text-sm">
                      ⚠️ <strong>Note:</strong> AI analysis is only available for resumes and cover letters. Please select the correct document type above if this is a resume or cover letter.
                    </p>
                  </div>
                )}
              </div>

              {/* Target Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-3">
                    Target Role (Optional)
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g., Software Engineer"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-3">
                    Target Company (Optional)
                  </label>
                  <input
                    type="text"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    placeholder="e.g., Google"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-3">
                    Industry (Optional)
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g., Technology"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Document Content Input */}
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-3">
                  Document Content
                </label>
                {/* Only show upload/paste interface if no initial content */}
                {!initialContent && (
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        📁 Upload File
                      </button>
                      <button
                        onClick={handlePasteContent}
                        className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm"
                      >
                        📋 Paste from Clipboard
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.doc,.docx,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <textarea
                      value={documentContent}
                      onChange={(e) => setDocumentContent(e.target.value)}
                      placeholder="Paste your document content here or upload a file..."
                      className="w-full h-64 px-4 py-3 border border-gray-300 rounded-xl text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                )}
                
                {/* Show content preview if initial content is provided */}
                {initialContent && (
                  <div className="bg-gray-50 border border-gray-300 rounded-xl p-4 max-h-48 overflow-y-auto">
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {documentContent.length > 500 
                        ? `${documentContent.substring(0, 500)}...` 
                        : documentContent
                      }
                    </p>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        Document loaded from uploaded file • {documentContent.length} characters
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm whitespace-pre-line">{error}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !(documentContent || initialContent || '').trim() || documentType === 'other'}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    '🤖 Analyze Document'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Analysis Results */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Overall Score */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Score</h3>
                    <div className="text-center">
                      <div className={cn(
                        "text-4xl font-bold mb-2",
                        AIDocumentAnalysisService.getScoreColor(analysis.score)
                      )}>
                        {analysis.score}/100
                      </div>
                      <div className={cn(
                        "text-lg font-medium",
                        AIDocumentAnalysisService.getScoreColor(analysis.score)
                      )}>
                        {AIDocumentAnalysisService.getScoreLabel(analysis.score)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ATS Score */}
                <div className="lg:col-span-2">
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">ATS Optimization</h3>
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "text-3xl font-bold",
                        AIDocumentAnalysisService.getScoreColor(analysis.atsOptimization.score)
                      )}>
                        {analysis.atsOptimization.score}/100
                      </div>
                      <div>
                        <p className="text-sm text-gray-800 font-medium">ATS Compatibility Score</p>
                        <p className="text-xs text-gray-700">How well your document will pass through Applicant Tracking Systems</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths and Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">✅ Strengths</h3>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="text-green-700 text-sm flex items-start">
                        <span className="mr-2">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-50 p-6 rounded-2xl border border-red-200">
                  <h3 className="text-lg font-semibold text-red-800 mb-4">⚠️ Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-red-700 text-sm flex items-start">
                        <span className="mr-2">•</span>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Keyword Analysis */}
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">🔍 Keyword Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2">Found Keywords</h4>
                    <div className="flex flex-wrap gap-1">
                      {analysis.keywordAnalysis.found.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-1">
                      {analysis.keywordAnalysis.missing.map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2">Recommendations</h4>
                    <ul className="space-y-1">
                      {analysis.keywordAnalysis.recommendations.map((rec, index) => (
                        <li key={index} className="text-blue-800 text-sm">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-purple-50 p-6 rounded-2xl border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-800 mb-4">💡 Suggestions</h3>
                <ul className="space-y-2">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-purple-700 text-sm flex items-start">
                      <span className="mr-2">💡</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Items */}
              <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200">
                <h3 className="text-lg font-semibold text-orange-800 mb-4">🎯 Action Items</h3>
                <ul className="space-y-2">
                  {analysis.actionItems.map((action, index) => (
                    <li key={index} className="text-orange-700 text-sm flex items-start">
                      <span className="mr-2">🎯</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Overall Feedback */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Overall Feedback</h3>
                <p className="text-gray-900 text-base leading-relaxed">{analysis.overallFeedback}</p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setAnalysis(null)
                    setDocumentContent('')
                    setError(null)
                  }}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Analyze Another Document
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 