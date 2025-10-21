import { motion } from 'framer-motion'
import { 
  DocumentTextIcon, 
  ScaleIcon, 
  ClockIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline'
import { formatFileSize } from '@/utils'
import type { SelectedDocument, ProjectFormData } from '@/types'

interface PacketStatsProps {
  selectedDocuments: SelectedDocument[]
  formData: Partial<ProjectFormData>
  isGenerating?: boolean
  generatedSize?: number
}

export default function PacketStats({ 
  selectedDocuments, 
  formData, 
  isGenerating = false,
  generatedSize 
}: PacketStatsProps) {
  // Calculate statistics
  const selectedDocs = selectedDocuments.filter(doc => doc.selected)
  const totalDocuments = selectedDocs.length
  const totalSize = selectedDocs.reduce((sum, doc) => sum + (doc.document.size || 0), 0)
  const estimatedFinalSize = totalSize + (totalDocuments * 50000) // Add overhead for cover + dividers
  
  const stats = [
    {
      label: 'Documents Selected',
      value: totalDocuments.toString(),
      icon: DocumentTextIcon,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      label: 'Total Size',
      value: formatFileSize(totalSize),
      icon: ScaleIcon,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      label: 'Estimated Final Size',
      value: generatedSize ? formatFileSize(generatedSize) : formatFileSize(estimatedFinalSize),
      icon: CheckCircleIcon,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      label: 'Project Status',
      value: isGenerating ? 'Generating...' : (formData.status || 'Draft'),
      icon: ClockIcon,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className={`${stat.bgColor} rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50`}
        >
          <div className="flex items-center justify-between mb-2">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            {isGenerating && stat.label === 'Project Status' && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Document breakdown component
interface DocumentBreakdownProps {
  selectedDocuments: SelectedDocument[]
}

export function DocumentBreakdown({ selectedDocuments }: DocumentBreakdownProps) {
  const selectedDocs = selectedDocuments.filter(doc => doc.selected)
  
  if (selectedDocs.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Document Breakdown
      </h3>
      <div className="space-y-3">
        {selectedDocs.map((doc, index) => (
          <motion.div
            key={doc.document.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  {index + 1}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {doc.document.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {doc.document.type} • {formatFileSize(doc.document.size || 0)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Order: {doc.order}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900 dark:text-white">
            Total Documents: {selectedDocs.length}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            Combined Size: {formatFileSize(selectedDocs.reduce((sum, doc) => sum + (doc.document.size || 0), 0))}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
