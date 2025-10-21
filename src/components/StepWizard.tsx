import { motion } from 'framer-motion'
import { 
  DocumentTextIcon, 
  DocumentDuplicateIcon, 
  Bars3BottomLeftIcon, 
  CloudArrowDownIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline'
import { cn } from '@/utils'
import type { ProjectFormData, SelectedDocument } from '@/types'

interface StepWizardProps {
  currentStep: number
  onStepClick: (step: number) => void
  formData: Partial<ProjectFormData>
  selectedDocuments: SelectedDocument[]
}

interface Step {
  id: number
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  isComplete: (formData: Partial<ProjectFormData>, selectedDocuments: SelectedDocument[]) => boolean
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Project Details',
    description: 'Enter project information and specifications',
    icon: DocumentTextIcon,
    isComplete: (formData) => {
      return !!(
        formData.submittedTo &&
        formData.projectName &&
        formData.preparedBy &&
        formData.email &&
        formData.status &&
        formData.product
      )
    },
  },
  {
    id: 2,
    title: 'Select Documents',
    description: 'Choose which documents to include',
    icon: DocumentDuplicateIcon,
    isComplete: (_, selectedDocuments) => {
      return selectedDocuments.some(doc => doc.selected)
    },
  },
  {
    id: 3,
    title: 'Arrange Order',
    description: 'Organize documents in your preferred sequence',
    icon: Bars3BottomLeftIcon,
    isComplete: (_, selectedDocuments) => {
      return selectedDocuments.some(doc => doc.selected)
    },
  },
  {
    id: 4,
    title: 'Generate Packet',
    description: 'Create and download your PDF packet',
    icon: CloudArrowDownIcon,
    isComplete: () => false, // This step is never "complete" until generation
  },
]

export default function StepWizard({ 
  currentStep, 
  onStepClick, 
  formData, 
  selectedDocuments 
}: StepWizardProps) {
  const canNavigateToStep = (stepId: number): boolean => {
    if (stepId <= currentStep) return true
    
    // Check if all previous steps are complete
    for (let i = 1; i < stepId; i++) {
      const step = steps.find(s => s.id === i)
      if (step && !step.isComplete(formData, selectedDocuments)) {
        return false
      }
    }
    return true
  }

  return (
    <div className="w-full">
      {/* Desktop Horizontal Stepper */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id
            const isComplete = step.isComplete(formData, selectedDocuments)
            const canNavigate = canNavigateToStep(step.id)
            const isPast = currentStep > step.id
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Circle */}
                <motion.button
                  whileHover={canNavigate ? { scale: 1.05 } : {}}
                  whileTap={canNavigate ? { scale: 0.95 } : {}}
                  onClick={() => canNavigate && onStepClick(step.id)}
                  disabled={!canNavigate}
                  className={cn(
                    "relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                    isActive && "border-primary-500 bg-primary-500 text-white shadow-lg",
                    isComplete && !isActive && "border-green-500 bg-green-500 text-white",
                    !isActive && !isComplete && canNavigate && "border-gray-300 bg-white text-gray-500 hover:border-primary-300 hover:bg-primary-50",
                    !canNavigate && "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed",
                    "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  )}
                >
                  {isComplete && !isActive ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeStep"
                      className="absolute inset-0 rounded-full border-2 border-primary-300 animate-pulse"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>

                {/* Step Content */}
                <div className="ml-4 flex-1">
                  <h3 className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    isActive && "text-primary-600 dark:text-primary-400",
                    isComplete && !isActive && "text-green-600 dark:text-green-400",
                    !isActive && !isComplete && "text-gray-500 dark:text-gray-400"
                  )}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-32">
                    {step.description}
                  </p>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div className={cn(
                      "h-0.5 transition-colors duration-300",
                      isPast || (isComplete && currentStep > step.id) 
                        ? "bg-primary-500" 
                        : "bg-gray-200 dark:bg-gray-700"
                    )} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile/Tablet Vertical Stepper */}
      <div className="lg:hidden">
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id
            const isComplete = step.isComplete(formData, selectedDocuments)
            const canNavigate = canNavigateToStep(step.id)
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <motion.button
                  whileTap={canNavigate ? { scale: 0.98 } : {}}
                  onClick={() => canNavigate && onStepClick(step.id)}
                  disabled={!canNavigate}
                  className={cn(
                    "w-full flex items-center p-4 rounded-xl border-2 transition-all duration-300",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                    isActive && "border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg",
                    isComplete && !isActive && "border-green-500 bg-green-50 dark:bg-green-900/20",
                    !isActive && !isComplete && canNavigate && "border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/10",
                    !canNavigate && "border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 cursor-not-allowed opacity-60"
                  )}
                >
                  {/* Step Number/Icon */}
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 mr-4 transition-all duration-300",
                    isActive && "border-primary-500 bg-primary-500 text-white",
                    isComplete && !isActive && "border-green-500 bg-green-500 text-white",
                    !isActive && !isComplete && "border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  )}>
                    {isComplete && !isActive ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 text-left">
                    <h3 className={cn(
                      "font-medium transition-colors duration-200",
                      isActive && "text-primary-600 dark:text-primary-400",
                      isComplete && !isActive && "text-green-600 dark:text-green-400",
                      !isActive && !isComplete && "text-gray-700 dark:text-gray-300"
                    )}>
                      Step {step.id}: {step.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {step.description}
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <div className="ml-4">
                    {isActive && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                    )}
                    {isComplete && !isActive && (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </motion.button>

                {/* Connector Line for Mobile */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center py-2">
                    <div className={cn(
                      "w-0.5 h-4 transition-colors duration-300",
                      currentStep > step.id 
                        ? "bg-primary-500" 
                        : "bg-gray-200 dark:bg-gray-700"
                    )} />
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden"
      >
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / steps.length) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </motion.div>
    </div>
  )
}
