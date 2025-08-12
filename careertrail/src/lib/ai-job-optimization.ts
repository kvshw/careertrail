import OpenAI from 'openai'

// Only create OpenAI client on server-side
const createOpenAIClient = () => {
  if (typeof window !== 'undefined') {
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

export interface JobAnalysisResult {
  title: string
  company: string
  keyRequirements: string[]
  preferredSkills: string[]
  experience: string
  education: string[]
  keywords: string[]
  companyValues: string[]
  culture: string
  jobType: 'remote' | 'hybrid' | 'onsite' | 'unknown'
  matchingStrategy: string
}

export interface ApplicationOptimizationResult {
  originalScore: number
  optimizedScore: number
  improvementPercentage: number
  optimizedContent: string
  changes: {
    added: string[]
    removed: string[]
    modified: string[]
  }
  keywordMatches: {
    before: number
    after: number
    addedKeywords: string[]
  }
  recommendations: string[]
  reasoning: string
}

export interface OptimizationRequest {
  jobDescription: string
  currentContent: string
  contentType: 'resume' | 'cover_letter'
  targetRole?: string
  targetCompany?: string
}

export class AIJobOptimizationService {
  
  static async analyzeJobDescription(jobDescription: string): Promise<JobAnalysisResult> {
    const client = createOpenAIClient()
    if (!client) {
      throw new Error('OpenAI client not available on client-side')
    }

    const prompt = `
Analyze this job description and extract key information for application optimization:

Job Description:
${jobDescription}

Please analyze and return a JSON object with the following structure:
{
  "title": "job title",
  "company": "company name",
  "keyRequirements": ["list", "of", "must-have", "requirements"],
  "preferredSkills": ["list", "of", "nice-to-have", "skills"],
  "experience": "experience level required",
  "education": ["education", "requirements"],
  "keywords": ["important", "technical", "keywords", "to", "match"],
  "companyValues": ["company", "values", "mentioned"],
  "culture": "company culture description",
  "jobType": "remote|hybrid|onsite|unknown",
  "matchingStrategy": "specific advice for tailoring applications to this role"
}

Focus on extracting actionable information that can be used to optimize resumes and cover letters.
Be thorough but concise.
`

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert recruiter and career coach. Analyze job descriptions to extract key optimization insights for job applications. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 2000
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      // Strip markdown code fences if present
      const cleanedContent = content.replace(/```json\n?/, '').replace(/\n?```/, '')
      
      return JSON.parse(cleanedContent) as JobAnalysisResult
    } catch (error) {
      console.error('Job analysis error:', error)
      throw error
    }
  }

  static async optimizeApplication(request: OptimizationRequest): Promise<ApplicationOptimizationResult> {
    const client = createOpenAIClient()
    if (!client) {
      throw new Error('OpenAI client not available on client-side')
    }

    // First analyze the job
    const jobAnalysis = await this.analyzeJobDescription(request.jobDescription)

    const prompt = `
You are an expert resume/cover letter optimizer. Your task is to optimize the following ${request.contentType} for a specific job while maintaining authenticity and truthfulness.

TARGET JOB ANALYSIS:
- Title: ${jobAnalysis.title}
- Company: ${jobAnalysis.company}
- Key Requirements: ${jobAnalysis.keyRequirements.join(', ')}
- Preferred Skills: ${jobAnalysis.preferredSkills.join(', ')}
- Important Keywords: ${jobAnalysis.keywords.join(', ')}
- Company Values: ${jobAnalysis.companyValues.join(', ')}
- Matching Strategy: ${jobAnalysis.matchingStrategy}

CURRENT ${request.contentType.toUpperCase()}:
${request.currentContent}

OPTIMIZATION RULES:
1. NEVER add false information or skills the person doesn't have
2. Reorder and emphasize existing relevant experience
3. Use keywords from the job description naturally
4. Align language with company values and culture
5. Quantify achievements where possible
6. Improve formatting and clarity
7. Remove or de-emphasize less relevant content

Please return a JSON object with this structure:
{
  "originalScore": 75,
  "optimizedScore": 92,
  "improvementPercentage": 22.7,
  "optimizedContent": "the fully optimized ${request.contentType} content",
  "changes": {
    "added": ["list of sections/points added"],
    "removed": ["list of sections/points removed"],
    "modified": ["list of sections/points modified"]
  },
  "keywordMatches": {
    "before": 5,
    "after": 12,
    "addedKeywords": ["keywords", "now", "included"]
  },
  "recommendations": ["additional suggestions for improvement"],
  "reasoning": "explanation of the optimization strategy and key changes made"
}

Ensure the optimized content maintains the person's authentic voice while maximizing job match potential.
`

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert career coach specializing in ${request.contentType} optimization. You help job seekers improve their applications without adding false information. Always return valid JSON.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
        max_tokens: 4000
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      // Strip markdown code fences if present
      const cleanedContent = content.replace(/```json\n?/, '').replace(/\n?```/, '')
      
      return JSON.parse(cleanedContent) as ApplicationOptimizationResult
    } catch (error) {
      console.error('Application optimization error:', error)
      throw error
    }
  }

  static async quickOptimizationScore(content: string, jobKeywords: string[]): Promise<number> {
    // Quick local calculation for immediate feedback
    const contentLower = content.toLowerCase()
    const matchedKeywords = jobKeywords.filter(keyword => 
      contentLower.includes(keyword.toLowerCase())
    )
    
    const baseScore = Math.min((matchedKeywords.length / jobKeywords.length) * 100, 100)
    const lengthScore = content.length > 500 ? 100 : (content.length / 500) * 100
    const avgScore = (baseScore + lengthScore) / 2
    
    return Math.round(avgScore)
  }
}


