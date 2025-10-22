import type { ProjectFormData, SelectedDocument } from '@/types'

interface DocumentRequest {
  id: string
  name: string
  url: string
  type: string
  order: number
}

interface GeneratePacketRequest {
  projectData: ProjectFormData
  documents: DocumentRequest[]
}

export class PDFService {
  private readonly workerUrl: string

  constructor() {
    // You'll need to replace this with your actual Cloudflare Worker URL after deployment
    this.workerUrl = import.meta.env.VITE_WORKER_URL || 
      (import.meta.env.MODE === 'production' 
        ? 'https://maxterra-pdf-worker.your-subdomain.workers.dev'
        : 'http://localhost:8787') // Local development
  }

  /**
   * Generate PDF packet using Cloudflare Worker (server-side processing)
   */
  async generatePacket(
    formData: Partial<ProjectFormData>,
    selectedDocuments: SelectedDocument[]
  ): Promise<Uint8Array> {
    try {
      console.log('🚀 Starting server-side PDF generation...')
      
      // Filter and sort selected documents
      const sortedDocuments = selectedDocuments
        .filter(doc => doc.selected)
        .sort((a, b) => a.order - b.order)

      if (sortedDocuments.length === 0) {
        throw new Error('No documents selected for packet generation')
      }

      // Prepare request data
      const requestData: GeneratePacketRequest = {
        projectData: {
          projectName: formData.projectName || 'Untitled Project',
          submittedTo: formData.submittedTo || '',
          preparedBy: formData.preparedBy || '',
          product: formData.product || '',
          date: formData.date || new Date().toISOString().split('T')[0],
          projectNumber: formData.projectNumber || '',
          email: formData.email || '',
          phone: formData.phone || '',
          status: formData.status || 'Draft'
        },
        documents: sortedDocuments.map(doc => ({
          id: doc.id,
          name: doc.document.name,
          url: doc.document.url,
          type: doc.document.type,
          order: doc.order
        }))
      }

      console.log('📤 Sending request to Cloudflare Worker:', {
        workerUrl: this.workerUrl,
        documentCount: requestData.documents.length,
        projectName: requestData.projectData.projectName
      })

      // Send request to Cloudflare Worker
      const response = await fetch(`${this.workerUrl}/generate-packet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Worker request failed: ${response.status} ${response.statusText}\n${errorText}`)
      }

      // Get PDF bytes from response
      const pdfBytes = await response.arrayBuffer()
      console.log('✅ PDF generated successfully:', {
        size: `${(pdfBytes.byteLength / 1024 / 1024).toFixed(2)} MB`,
        pages: 'Unknown (server-side processed)'
      })

      return new Uint8Array(pdfBytes)
    } catch (error) {
      console.error('❌ PDF generation failed:', error)
      throw error instanceof Error ? error : new Error('Unknown error during PDF generation')
    }
  }

  /**
   * Download PDF with proper filename
   */
  downloadPDF(pdfBytes: Uint8Array, filename: string): void {
    try {
      const arrayBuffer = new ArrayBuffer(pdfBytes.length)
      const view = new Uint8Array(arrayBuffer)
      view.set(pdfBytes)
      
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log('📥 PDF download initiated:', filename)
    } catch (error) {
      console.error('❌ PDF download failed:', error)
      throw new Error('Failed to download PDF')
    }
  }

  /**
   * Preview PDF in new tab
   */
  previewPDF(pdfBytes: Uint8Array): void {
    try {
      const arrayBuffer = new ArrayBuffer(pdfBytes.length)
      const view = new Uint8Array(arrayBuffer)
      view.set(pdfBytes)
      
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      window.open(url, '_blank')
      
      // Clean up URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      
      console.log('👁 PDF preview opened in new tab')
    } catch (error) {
      console.error('❌ PDF preview failed:', error)
      throw new Error('Failed to preview PDF')
    }
  }

  /**
   * Check if worker is healthy
   */
  async checkWorkerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.workerUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const health = await response.json()
        console.log('✅ Worker health check passed:', health)
        return true
      } else {
        console.warn('⚠️ Worker health check failed:', response.status)
        return false
      }
    } catch (error) {
      console.error('❌ Worker health check error:', error)
      return false
    }
  }
}

// Create singleton instance
export const pdfService = new PDFService()
