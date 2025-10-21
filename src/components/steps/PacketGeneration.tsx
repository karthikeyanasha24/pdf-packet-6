import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CloudArrowDownIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { cn, formatFileSize } from '@/utils'
import { documentTypeConfig } from '@/data/documents'
import { pdfService } from '@/services/pdfService'
import type { SelectedDocument, ProjectFormData } from '@/types'
import toast from 'react-hot-toast'

interface PacketGenerationProps {
  formData: Partial<ProjectFormData>
  selectedDocuments: SelectedDocument[]
  onPrevious: () => void
  isGenerating: boolean
  onSetGenerating: (generating: boolean) => void
}

interface GenerationStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'processing' | 'completed' | 'error'
}

export default function PacketGeneration({
  formData,
  selectedDocuments,
  onPrevious,
  isGenerating,
  onSetGenerating,
}: PacketGenerationProps) {
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([
    {
      id: 'validate',
      title: 'Validating Data',
      description: 'Checking form data and document selections',
      status: 'pending'
    },
    {
      id: 'cover',
      title: 'Creating Cover Page',
      description: 'Generating branded cover page with project information',
      status: 'pending'
    },
    {
      id: 'dividers',
      title: 'Adding Section Dividers',
      description: 'Creating divider pages for each document section',
      status: 'pending'
    },
    {
      id: 'merge',
      title: 'Merging Documents',
      description: 'Combining all PDFs in the specified order',
      status: 'pending'
    },
    {
      id: 'finalize',
      title: 'Finalizing Packet',
      description: 'Adding page numbers and preparing download',
      status: 'pending'
    }
  ])

  const [generatedPacket, setGeneratedPacket] = useState<{
    pdfBytes: Uint8Array
    filename: string
    size: number
  } | null>(null)

  // Get selected documents sorted by order
  const sortedDocuments = selectedDocuments
    .filter(doc => doc.selected)
    .sort((a, b) => a.order - b.order)

  // Calculate estimated packet size
  const estimatedSize = sortedDocuments.reduce((total, doc) => total + (doc.document.size || 0), 0)

  const updateStepStatus = (stepId: string, status: GenerationStep['status']) => {
    setGenerationSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ))
  }

  const generatePacket = async () => {
    if (!formData || sortedDocuments.length === 0) {
      toast.error('Please complete all previous steps before generating the packet')
      return
    }

    onSetGenerating(true)
    
    try {
      // Step 1: Validate
      updateStepStatus('validate', 'processing')
      await new Promise(resolve => setTimeout(resolve, 800))
      updateStepStatus('validate', 'completed')

      // Step 2: Create cover page
      updateStepStatus('cover', 'processing')
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateStepStatus('cover', 'completed')

      // Step 3: Add dividers
      updateStepStatus('dividers', 'processing')
      await new Promise(resolve => setTimeout(resolve, 800))
      updateStepStatus('dividers', 'completed')

      // Step 4: Merge documents
      updateStepStatus('merge', 'processing')
      
      // Generate actual PDF using pdf-lib
      const pdfBytes = await pdfService.generatePacket(
        formData as ProjectFormData,
        sortedDocuments
      )
      
      updateStepStatus('merge', 'completed')

      // Step 5: Finalize
      updateStepStatus('finalize', 'processing')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const filename = `MAXTERRA-Packet-${formData.projectName?.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
      
      updateStepStatus('finalize', 'completed')
      
      setGeneratedPacket({
        pdfBytes,
        filename,
        size: pdfBytes.length
      })

      const successMessage = `PDF packet generated successfully! ${Math.round(pdfBytes.length / 1024)} KB with ${sortedDocuments.length} documents processed.`
      toast.success(successMessage)

    } catch (error) {
      console.error('Generation error:', error)
      
      // Mark current processing step as error
      const processingStep = generationSteps.find(step => step.status === 'processing')
      if (processingStep) {
        updateStepStatus(processingStep.id, 'error')
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate PDF packet. Please try again.'
      toast.error(errorMessage)
    } finally {
      onSetGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedPacket) {
      toast.success('Download started!')
      pdfService.downloadPDF(generatedPacket.pdfBytes, generatedPacket.filename)
    }
  }

  const handlePreview = () => {
    if (generatedPacket) {
      pdfService.previewPDF(generatedPacket.pdfBytes)
    }
  }

  const resetGeneration = () => {
    setGenerationSteps(prev => prev.map(step => ({ ...step, status: 'pending' })))
    setGeneratedPacket(null)
  }

  const canGenerate = sortedDocuments.length > 0 && !isGenerating

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      <div className="card p-8 lg:p-12">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <CloudArrowDownIcon className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-3">
            Generate PDF Packet
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Review your selections and generate a professional PDF packet with cover page, 
            section dividers, and page numbering.
          </p>
        </div>

        {/* Packet Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Packet Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Info */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Information</h4>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p><span className="font-medium">Project:</span> {formData.projectName}</p>
                <p><span className="font-medium">Company:</span> {formData.submittedTo}</p>
                <p><span className="font-medium">Prepared by:</span> {formData.preparedBy}</p>
                <p><span className="font-medium">Product:</span> {formData.product}</p>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Documents ({sortedDocuments.length})
              </h4>
              <div className="space-y-1">
                {sortedDocuments.slice(0, 3).map((doc, index) => {
                  const config = documentTypeConfig[doc.document.type]
                  return (
                    <div key={doc.id} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="w-4 text-xs">{index + 1}.</span>
                      <span className="mr-1">{config.icon}</span>
                      <span className="truncate">{doc.document.name}</span>
                    </div>
                  )
                })}
                {sortedDocuments.length > 3 && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 ml-4">
                    +{sortedDocuments.length - 3} more documents
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Estimated size:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatFileSize(estimatedSize + 50000)}
            </span>
          </div>
        </motion.div>

        {/* Generation Steps */}
        {(isGenerating || generationSteps.some(step => step.status !== 'pending')) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Generation Progress</h3>
            
            <div className="space-y-4">
              {generationSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  {/* Status Icon */}
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full",
                    step.status === 'pending' && "bg-gray-200 dark:bg-gray-700",
                    step.status === 'processing' && "bg-primary-100 dark:bg-primary-900/30",
                    step.status === 'completed' && "bg-green-100 dark:bg-green-900/30",
                    step.status === 'error' && "bg-red-100 dark:bg-red-900/30"
                  )}>
                    {step.status === 'processing' && (
                      <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    )}
                    {step.status === 'completed' && (
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    )}
                    {step.status === 'error' && (
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    )}
                    {step.status === 'pending' && (
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="flex-1">
                    <h4 className={cn(
                      "font-medium",
                      step.status === 'completed' && "text-green-700 dark:text-green-300",
                      step.status === 'processing' && "text-primary-700 dark:text-primary-300",
                      step.status === 'error' && "text-red-700 dark:text-red-300",
                      step.status === 'pending' && "text-gray-500 dark:text-gray-400"
                    )}>
                      {step.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Generated Packet */}
        {generatedPacket && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <DocumentArrowDownIcon className="w-6 h-6 text-green-600" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  PDF Packet Ready!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                  Your professional documentation packet has been generated successfully.
                </p>
                
                <div className="flex items-center gap-4 text-sm text-green-600 dark:text-green-400 mb-4">
                  <span>📄 {generatedPacket.filename}</span>
                  <span>📊 {formatFileSize(generatedPacket.size)}</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDownload}
                    className="btn btn-primary btn-sm"
                  >
                    <CloudArrowDownIcon className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                  
                  <button
                    onClick={handlePreview}
                    className="btn btn-outline btn-sm"
                    title="Preview PDF in new tab"
                  >
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Preview
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <motion.button
            onClick={onPrevious}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-outline btn-lg"
            disabled={isGenerating}
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Arrangement
          </motion.button>

          <div className="flex gap-3">
            {generatedPacket && (
              <motion.button
                onClick={resetGeneration}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-secondary btn-lg"
                disabled={isGenerating}
              >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Generate New
              </motion.button>
            )}

            <motion.button
              onClick={generatePacket}
              disabled={!canGenerate}
              whileHover={canGenerate ? { scale: 1.02 } : {}}
              whileTap={canGenerate ? { scale: 0.98 } : {}}
              className={cn(
                "btn btn-primary btn-lg min-w-48",
                !canGenerate && "opacity-50 cursor-not-allowed"
              )}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <CloudArrowDownIcon className="w-5 h-5 mr-2" />
                  Generate PDF Packet
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
