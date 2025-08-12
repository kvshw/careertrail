import { NextRequest, NextResponse } from 'next/server'
import { AIJobOptimizationService } from '@/lib/ai-job-optimization'
import { DocumentOptimizationService } from '@/lib/document-optimizations'

export async function POST(request: NextRequest) {
  try {
    const { 
      jobDescription, 
      currentContent, 
      contentType, 
      targetRole, 
      targetCompany,
      userId,
      documentId
    } = await request.json()

    if (!jobDescription || !currentContent || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: jobDescription, currentContent, contentType' },
        { status: 400 }
      )
    }

    if (!['resume', 'cover_letter'].includes(contentType)) {
      return NextResponse.json(
        { error: 'contentType must be either "resume" or "cover_letter"' },
        { status: 400 }
      )
    }

    // Create the optimization request
    const optimizationRequest = {
      jobDescription,
      currentContent,
      contentType,
      targetRole,
      targetCompany
    }

    const result = await AIJobOptimizationService.optimizeApplication(optimizationRequest)

    // Save the optimization result if userId and documentId are provided
    if (userId && documentId) {
      try {
        await DocumentOptimizationService.saveOptimization(
          userId,
          documentId,
          jobDescription,
          result
        )
      } catch (saveError) {
        console.error('Failed to save optimization:', saveError)
        // Don't fail the request if saving fails, just log it
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Optimization API error:', error)
    return NextResponse.json(
      { error: 'Failed to optimize application' },
      { status: 500 }
    )
  }
}
