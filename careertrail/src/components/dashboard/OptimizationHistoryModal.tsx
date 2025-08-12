'use client'

import { useState, useEffect } from 'react'
import { DocumentOptimizationRecord } from '@/lib/supabase'
import { DocumentOptimizationService } from '@/lib/document-optimizations'
import { formatDistanceToNow } from 'date-fns'

interface OptimizationHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  documentId: string
  documentName: string
}

export default function OptimizationHistoryModal({
  isOpen,
  onClose,
  documentId,
  documentName
}: OptimizationHistoryModalProps) {
  const [optimizations, setOptimizations] = useState<DocumentOptimizationRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedOptimization, setSelectedOptimization] = useState<DocumentOptimizationRecord | null>(null)

  useEffect(() => {
    if (isOpen && documentId) {
      fetchOptimizations()
    }
  }, [isOpen, documentId])

  const fetchOptimizations = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await DocumentOptimizationService.getOptimizations(documentId)
      setOptimizations(data)
    } catch (err) {
      setError('Failed to load optimization history')
      console.error('Error fetching optimizations:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                📈 Optimization History - {documentName}
              </h2>
              <p className="text-gray-600 mt-1">
                View previous AI optimizations for this document
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Optimization List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Optimization Sessions ({optimizations.length})
              </h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600 mt-2">Loading optimizations...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">
                  <p>{error}</p>
                </div>
              ) : optimizations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No optimizations yet</p>
                  <p className="text-sm">Use the AI Optimizer to create your first optimization</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {optimizations.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedOptimization(opt)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedOptimization?.id === opt.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {formatDistanceToNow(new Date(opt.created_at), { addSuffix: true })}
                      </div>
                      <div className="text-xs text-gray-600 line-clamp-2">
                        {opt.job_description.substring(0, 100)}...
                      </div>
                      {opt.optimization_result?.improvementPercentage && (
                        <div className="text-xs text-green-600 mt-1">
                          +{opt.optimization_result.improvementPercentage.toFixed(1)}% improvement
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Optimization Details */}
          <div className="flex-1 overflow-y-auto">
            {selectedOptimization ? (
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Optimization Results
                    </h3>
                    <div className="text-sm text-gray-500">
                      {new Date(selectedOptimization.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {selectedOptimization.optimization_result?.improvementPercentage && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <div className="text-green-600 font-semibold text-lg">
                          +{selectedOptimization.optimization_result.improvementPercentage.toFixed(1)}% improvement
                        </div>
                        <div className="ml-2 text-green-600 text-sm">
                          detected by AI analysis
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Job Description */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Job Description</h4>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 max-h-40 overflow-y-auto">
                    {selectedOptimization.job_description}
                  </div>
                </div>

                {/* Optimized Content */}
                {selectedOptimization.optimization_result?.optimizedContent && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Optimized Content</h4>
                    <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700 max-h-60 overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-sans">
                        {selectedOptimization.optimization_result.optimizedContent}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Key Improvements */}
                {selectedOptimization.optimization_result?.keyImprovements && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Key Improvements</h4>
                    <div className="space-y-2">
                      {selectedOptimization.optimization_result.keyImprovements.map((improvement: string, index: number) => (
                        <div key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <div className="text-sm text-gray-700">{improvement}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keywords Added */}
                {selectedOptimization.optimization_result?.keywordsAdded && selectedOptimization.optimization_result.keywordsAdded.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Keywords Added</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedOptimization.optimization_result.keywordsAdded.map((keyword: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matching Strategy */}
                {selectedOptimization.optimization_result?.matchingStrategy && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Matching Strategy</h4>
                    <div className="text-sm text-gray-700 bg-yellow-50 rounded-lg p-4">
                      {selectedOptimization.optimization_result.matchingStrategy}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Select an optimization to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

