import { NextRequest, NextResponse } from 'next/server'
import { AIDocumentAnalysisService, DocumentAnalysisRequest } from '@/lib/ai-document-analysis'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, documentType, targetRole, targetCompany, industry } = body

    if (!content || !documentType) {
      return NextResponse.json(
        { error: 'Content and document type are required' },
        { status: 400 }
      )
    }

    const analysisRequest: DocumentAnalysisRequest = {
      content,
      documentType,
      targetRole,
      targetCompany,
      industry
    }

    const analysis = await AIDocumentAnalysisService.analyzeDocument(analysisRequest)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error in analyze-document API:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 