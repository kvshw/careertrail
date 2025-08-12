/**
 * Error handling utilities to prevent runtime.lastError and improve user experience
 */

export interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number
}

/**
 * Enhanced fetch with timeout and better error handling
 * Helps prevent runtime.lastError issues
 */
export async function fetchWithTimeout(
  url: string, 
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Request was cancelled or timed out')
      throw new Error('Request timed out. Please try again.')
    }
    
    throw error
  }
}

/**
 * Safely handle async operations with proper cleanup
 */
export function createAsyncHandler<T extends any[]>(
  asyncFn: (...args: T) => Promise<void>
) {
  let isMounted = true
  
  const handler = async (...args: T) => {
    try {
      if (!isMounted) return
      await asyncFn(...args)
    } catch (error) {
      if (!isMounted) return
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Operation was cancelled')
        return
      }
      
      console.error('Async operation failed:', error)
      throw error
    }
  }
  
  const cleanup = () => {
    isMounted = false
  }
  
  return { handler, cleanup }
}

/**
 * Clipboard operations with better error handling
 */
export const clipboardUtils = {
  async readText(): Promise<string> {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available')
      }
      return await navigator.clipboard.readText()
    } catch (error) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        throw new Error('Clipboard access denied. Please grant permission and try again.')
      }
      throw new Error('Failed to read clipboard. Please paste manually.')
    }
  },
  
  async writeText(text: string): Promise<void> {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available')
      }
      await navigator.clipboard.writeText(text)
    } catch (error) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        throw new Error('Clipboard access denied. Please grant permission and try again.')
      }
      throw new Error('Failed to copy to clipboard.')
    }
  }
}

/**
 * Check if the current environment might cause runtime.lastError
 */
export function checkEnvironmentIssues(): string[] {
  const issues: string[] = []
  
  // Check for common browser extension conflicts
  if (typeof window !== 'undefined') {
    // Check for Chrome extension context
    if ((window as any).chrome?.runtime) {
      issues.push('Browser extension detected - may cause message port errors')
    }
    
    // Check for development tools
    if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      issues.push('React DevTools detected')
    }
    
    // Check for other common extension indicators
    if ((window as any).__REDUX_DEVTOOLS_EXTENSION__) {
      issues.push('Redux DevTools detected')
    }
    
    // Check for password managers that might interfere
    if (document.querySelector('[data-lastpass-icon-root]') || 
        document.querySelector('[data-bitwarden-watching]') ||
        document.querySelector('[data-dashlane-watched]')) {
      issues.push('Password manager extension detected')
    }
    
    // Check for ad blockers that might interfere
    if ((window as any).adblockerpresent || 
        (window as any).uBlockOrigin ||
        document.querySelector('[data-adblock-key]')) {
      issues.push('Ad blocker extension detected')
    }
  }
  
  return issues
}

/**
 * Log environment issues for debugging
 */
export function logEnvironmentStatus(): void {
  const issues = checkEnvironmentIssues()
  if (issues.length > 0) {
    console.warn('Potential runtime.lastError causes detected:', issues)
    console.warn('If you see "runtime.lastError" messages, try:')
    console.warn('1. Test in incognito mode')
    console.warn('2. Disable browser extensions temporarily')
    console.warn('3. Clear browser cache')
  }
}

/**
 * Setup global error handlers to catch and suppress runtime.lastError
 */
export function setupGlobalErrorHandling(): void {
  if (typeof window !== 'undefined') {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('message port closed')) {
        console.log('Suppressed runtime.lastError (message port closed)')
        event.preventDefault()
        return
      }
      
      if (event.reason?.message?.includes('Extension context invalidated')) {
        console.log('Suppressed extension context error')
        event.preventDefault()
        return
      }
    })
    
    // Catch general errors
    window.addEventListener('error', (event) => {
      if (event.error?.message?.includes('message port closed') ||
          event.message?.includes('message port closed')) {
        console.log('Suppressed runtime.lastError from window.error')
        event.preventDefault()
        return
      }
    })
    
    // Override console.error temporarily to filter out known issues
    const originalConsoleError = console.error
    console.error = function(message: any, ...args: any[]) {
      if (typeof message === 'string' && 
          (message.includes('runtime.lastError') || 
           message.includes('message port closed'))) {
        console.log('Filtered runtime.lastError:', message)
        return
      }
      originalConsoleError.apply(console, [message, ...args])
    }
  }
}
