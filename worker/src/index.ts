import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib'

export interface Env {
  // Define your environment variables here
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
}

interface GeneratePacketRequest {
  projectData: ProjectData
  documents: DocumentRequest[]
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    if (request.method === 'POST' && new URL(request.url).pathname === '/generate-packet') {
      try {
        const { projectData, documents }: GeneratePacketRequest = await request.json()
        
        console.log(`Generating packet for: ${projectData.projectName}`)
        console.log(`Processing ${documents.length} documents`)

        // Create new PDF document
        const finalPdf = await PDFDocument.create()
        
        // Add cover page
        await addCoverPage(finalPdf, projectData)
        
        let currentPageNumber = 2 // Start after cover page
        
        // Process each document
        for (const doc of documents) {
          try {
            console.log(`Processing: ${doc.name}`)
            
            // Add divider page
            await addDividerPage(finalPdf, doc.name, doc.type, currentPageNumber)
            currentPageNumber++
            
            // Fetch and merge PDF
            const pdfBytes = await fetchPDF(doc.url)
            if (pdfBytes) {
              const sourcePdf = await PDFDocument.load(pdfBytes)
              const pageIndices = sourcePdf.getPageIndices()
              
              // Copy pages one by one for better error handling
              for (let i = 0; i < pageIndices.length; i++) {
                try {
                  const [copiedPage] = await finalPdf.copyPages(sourcePdf, [pageIndices[i]])
                  finalPdf.addPage(copiedPage)
                  currentPageNumber++
                } catch (pageError) {
                  console.warn(`Failed to copy page ${i + 1} from ${doc.name}:`, pageError)
                  // Add error page instead
                  await addErrorPage(finalPdf, doc.name, `Page ${i + 1} could not be processed`)
                  currentPageNumber++
                }
              }
              
              console.log(`Successfully processed ${pageIndices.length} pages from ${doc.name}`)
            } else {
              // Add error page if PDF couldn't be loaded
              await addErrorPage(finalPdf, doc.name, 'Document could not be loaded')
              currentPageNumber++
            }
          } catch (docError) {
            console.error(`Error processing ${doc.name}:`, docError)
            await addErrorPage(finalPdf, doc.name, 'Document processing failed')
            currentPageNumber++
          }
        }
        
        // Add page numbers to all pages
        await addPageNumbers(finalPdf)
        
        // Generate final PDF
        const pdfBytes = await finalPdf.save()
        
        console.log(`Packet generated successfully: ${pdfBytes.length} bytes`)
        
        return new Response(pdfBytes, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${projectData.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Packet.pdf"`,
            'Content-Length': pdfBytes.length.toString(),
          },
        })
        
      } catch (error) {
        console.error('Error generating packet:', error)
        return new Response(JSON.stringify({ 
          error: 'Failed to generate packet',
          details: error instanceof Error ? error.message : 'Unknown error'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    return new Response('PDF Packet Generator Worker', {
      headers: corsHeaders,
    })
  },
}

async function fetchPDF(url: string): Promise<ArrayBuffer | null> {
  try {
    // Convert relative URL to properly encoded GitHub raw URL
    let fullUrl = url
    if (!url.startsWith('http')) {
      // Remove leading slash if present
      const cleanPath = url.startsWith('/') ? url.substring(1) : url
      // Properly encode the URL components
      const encodedPath = encodeURIComponent(cleanPath).replace(/%2F/g, '/')
      fullUrl = `https://raw.githubusercontent.com/karthikeyanasha24/pdf-packet-4/main/public/${encodedPath}`
    }
    
    console.log(`Fetching PDF from: ${fullUrl}`)
    
    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'PDF-Packet-Generator/1.0',
      }
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch PDF: ${response.status} ${response.statusText}`)
      console.error(`URL attempted: ${fullUrl}`)
      return null
    }
    
    const arrayBuffer = await response.arrayBuffer()
    console.log(`PDF fetched successfully: ${arrayBuffer.byteLength} bytes`)
    return arrayBuffer
  } catch (error) {
    console.error(`Error fetching PDF from ${url}:`, error)
    return null
  }
}

async function addCoverPage(pdf: PDFDocument, projectData: ProjectData) {
  const page = pdf.addPage(PageSizes.A4)
  const { width, height } = page.getSize()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold)
  
  // MAXTERRA Header
  page.drawText('MAXTERRA®', {
    x: 50,
    y: height - 100,
    size: 32,
    font: boldFont,
    color: rgb(0.058, 0.647, 0.914), // Primary blue
  })
  
  page.drawText('PDF PACKET', {
    x: 50,
    y: height - 140,
    size: 24,
    font: boldFont,
    color: rgb(0.4, 0.4, 0.4),
  })
  
  // Project Information
  const startY = height - 220
  const lineHeight = 30
  
  const fields = [
    ['Project Name:', projectData.projectName],
    ['Submitted To:', projectData.submittedTo],
    ['Prepared By:', projectData.preparedBy],
    ['Product:', projectData.product],
    ['Date:', projectData.date],
  ]
  
  fields.forEach(([label, value], index) => {
    const y = startY - (index * lineHeight)
    
    page.drawText(label, {
      x: 50,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    })
    
    page.drawText(value || 'N/A', {
      x: 180,
      y,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    })
  })
  
  // Footer
  page.drawText('Generated by MAXTERRA® PDF Packet Builder', {
    x: 50,
    y: 50,
    size: 10,
    font: font,
    color: rgb(0.6, 0.6, 0.6),
  })
}

async function addDividerPage(pdf: PDFDocument, documentName: string, documentType: string, pageNumber: number) {
  const page = pdf.addPage(PageSizes.A4)
  const { width, height } = page.getSize()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold)
  
  // Section header
  page.drawText('SECTION DIVIDER', {
    x: 50,
    y: height - 100,
    size: 16,
    font: boldFont,
    color: rgb(0.058, 0.647, 0.914),
  })
  
  // Document name
  page.drawText(documentName, {
    x: 50,
    y: height - 150,
    size: 20,
    font: boldFont,
    color: rgb(0, 0, 0),
  })
  
  // Document type
  page.drawText(`Type: ${documentType}`, {
    x: 50,
    y: height - 180,
    size: 12,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  })
  
  // Page number
  page.drawText(`Page ${pageNumber}`, {
    x: 50,
    y: height - 200,
    size: 10,
    font: font,
    color: rgb(0.6, 0.6, 0.6),
  })
}

async function addErrorPage(pdf: PDFDocument, documentName: string, errorMessage: string) {
  const page = pdf.addPage(PageSizes.A4)
  const { width, height } = page.getSize()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold)
  
  // Error header
  page.drawText('DOCUMENT ERROR', {
    x: 50,
    y: height - 100,
    size: 16,
    font: boldFont,
    color: rgb(0.8, 0.2, 0.2),
  })
  
  // Document name
  page.drawText(documentName, {
    x: 50,
    y: height - 150,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  })
  
  // Error message
  page.drawText(`Error: ${errorMessage}`, {
    x: 50,
    y: height - 180,
    size: 12,
    font: font,
    color: rgb(0.6, 0.2, 0.2),
  })
  
  // Instructions
  page.drawText('Please contact support if this error persists.', {
    x: 50,
    y: height - 220,
    size: 10,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  })
}

async function addPageNumbers(pdf: PDFDocument) {
  const pages = pdf.getPages()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  
  pages.forEach((page, index) => {
    const { width } = page.getSize()
    const pageNumber = index + 1
    
    page.drawText(`${pageNumber}`, {
      x: width - 50,
      y: 30,
      size: 10,
      font: font,
      color: rgb(0.4, 0.4, 0.4),
    })
  })
}
