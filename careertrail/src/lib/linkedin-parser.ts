// LinkedIn Job URL Parser Service
// This service extracts job details from LinkedIn job URLs

export interface LinkedInJobData {
  company: string
  role: string
  location?: string
  description?: string
  jobUrl: string
  jobId: string
}

export class LinkedInJobParser {
  /**
   * Extract job ID from LinkedIn job URL
   * Example: https://www.linkedin.com/jobs/view/4257191625 -> 4257191625
   */
  static extractJobId(url: string): string | null {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const jobIndex = pathParts.findIndex(part => part === 'view')
      
      if (jobIndex !== -1 && jobIndex + 1 < pathParts.length) {
        return pathParts[jobIndex + 1]
      }
      
      return null
    } catch (error) {
      console.error('Error extracting job ID:', error)
      return null
    }
  }

  /**
   * Validate if the URL is a LinkedIn job URL
   */
  static isValidLinkedInJobUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname === 'www.linkedin.com' && 
             urlObj.pathname.includes('/jobs/view/')
    } catch (error) {
      return false
    }
  }

  /**
   * Parse LinkedIn job URL and extract basic information
   * Note: Due to LinkedIn's structure, we can only extract limited info from the URL itself
   * For full job details, we would need to scrape the page (which requires backend implementation)
   */
  static parseJobUrl(url: string): Partial<LinkedInJobData> | null {
    if (!this.isValidLinkedInJobUrl(url)) {
      return null
    }

    const jobId = this.extractJobId(url)
    if (!jobId) {
      return null
    }

    return {
      jobUrl: url,
      jobId: jobId
    }
  }

  /**
   * Extract job details from LinkedIn job page using our API
   */
  static async fetchJobDetails(url: string): Promise<LinkedInJobData | null> {
    try {
      const response = await fetch('/api/linkedin-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch job details')
      }

      // Return the scraped job data
      return data.data
    } catch (error) {
      console.error('Error fetching job details:', error)
      return null
    }
  }

  /**
   * Get a formatted job title from LinkedIn URL
   * This extracts the job title from the URL path when available
   */
  static extractJobTitleFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      
      // LinkedIn job URLs sometimes have the job title in the path
      // Example: /jobs/view/4257191625/senior-front-end-developer
      const jobIdIndex = pathParts.findIndex(part => part === 'view')
      
      if (jobIdIndex !== -1 && jobIdIndex + 2 < pathParts.length) {
        const jobTitle = pathParts[jobIdIndex + 2]
        if (jobTitle && jobTitle !== 'jobs' && jobTitle !== 'view') {
          // Decode URL encoding and replace hyphens with spaces
          const decodedTitle = decodeURIComponent(jobTitle).replace(/-/g, ' ')
          // Only return if it looks like a job title (not just numbers or short strings)
          if (decodedTitle.length > 3 && !/^\d+$/.test(decodedTitle)) {
            return decodedTitle
          }
        }
      }
      
      return null
    } catch (error) {
      console.error('Error extracting job title from URL:', error)
      return null
    }
  }

  /**
   * Extract company name from LinkedIn URL when available
   */
  static extractCompanyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      
      // Look for company name in different URL patterns
      // Pattern 1: /company/company-name/jobs/view/...
      const companyIndex = pathParts.findIndex(part => part === 'company')
      if (companyIndex !== -1 && companyIndex + 1 < pathParts.length) {
        const company = pathParts[companyIndex + 1]
        if (company && company !== 'jobs' && company !== 'view') {
          return decodeURIComponent(company).replace(/-/g, ' ')
        }
      }
      
      // Pattern 2: /jobs/view/.../company-name
      const jobsIndex = pathParts.findIndex(part => part === 'jobs')
      if (jobsIndex !== -1) {
        // Look for potential company name after the job ID
        for (let i = jobsIndex + 3; i < pathParts.length; i++) {
          const part = pathParts[i]
          if (part && part !== 'jobs' && part !== 'view' && !/^\d+$/.test(part)) {
            const decoded = decodeURIComponent(part).replace(/-/g, ' ')
            if (decoded.length > 2) {
              return decoded
            }
          }
        }
      }
      
      return null
    } catch (error) {
      console.error('Error extracting company from URL:', error)
      return null
    }
  }

  /**
   * Enhanced parsing that attempts to extract more information from LinkedIn URLs
   */
  static parseLinkedInJobUrl(url: string): { jobTitle?: string; company?: string; location?: string } {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      
      let jobTitle: string | undefined
      let company: string | undefined
      let location: string | undefined
      
      // Extract job title
      jobTitle = this.extractJobTitleFromUrl(url) || undefined
      
      // Extract company name
      company = this.extractCompanyFromUrl(url) || undefined
      
      // Try to extract location from URL or search params
      const searchParams = urlObj.searchParams
      const locationParam = searchParams.get('location') || searchParams.get('city')
      if (locationParam) {
        location = decodeURIComponent(locationParam)
      }
      
      // If we couldn't extract from URL, try to infer from the path structure
      if (!company) {
        // Look for patterns like /company/company-name/ or /jobs/company-name/
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i]
          const nextPart = pathParts[i + 1]
          
          if ((part === 'company' || part === 'jobs') && nextPart && 
              nextPart !== 'view' && nextPart !== 'jobs' && !/^\d+$/.test(nextPart)) {
            company = decodeURIComponent(nextPart).replace(/-/g, ' ')
            break
          }
        }
      }
      
      return { jobTitle, company, location }
    } catch (error) {
      console.error('Error parsing LinkedIn job URL:', error)
      return {}
    }
  }
} 