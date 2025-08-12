'use client'

export async function extractTextFromDocument(file: File): Promise<string> {
  // Text files
  if (file.type === 'text/plain') {
    return await file.text()
  }

  const extension = file.name.split('.').pop()?.toLowerCase()
  const mimeType = (file.type || '').toLowerCase()

  // PDF in browser
  if (mimeType === 'application/pdf' || extension === 'pdf') {
    const arrayBuffer = await file.arrayBuffer()
    const pdfjsLib: any = await import('pdfjs-dist/legacy/build/pdf')
    // Configure worker source explicitly to avoid Next.js worker path issues
    // Pinned to version matching installed pdfjs-dist
    if (pdfjsLib?.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'
    }

    try {
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise
      const pageTexts: string[] = []
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => (typeof item?.str === 'string' ? item.str : ''))
          .join(' ')
        pageTexts.push(pageText)
      }

      return pageTexts.join('\n\n')
    } catch (pdfError) {
      console.error('PDF processing error:', pdfError)
      throw new Error('Failed to process PDF. The file may be corrupted or password-protected.')
    }
  }

  // DOCX in browser
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    extension === 'docx'
  ) {
    const arrayBuffer = await file.arrayBuffer()
    const mammoth: any = await import('mammoth/mammoth.browser')
    const result = await mammoth.extractRawText({ arrayBuffer })
    return (result?.value || '').trim()
  }

  if (mimeType === 'application/msword' || extension === 'doc') {
    throw new Error('Legacy .doc files are not supported. Please convert to .docx and try again.')
  }

  throw new Error('File type not supported. Please upload a PDF, DOCX, or TXT file.')
}

export function getDocumentTypeFromFilename(
  filename: string
): 'resume' | 'cover_letter' | 'other' {
  const lowerFilename = filename.toLowerCase()
  if (lowerFilename.includes('resume') || lowerFilename.includes('cv')) {
    return 'resume'
  }
  if (lowerFilename.includes('cover') || lowerFilename.includes('letter')) {
    return 'cover_letter'
  }
  return 'other'
}

