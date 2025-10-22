import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export interface Env {
  // Define your environment variables here
  CORS_ORIGIN?: string
}

interface ProjectData {
  projectName: string
  submittedTo: string
  preparedBy: string
  product: string
  date: string
}

interface DocumentRequest {
  id: string
  name: string
  url: string
  type: string
  order: number
}

interface GeneratePacketRequest {
  projectData: ProjectData
  documents: DocumentRequest[]
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      const url = new URL(request.url)
      
      if (url.pathname === '/generate-packet' && request.method === 'POST') {
        const { projectData, documents }: GeneratePacketRequest = await request.json()
        
        const pdfBytes = await generatePDFPacket(projectData, documents)
        
        return new Response(pdfBytes, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${projectData.projectName || 'packet'}.pdf"`,
          },
        })
      }

      if (url.pathname === '/health') {
        return new Response(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders })
    } catch (error) {
      console.error('Worker error:', error)
      return new Response(JSON.stringify({ 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  },
}

async function generatePDFPacket(projectData: ProjectData, documents: DocumentRequest[]): Promise<Uint8Array> {
  const finalPdf = await PDFDocument.create()
  
  // Add cover page
  await addCoverPage(finalPdf, projectData)
  
  let currentPageNumber = 2 // Start after cover page
  
  // Sort documents by order
  const sortedDocuments = documents.sort((a, b) => a.order - b.order)
  
  // Process each document
  for (const doc of sortedDocuments) {
    try {
      // Add divider page
      await addDividerPage(finalPdf, doc, currentPageNumber)
      currentPageNumber++
      
      // Fetch and merge the PDF
      const pdfResponse = await fetch(doc.url)
      if (!pdfResponse.ok) {
        throw new Error(`Failed to fetch PDF: ${pdfResponse.status}`)
      }
      
      const pdfBytes = await pdfResponse.arrayBuffer()
      const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
      
      // Copy pages with error handling
      const pageIndices = sourcePdf.getPageIndices()
      for (let i = 0; i < pageIndices.length; i++) {
        try {
          const [copiedPage] = await finalPdf.copyPages(sourcePdf, [pageIndices[i]])
          finalPdf.addPage(copiedPage)
          currentPageNumber++
        } catch (pageError) {
          console.warn(`Failed to copy page ${i + 1} from ${doc.name}:`, pageError)
          // Add error page instead
          await addErrorPage(finalPdf, `Page ${i + 1} of ${doc.name}`, pageError instanceof Error ? pageError.message : 'Unknown error')
          currentPageNumber++
        }
      }
    } catch (docError) {
      console.error(`Failed to process document ${doc.name}:`, docError)
      // Add error page for the entire document
      await addErrorPage(finalPdf, doc.name, docError instanceof Error ? docError.message : 'Failed to load document')
      currentPageNumber++
    }
  }
  
  // Add page numbers to all pages except cover
  await addPageNumbers(finalPdf)
  
  return await finalPdf.save()
}

async function addCoverPage(pdf: PDFDocument, projectData: ProjectData) {
  const page = pdf.addPage([612, 792]) // Letter size
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold)
  
  const { width, height } = page.getSize()
  
  // Title
  page.drawText('MAXTERRA® PDF PACKET', {
    x: 50,
    y: height - 100,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  })
  
  // Project details
  const details = [
    { label: 'Project Name:', value: projectData.projectName },
    { label: 'Submitted To:', value: projectData.submittedTo },
    { label: 'Prepared By:', value: projectData.preparedBy },
    { label: 'Product:', value: projectData.product },
    { label: 'Date:', value: projectData.date },
  ]
  
  let yPosition = height - 200
  details.forEach(({ label, value }) => {
    if (value) {
      page.drawText(label, {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      })
      page.drawText(value, {
        x: 150,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      })
      yPosition -= 30
    }
  })
  
  // Footer
  page.drawText('Generated by MAXTERRA® PDF Packet Builder', {
    x: 50,
    y: 50,
    size: 10,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  })
}

async function addDividerPage(pdf: PDFDocument, document: DocumentRequest, pageNumber: number) {
  const page = pdf.addPage([612, 792])
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold)
  
  const { width, height } = page.getSize()
  
  // Document type and name
  page.drawText(document.type.toUpperCase(), {
    x: 50,
    y: height - 150,
    size: 18,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  })
  
  page.drawText(document.name, {
    x: 50,
    y: height - 200,
    size: 14,
    font: font,
    color: rgb(0.3, 0.3, 0.3),
  })
  
  // Page number
  page.drawText(`Page ${pageNumber}`, {
    x: width - 100,
    y: 30,
    size: 10,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  })
}

async function addErrorPage(pdf: PDFDocument, documentName: string, errorMessage: string) {
  const page = pdf.addPage([612, 792])
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold)
  
  const { width, height } = page.getSize()
  
  // Error title
  page.drawText('DOCUMENT ERROR', {
    x: 50,
    y: height - 150,
    size: 18,
    font: boldFont,
    color: rgb(0.8, 0.2, 0.2),
  })
  
  // Document name
  page.drawText(`Document: ${documentName}`, {
    x: 50,
    y: height - 200,
    size: 14,
    font: font,
    color: rgb(0.3, 0.3, 0.3),
  })
  
  // Error message (truncated to fit)
  const maxLength = 80
  const truncatedError = errorMessage.length > maxLength 
    ? errorMessage.substring(0, maxLength) + '...' 
    : errorMessage
  
  page.drawText(`Error: ${truncatedError}`, {
    x: 50,
    y: height - 250,
    size: 12,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  })
  
  page.drawText('This document could not be processed and has been skipped.', {
    x: 50,
    y: height - 300,
    size: 12,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  })
}

async function addPageNumbers(pdf: PDFDocument) {
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const pages = pdf.getPages()
  
  // Skip cover page (index 0)
  for (let i = 1; i < pages.length; i++) {
    const page = pages[i]
    const { width } = page.getSize()
    
    page.drawText(`${i + 1}`, {
      x: width - 50,
      y: 30,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    })
  }
}
