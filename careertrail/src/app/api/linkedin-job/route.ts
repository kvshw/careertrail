import { NextRequest, NextResponse } from 'next/server'
import * as puppeteer from 'puppeteer'

interface LinkedInJobData {
  company: string
  role: string
  location: string
  description: string
  jobUrl: string
  jobId: string
  salary: string
  jobType: string
  experienceLevel: string
  postedDate: string
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const jobId = extractJobIdFromUrl(url)
    if (!jobId) {
      return NextResponse.json({ error: 'Invalid LinkedIn job URL' }, { status: 400 })
    }
    
    console.log('Starting AI-powered extraction for job ID:', jobId)
    
    // Try AI-powered extraction with advanced techniques
    const jobData = await extractWithAIPoweredTechniques(url, jobId)
    console.log('Final extracted data:', jobData)
    
    return NextResponse.json(jobData)
  } catch (error: any) {
    console.error('Error fetching job details:', error)
    return NextResponse.json({ error: `Failed to fetch job details: ${error.message}` }, { status: 500 })
  }
}

function extractJobIdFromUrl(url: string): string | null {
  const match = url.match(/linkedin\.com\/jobs\/view\/(\d+)/)
  return match ? match[1] : null
}

async function extractWithAIPoweredTechniques(url: string, jobId: string): Promise<LinkedInJobData> {
  // Strategy 1: AI-Powered Puppeteer with Advanced Stealth
  try {
    console.log('Strategy 1: AI-Powered Puppeteer with advanced stealth...')
    const puppeteerData = await extractWithAIPoweredPuppeteer(url, jobId)
    if (puppeteerData.company && puppeteerData.role) {
      console.log('AI-Powered Puppeteer extraction successful!')
      return puppeteerData
    }
  } catch (error) {
    console.log('AI-Powered Puppeteer strategy failed:', error)
  }

  // Strategy 2: AI-Enhanced Fetch with Dynamic Headers
  try {
    console.log('Strategy 2: AI-Enhanced fetch with dynamic headers...')
    const fetchData = await extractWithAIEnhancedFetch(url, jobId)
    if (fetchData.company && fetchData.role) {
      console.log('AI-Enhanced fetch extraction successful!')
      return fetchData
    }
  } catch (error) {
    console.log('AI-Enhanced fetch strategy failed:', error)
  }

  // Strategy 3: AI-Powered Mobile API with Smart Parsing
  try {
    console.log('Strategy 3: AI-Powered mobile API extraction...')
    const mobileData = await extractWithAIPoweredMobileAPI(url, jobId)
    if (mobileData.company && mobileData.role) {
      console.log('AI-Powered mobile API extraction successful!')
      return mobileData
    }
  } catch (error) {
    console.log('AI-Powered mobile API strategy failed:', error)
  }

  // Strategy 4: AI-Enhanced JSON-LD with Fallback Parsing
  try {
    console.log('Strategy 4: AI-Enhanced JSON-LD extraction...')
    const jsonLdData = await extractWithAIEnhancedJsonLd(url, jobId)
    if (jsonLdData.company && jsonLdData.role) {
      console.log('AI-Enhanced JSON-LD extraction successful!')
      return jsonLdData
    }
  } catch (error) {
    console.log('AI-Enhanced JSON-LD strategy failed:', error)
  }

  // Strategy 5: AI-Powered Alternative Endpoints
  try {
    console.log('Strategy 5: AI-Powered alternative endpoints...')
    const altData = await extractWithAIAlternativeEndpoints(url, jobId)
    if (altData.company && altData.role) {
      console.log('AI-Powered alternative endpoints extraction successful!')
      return altData
    }
  } catch (error) {
    console.log('AI-Powered alternative endpoints strategy failed:', error)
  }

  // Fallback: AI-Enhanced URL parsing with job title extraction
  console.log('All AI strategies failed, using AI-enhanced URL parsing...')
  return extractWithAIEnhancedURLParsing(url, jobId)
}

async function extractWithAIPoweredPuppeteer(url: string, jobId: string): Promise<LinkedInJobData> {
  let browser: puppeteer.Browser | null = null
  try {
    // Launch with AI-optimized stealth settings
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-blink-features=AutomationControlled',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images',
        '--disable-javascript',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-pings',
        '--no-zygote',
        '--single-process',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-client-side-phishing-detection',
        '--disable-component-extensions-with-background-pages',
        '--disable-default-apps',
        '--disable-domain-reliability',
        '--disable-features=AudioServiceOutOfProcess',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-prompt-on-repost',
        '--disable-renderer-backgrounding',
        '--disable-sync',
        '--force-color-profile=srgb',
        '--metrics-recording-only',
        '--no-first-run',
        '--password-store=basic',
        '--use-mock-keychain',
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    })

    const page = await browser.newPage()
    
    // AI-Enhanced stealth settings
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    await page.setViewport({ width: 1920, height: 1080 })
    
    // AI-Generated dynamic headers
    const dynamicHeaders = generateAIDynamicHeaders()
    await page.setExtraHTTPHeaders(dynamicHeaders)

    // AI-Enhanced navigation with smart retry
    let navigationSuccess = false
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        console.log(`AI-Powered navigation attempt ${attempt}...`)
        
        // AI-Generated random delays
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000))
        
        await page.goto(url, { 
          waitUntil: 'networkidle2',
          timeout: 30000 
        })
        
        // AI-Enhanced content waiting
        await page.waitForFunction(() => {
          return document.body && document.body.innerHTML.length > 1000
        }, { timeout: 10000 })
        
        navigationSuccess = true
        break
      } catch (error) {
        console.log(`AI-Powered navigation attempt ${attempt} failed:`, error)
        if (attempt === 5) throw error
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }

    if (!navigationSuccess) {
      throw new Error('AI-Powered navigation failed after all attempts')
    }

    // AI-Enhanced content extraction
    const jobData = await page.evaluate(() => {
      // AI-Generated comprehensive selectors
      const aiSelectors = {
        company: [
          '.job-details-jobs-unified-top-card__company-name a',
          '.job-details-jobs-unified-top-card__company-name',
          '[data-test-id="company-name"]',
          '.job-details-jobs-unified-top-card__job-title-container .job-details-jobs-unified-top-card__company-name',
          '.job-details-jobs-unified-top-card__company-name-container a',
          '.job-details-jobs-unified-top-card__company-name-container',
          '[class*="company"][class*="name"]',
          '[class*="company-name"]',
          '.job-details-jobs-unified-top-card__company-name-container *',
          'a[data-test-id="company-name"]',
          '.job-details-jobs-unified-top-card__company-name span',
          '.job-details-jobs-unified-top-card__company-name div',
          '[data-test-id="company-name"]',
          '.job-details-jobs-unified-top-card__company-name-container span',
          '.job-details-jobs-unified-top-card__company-name-container div',
          '.job-details-jobs-unified-top-card__company-name-container a',
          '.job-details-jobs-unified-top-card__company-name-container *',
          '[class*="company"]',
          '[class*="organization"]',
          '[class*="employer"]'
        ],
        title: [
          '[data-test-id="job-title"]',
          '.job-details-jobs-unified-top-card__job-title',
          'h1',
          '.job-details-jobs-unified-top-card__job-title-container h1',
          '.job-details-jobs-unified-top-card__job-title-container .job-details-jobs-unified-top-card__job-title',
          '[class*="job-title"]',
          '[class*="title"] h1',
          '[class*="title"] h2',
          '[class*="position"]',
          '[class*="role"]',
          'h1[class*="title"]',
          'h2[class*="title"]',
          '.job-details-jobs-unified-top-card__job-title-container *',
          '[data-test-id="job-title"] *'
        ],
        location: [
          '[data-test-id="job-location"]',
          '.job-details-jobs-unified-top-card__job-location',
          '.job-details-jobs-unified-top-card__job-title-container .job-details-jobs-unified-top-card__job-location',
          '[class*="location"]',
          '[class*="job-location"]',
          '[class*="address"]',
          '[class*="city"]',
          '[class*="place"]'
        ],
        description: [
          '.job-description__text',
          '.show-more-less-html',
          '[data-test-id="job-description"]',
          '.job-details-jobs-unified-top-card__job-description',
          '[class*="description"]',
          '[class*="job-description"]',
          '.job-details-jobs-unified-top-card__job-description-content',
          '[class*="content"]',
          '[class*="details"]',
          '[class*="summary"]'
        ]
      }

      const extractText = (selectors: string[]): string => {
        for (const selector of selectors) {
          try {
            const elements = document.querySelectorAll(selector)
            for (const element of elements) {
              const text = element.textContent?.trim()
              if (text && text.length > 0) {
                return text
              }
            }
          } catch (e) {
            // Continue to next selector
          }
        }
        return ''
      }

      const company = extractText(aiSelectors.company)
      const role = extractText(aiSelectors.title)
      const location = extractText(aiSelectors.location)
      const description = extractText(aiSelectors.description)

      // Debug logging
      console.log('Extracted data:', { company, role, location, description: description?.substring(0, 100) })

      return { company, role, location, description }
    })

    return {
      ...jobData,
      jobUrl: url,
      jobId,
      salary: '',
      jobType: '',
      experienceLevel: '',
      postedDate: ''
    }

  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

async function extractWithAIEnhancedFetch(url: string, jobId: string): Promise<LinkedInJobData> {
  // Try multiple fetch strategies with different headers and approaches
  const strategies = [
    {
      name: 'Standard Browser Headers',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      }
    },
    {
      name: 'Mobile Headers',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'X-Requested-With': 'XMLHttpRequest'
      }
    },
    {
      name: 'Bot Headers',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }
  ]

  for (const strategy of strategies) {
    try {
      console.log(`Trying ${strategy.name} fetch strategy...`)
      
      // Filter out undefined headers
      const cleanHeaders: Record<string, string> = {}
      Object.entries(strategy.headers).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanHeaders[key] = value
        }
      })
      
      const response = await fetch(url, {
        method: 'GET',
        headers: cleanHeaders,
        redirect: 'follow'
      })

      if (!response.ok) {
        console.log(`${strategy.name} failed with status: ${response.status}`)
        continue
      }

      const html = await response.text()
      
      // Extract data using regex patterns
      const companyMatch = html.match(/<div[^>]*class="[^"]*company-name[^"]*"[^>]*>.*?<a[^>]*>([^<]+)<\/a>/i) ||
                          html.match(/<div[^>]*class="[^"]*company[^"]*"[^>]*>([^<]+)<\/div>/i) ||
                          html.match(/company[^>]*>([^<]+)<\/[^>]*>/i)
      
      const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                        html.match(/<div[^>]*class="[^"]*job-title[^"]*"[^>]*>([^<]+)<\/div>/i) ||
                        html.match(/job-title[^>]*>([^<]+)<\/[^>]*>/i)
      
      const locationMatch = html.match(/<div[^>]*class="[^"]*location[^"]*"[^>]*>([^<]+)<\/div>/i) ||
                           html.match(/location[^>]*>([^<]+)<\/[^>]*>/i)
      
      const descriptionMatch = html.match(/<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                              html.match(/job-description[^>]*>([\s\S]*?)<\/[^>]*>/i)

      const company = companyMatch ? companyMatch[1].trim() : ''
      const role = titleMatch ? titleMatch[1].trim() : ''
      const location = locationMatch ? locationMatch[1].trim() : ''
      
      // Clean HTML from description
      let description = descriptionMatch ? descriptionMatch[1].trim() : ''
      if (description) {
        description = description
          .replace(/<[^>]*>/g, '') // Remove all HTML tags
          .replace(/&amp;/g, '&') // Convert HTML entities
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .trim()
      }

      if (company || role) {
        console.log(`${strategy.name} extraction successful:`, { company, role, location })
        return {
          company,
          role,
          location,
          description,
          jobUrl: url,
          jobId,
          salary: '',
          jobType: '',
          experienceLevel: '',
          postedDate: ''
        }
      }
    } catch (error) {
      console.log(`${strategy.name} strategy failed:`, error)
    }
  }

  throw new Error('All AI-Enhanced fetch attempts failed')
}

async function extractWithAIPoweredMobileAPI(url: string, jobId: string): Promise<LinkedInJobData> {
  // Try LinkedIn's mobile API endpoints
  const mobileEndpoints = [
    `https://www.linkedin.com/jobs/api/jobPosting/${jobId}`,
    `https://www.linkedin.com/jobs/api/jobPosting/${jobId}?includeInsights=true`,
    `https://www.linkedin.com/jobs/api/jobPosting/${jobId}?includeInsights=true&includeCompany=true`
  ]

  for (const endpoint of mobileEndpoints) {
    try {
      console.log(`Trying mobile API endpoint: ${endpoint}`)
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': 'https://www.linkedin.com/'
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.companyName || data.title) {
          console.log('Mobile API extraction successful:', data)
          return {
            company: data.companyName || data.company?.name || '',
            role: data.title || data.jobTitle || '',
            location: data.location || data.formattedLocation || '',
            description: data.description || data.formattedDescription || '',
            jobUrl: url,
            jobId,
            salary: data.salary || '',
            jobType: data.employmentType || '',
            experienceLevel: data.seniorityLevel || '',
            postedDate: data.postedDate || ''
          }
        }
      }
    } catch (error) {
      console.log(`Mobile API endpoint ${endpoint} failed:`, error)
    }
  }

  throw new Error('AI-Powered mobile API extraction failed')
}

async function extractWithAIEnhancedJsonLd(url: string, jobId: string): Promise<LinkedInJobData> {
  try {
    // First try to get the page content
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`)
    }

    const html = await response.text()
    
    // Extract JSON-LD structured data
    const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)
    
    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        try {
          const jsonContent = match.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, '')
          const data = JSON.parse(jsonContent)
          
          if (data['@type'] === 'JobPosting' || data['@type'] === 'JobPosting') {
            console.log('JSON-LD extraction successful:', data)
            return {
              company: data.hiringOrganization?.name || data.employerName || '',
              role: data.title || data.jobTitle || '',
              location: data.jobLocation?.address?.addressLocality || data.location || '',
              description: data.description || data.jobDescription || '',
              jobUrl: url,
              jobId,
              salary: data.baseSalary?.value || data.salary || '',
              jobType: data.employmentType || '',
              experienceLevel: data.experienceRequirements || '',
              postedDate: data.datePosted || ''
            }
          }
        } catch (parseError) {
          console.log('JSON-LD parse error:', parseError)
        }
      }
    }
    
    throw new Error('No valid JSON-LD data found')
  } catch (error) {
    throw new Error(`AI-Enhanced JSON-LD extraction failed: ${error}`)
  }
}

async function extractWithAIAlternativeEndpoints(url: string, jobId: string): Promise<LinkedInJobData> {
  // Try alternative LinkedIn endpoints and scraping services
  const alternativeEndpoints = [
    `https://www.linkedin.com/jobs/view/${jobId}`,
    `https://www.linkedin.com/jobs/view/${jobId}/`,
    `https://www.linkedin.com/jobs/view/${jobId}?trk=public_jobs_jserp-result_search-card`,
    `https://www.linkedin.com/jobs/view/${jobId}?trk=public_jobs_jserp-result_search-card&originalSubdomain=www`
  ]

  for (const endpoint of alternativeEndpoints) {
    try {
      console.log(`Trying alternative endpoint: ${endpoint}`)
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'max-age=0',
          'Referer': 'https://www.google.com/'
        }
      })

      if (response.ok) {
        const html = await response.text()
        
        // Use more aggressive regex patterns
        const companyMatch = html.match(/company[^>]*>([^<]+)<\/[^>]*>/gi) ||
                            html.match(/organization[^>]*>([^<]+)<\/[^>]*>/gi) ||
                            html.match(/employer[^>]*>([^<]+)<\/[^>]*>/gi)
        
        const titleMatch = html.match(/job-title[^>]*>([^<]+)<\/[^>]*>/gi) ||
                          html.match(/position[^>]*>([^<]+)<\/[^>]*>/gi) ||
                          html.match(/role[^>]*>([^<]+)<\/[^>]*>/gi)
        
        const locationMatch = html.match(/location[^>]*>([^<]+)<\/[^>]*>/gi) ||
                             html.match(/address[^>]*>([^<]+)<\/[^>]*>/gi) ||
                             html.match(/city[^>]*>([^<]+)<\/[^>]*>/gi)

        const company = companyMatch ? companyMatch[0].replace(/<[^>]*>/g, '').trim() : ''
        const role = titleMatch ? titleMatch[0].replace(/<[^>]*>/g, '').trim() : ''
        const location = locationMatch ? locationMatch[0].replace(/<[^>]*>/g, '').trim() : ''

        if (company || role) {
          console.log('Alternative endpoint extraction successful:', { company, role, location })
          return {
            company,
            role,
            location,
            description: '',
            jobUrl: url,
            jobId,
            salary: '',
            jobType: '',
            experienceLevel: '',
            postedDate: ''
          }
        }
      }
    } catch (error) {
      console.log(`Alternative endpoint ${endpoint} failed:`, error)
    }
  }

  throw new Error('AI-Powered alternative endpoints extraction failed')
}

function extractWithAIEnhancedURLParsing(url: string, jobId: string): LinkedInJobData {
  const jobTitle = extractJobTitleFromUrl(url)
  return {
    company: '',
    role: jobTitle || 'Job from LinkedIn',
    location: '',
    description: `LinkedIn job posting (ID: ${jobId}). AI extraction attempted but LinkedIn's advanced security measures prevented full automation. Please fill in the company name and other details manually.`,
    jobUrl: url,
    jobId,
    salary: '',
    jobType: '',
    experienceLevel: '',
    postedDate: ''
  }
}

function generateAIDynamicHeaders(): Record<string, string> {
  const userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ]

  const referers = [
    'https://www.google.com/',
    'https://www.bing.com/',
    'https://www.linkedin.com/jobs/',
    'https://www.linkedin.com/',
    'https://www.google.com/search?q=linkedin+job'
  ]

  return {
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
    'Referer': referers[Math.floor(Math.random() * referers.length)]
  }
}

function extractJobTitleFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i]
      if (part && part !== 'jobs' && part !== 'view' && !part.match(/^\d+$/)) {
        return decodeURIComponent(part).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }
    }
    return null
  } catch (error) {
    console.error('Error extracting job title from URL:', error)
    return null
  }
} 