import OpenAI from 'openai'

// Only create OpenAI client on server-side
const createOpenAIClient = () => {
  if (typeof window !== 'undefined') {
    // Client-side: return null
    return null
  }
  
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required')
  }
  
  return new OpenAI({
    apiKey,
  })
}

export interface DocumentAnalysisResult {
  score: number // 0-100
  category: 'resume' | 'cover_letter' | 'other'
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  keywordAnalysis: {
    found: string[]
    missing: string[]
    recommendations: string[]
  }
  atsOptimization: {
    score: number
    issues: string[]
    improvements: string[]
  }
  overallFeedback: string
  actionItems: string[]
}

export interface DocumentAnalysisRequest {
  content: string
  documentType: 'resume' | 'cover_letter' | 'other'
  targetRole?: string
  targetCompany?: string
  industry?: string
}

export class AIDocumentAnalysisService {
  private static getAnalysisPrompt(request: DocumentAnalysisRequest): string {
    const { content, documentType, targetRole, targetCompany, industry } = request
    
    const basePrompt = `You are an expert career coach and HR professional with deep knowledge of current hiring trends, ATS (Applicant Tracking System) optimization, and modern recruitment practices. Analyze the following ${documentType} and provide comprehensive feedback.

Current Date: ${new Date().toISOString().split('T')[0]}

Latest Industry Trends to Consider:
- AI-powered ATS systems are increasingly sophisticated
- Keywords and skills matching is crucial for passing initial screening
- Quantifiable achievements are preferred over generic statements
- Remote work experience and digital skills are highly valued
- Soft skills like adaptability and collaboration are increasingly important
- Industry-specific certifications and continuous learning are valued
- Personal branding and online presence matter more than ever

Document Content:
${content}

${targetRole ? `Target Role: ${targetRole}` : ''}
${targetCompany ? `Target Company: ${targetCompany}` : ''}
${industry ? `Industry: ${industry}` : ''}

Please provide a comprehensive analysis in the following JSON format:

{
  "score": number (0-100),
  "category": "${documentType}",
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "keywordAnalysis": {
    "found": ["keyword1", "keyword2", ...],
    "missing": ["missing_keyword1", "missing_keyword2", ...],
    "recommendations": ["recommendation1", "recommendation2", ...]
  },
  "atsOptimization": {
    "score": number (0-100),
    "issues": ["issue1", "issue2", ...],
    "improvements": ["improvement1", "improvement2", ...]
  },
  "overallFeedback": "comprehensive feedback paragraph",
  "actionItems": ["action1", "action2", "action3"]
}

Focus on:
1. ATS compatibility and keyword optimization
2. Modern formatting and structure
3. Quantifiable achievements and metrics
4. Industry-specific best practices
5. Current hiring trends and expectations
6. Specific, actionable improvements

Be specific, constructive, and provide actionable advice based on 2024 hiring standards.`

    return basePrompt
  }

  static async analyzeDocument(request: DocumentAnalysisRequest): Promise<DocumentAnalysisResult> {
    try {
      const prompt = this.getAnalysisPrompt(request)
      
      const openai = createOpenAIClient()
      if (!openai) {
        throw new Error('OpenAI client not available on client-side')
      }
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert career coach and HR professional. Provide detailed, actionable feedback for job application documents. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        // Ask API to return strict JSON when supported
        response_format: { type: 'json_object' } as any,
        temperature: 0.3,
        max_tokens: 2000,
      })

      const response = completion.choices[0]?.message?.content
      
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      // Parse the JSON response (robust to occasional code fences)
      const sanitize = (raw: string): string => {
        let text = raw.trim()
        // Remove Markdown fences like ```json ... ``` or ``` ... ```
        if (text.startsWith('```')) {
          text = text.replace(/^```[a-zA-Z]*\n?/,'').replace(/```\s*$/,'').trim()
        }
        // If still not pure JSON, try to extract the first {...} block
        if (!text.startsWith('{')) {
          const start = text.indexOf('{')
          const end = text.lastIndexOf('}')
          if (start !== -1 && end !== -1 && end > start) {
            text = text.slice(start, end + 1)
          }
        }
        return text
      }

      const cleaned = sanitize(response)
      const analysis = JSON.parse(cleaned) as DocumentAnalysisResult
      
      return analysis
    } catch (error) {
      console.error('Error analyzing document:', error)
      throw new Error('Failed to analyze document. Please try again.')
    }
  }

  static async extractTextFromDocument(file: File): Promise<string> {
    // Thin wrapper to keep existing imports stable; logic moved to client-only module
    const { extractTextFromDocument } = await import('./document-text-extraction')
    return extractTextFromDocument(file)
  }

  static getDocumentTypeFromFilename(filename: string): 'resume' | 'cover_letter' | 'other' {
    const lowerFilename = filename.toLowerCase()
    
    if (lowerFilename.includes('resume') || lowerFilename.includes('cv')) {
      return 'resume'
    }
    
    if (lowerFilename.includes('cover') || lowerFilename.includes('letter')) {
      return 'cover_letter'
    }
    
    return 'other'
  }

  static getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  static getScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }
} 