import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { 
  BuildingOfficeIcon, 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  CubeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/utils'
import type { ProjectFormData } from '@/types'

// Validation schema
const projectFormSchema = z.object({
  submittedTo: z.string().min(1, 'Company/Organization is required'),
  projectName: z.string().min(1, 'Project name is required'),
  projectNumber: z.string().optional(),
  preparedBy: z.string().min(1, 'Prepared by is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['Review', 'Approval', 'Record', 'Info Only']),
  product: z.string().min(1, 'Product selection is required'),
})

type ProjectFormValues = z.infer<typeof projectFormSchema>

interface ProjectFormProps {
  formData: Partial<ProjectFormData>
  onUpdateFormData: (data: Partial<ProjectFormData>) => void
  onNext: () => void
}

const statusOptions = ['Review', 'Approval', 'Record', 'Info Only'] as const
const productOptions = ['20mm MAXTERRA®', '25mm MAXTERRA®', '30mm MAXTERRA®', 'Custom Thickness'] as const

export default function ProjectForm({ 
  formData, 
  onUpdateFormData, 
  onNext 
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      submittedTo: formData.submittedTo || '',
      projectName: formData.projectName || '',
      projectNumber: formData.projectNumber || '',
      preparedBy: formData.preparedBy || '',
      email: formData.email || '',
      phone: formData.phone || '',
      date: formData.date || new Date().toISOString().split('T')[0],
      status: formData.status || 'Review',
      product: formData.product || '',
    },
    mode: 'onChange',
  })

  // Update parent state on form changes with proper dependency handling
  React.useEffect(() => {
    const subscription = watch((value) => {
      onUpdateFormData(value as Partial<ProjectFormData>)
    })
    return () => subscription.unsubscribe()
  }, [watch, onUpdateFormData])

  const onSubmit = (data: ProjectFormValues) => {
    onUpdateFormData(data)
    onNext()
  }

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } }
  }

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
            className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <DocumentTextIcon className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-3">
            Project Information
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Enter your project details to create a professional documentation packet. 
            All information will appear on the cover page of your generated PDF.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Company & Project Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Submitted To */}
            <motion.div
              variants={inputVariants}
              whileFocus="focus"
              className="space-y-2"
            >
              <label className="form-label flex items-center">
                <BuildingOfficeIcon className="w-4 h-4 mr-2 text-gray-500" />
                Submitted To *
              </label>
              <input
                {...register('submittedTo')}
                type="text"
                placeholder="Company or Organization Name"
                className={cn(
                  "form-input",
                  errors.submittedTo && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.submittedTo && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="form-error"
                >
                  {errors.submittedTo.message}
                </motion.p>
              )}
            </motion.div>

            {/* Project Name */}
            <motion.div
              variants={inputVariants}
              whileFocus="focus"
              className="space-y-2"
            >
              <label className="form-label flex items-center">
                <DocumentTextIcon className="w-4 h-4 mr-2 text-gray-500" />
                Project Name *
              </label>
              <input
                {...register('projectName')}
                type="text"
                placeholder="Enter project name"
                className={cn(
                  "form-input",
                  errors.projectName && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.projectName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="form-error"
                >
                  {errors.projectName.message}
                </motion.p>
              )}
            </motion.div>

            {/* Project Number */}
            <motion.div
              variants={inputVariants}
              whileFocus="focus"
              className="space-y-2"
            >
              <label className="form-label">
                Project Number
              </label>
              <input
                {...register('projectNumber')}
                type="text"
                placeholder="Optional project number"
                className="form-input"
              />
            </motion.div>

            {/* Prepared By */}
            <motion.div
              variants={inputVariants}
              whileFocus="focus"
              className="space-y-2"
            >
              <label className="form-label flex items-center">
                <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                Prepared By *
              </label>
              <input
                {...register('preparedBy')}
                type="text"
                placeholder="Your name"
                className={cn(
                  "form-input",
                  errors.preparedBy && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.preparedBy && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="form-error"
                >
                  {errors.preparedBy.message}
                </motion.p>
              )}
            </motion.div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email */}
            <motion.div
              variants={inputVariants}
              whileFocus="focus"
              className="space-y-2"
            >
              <label className="form-label flex items-center">
                <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-500" />
                Email Address *
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="your.email@company.com"
                className={cn(
                  "form-input",
                  errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="form-error"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </motion.div>

            {/* Phone */}
            <motion.div
              variants={inputVariants}
              whileFocus="focus"
              className="space-y-2"
            >
              <label className="form-label flex items-center">
                <PhoneIcon className="w-4 h-4 mr-2 text-gray-500" />
                Phone Number
              </label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="(555) 123-4567"
                className="form-input"
              />
            </motion.div>

            {/* Date */}
            <motion.div
              variants={inputVariants}
              whileFocus="focus"
              className="space-y-2"
            >
              <label className="form-label flex items-center">
                <CalendarDaysIcon className="w-4 h-4 mr-2 text-gray-500" />
                Date *
              </label>
              <input
                {...register('date')}
                type="date"
                className={cn(
                  "form-input",
                  errors.date && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.date && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="form-error"
                >
                  {errors.date.message}
                </motion.p>
              )}
            </motion.div>

            {/* Status */}
            <motion.div
              variants={inputVariants}
              whileFocus="focus"
              className="space-y-2"
            >
              <label className="form-label">
                Status *
              </label>
              <select
                {...register('status')}
                className={cn(
                  "form-input",
                  errors.status && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              >
                {statusOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.status && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="form-error"
                >
                  {errors.status.message}
                </motion.p>
              )}
            </motion.div>
          </div>

          {/* Product Selection */}
          <motion.div
            variants={inputVariants}
            whileFocus="focus"
            className="space-y-2"
          >
            <label className="form-label flex items-center">
              <CubeIcon className="w-4 h-4 mr-2 text-gray-500" />
              Product *
            </label>
            <select
              {...register('product')}
              className={cn(
                "form-input",
                errors.product && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
            >
              <option value="">Select a product</option>
              {productOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.product && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="form-error"
              >
                {errors.product.message}
              </motion.p>
            )}
          </motion.div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <motion.button
              type="submit"
              disabled={!isValid}
              whileHover={isValid ? { scale: 1.02 } : {}}
              whileTap={isValid ? { scale: 0.98 } : {}}
              className={cn(
                "btn btn-primary btn-lg",
                "min-w-48 shadow-lg hover:shadow-xl",
                !isValid && "opacity-50 cursor-not-allowed"
              )}
            >
              Continue to Documents
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
