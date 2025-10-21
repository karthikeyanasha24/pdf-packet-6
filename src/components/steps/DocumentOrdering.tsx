import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  Bars3BottomLeftIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  Bars3Icon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { cn, formatFileSize } from '@/utils'
import { documentTypeConfig } from '@/data/documents'
import type { SelectedDocument } from '@/types'

interface DocumentOrderingProps {
  selectedDocuments: SelectedDocument[]
  onUpdateSelectedDocuments: (documents: SelectedDocument[]) => void
  onNext: () => void
  onPrevious: () => void
}

interface SortableItemProps {
  document: SelectedDocument
  index: number
  onRemove: (id: string) => void
}

function SortableItem({ document, index, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: document.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const config = documentTypeConfig[document.document.type]

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl border-2 p-6 transition-all duration-200",
        isDragging 
          ? "border-primary-500 shadow-2xl scale-105 rotate-2 z-50" 
          : "border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-md"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Drag to reorder"
        >
          <Bars3Icon className="w-5 h-5 text-gray-400" />
        </button>

        {/* Order Number */}
        <div className="flex items-center justify-center w-8 h-8 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full font-semibold text-sm">
          {index + 1}
        </div>

        {/* Document Type Badge */}
        <div className={cn(
          "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
          `bg-${config.color}-100 text-${config.color}-700`,
          `dark:bg-${config.color}-900/20 dark:text-${config.color}-300`
        )}>
          <span className="mr-1">{config.icon}</span>
          {document.document.type}
        </div>

        {/* Document Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {document.document.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {document.document.description}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {formatFileSize(document.document.size || 0)} • PDF
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost btn-sm p-2"
            title="Preview document"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemove(document.id)}
            className="btn btn-ghost btn-sm p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Remove document"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function DocumentOrdering({
  selectedDocuments,
  onUpdateSelectedDocuments,
  onNext,
  onPrevious,
}: DocumentOrderingProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Filter only selected documents and sort by order
  const sortedDocuments = selectedDocuments
    .filter(doc => doc.selected)
    .sort((a, b) => a.order - b.order)

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = sortedDocuments.findIndex(doc => doc.id === active.id)
      const newIndex = sortedDocuments.findIndex(doc => doc.id === over.id)

      const reorderedDocs = arrayMove(sortedDocuments, oldIndex, newIndex)
      
      // Update order property
      const updatedDocs = reorderedDocs.map((doc, index) => ({
        ...doc,
        order: index
      }))

      // Merge with unselected documents
      const unselectedDocs = selectedDocuments.filter(doc => !doc.selected)
      onUpdateSelectedDocuments([...updatedDocs, ...unselectedDocs])
    }
  }

  const handleRemoveDocument = (documentId: string) => {
    const updatedDocs = selectedDocuments.filter(doc => doc.id !== documentId)
    onUpdateSelectedDocuments(updatedDocs)
  }

  const canProceed = sortedDocuments.length > 0

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
            className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <Bars3BottomLeftIcon className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-3">
            Arrange Documents
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Drag and drop to reorder your selected documents. The order here will determine 
            how they appear in your final PDF packet.
          </p>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-start gap-3">
            <Bars3Icon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                How to reorder documents:
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Use the drag handle (⋮⋮⋮) to drag documents up or down</li>
                <li>• The numbers show the current order in your packet</li>
                <li>• Click the trash icon to remove a document</li>
                <li>• Your cover page will always appear first</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Document Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800"
        >
          <p className="text-primary-700 dark:text-primary-300 font-medium">
            {sortedDocuments.length} document{sortedDocuments.length !== 1 ? 's' : ''} in your packet
            {sortedDocuments.length > 0 && (
              <span className="ml-2 text-sm text-primary-600 dark:text-primary-400">
                • Ready to generate PDF
              </span>
            )}
          </p>
        </motion.div>

        {/* Documents List */}
        {sortedDocuments.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedDocuments.map(doc => doc.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4 mb-8">
                <AnimatePresence>
                  {sortedDocuments.map((document, index) => (
                    <SortableItem
                      key={document.id}
                      document={document}
                      index={index}
                      onRemove={handleRemoveDocument}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Bars3BottomLeftIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No documents selected
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Go back to the previous step to select documents for your packet.
            </p>
            <button
              onClick={onPrevious}
              className="btn btn-primary btn-md"
            >
              Select Documents
            </button>
          </motion.div>
        )}

        {/* Navigation */}
        {sortedDocuments.length > 0 && (
          <div className="flex justify-between pt-8 border-t border-gray-200 dark:border-gray-700">
            <motion.button
              onClick={onPrevious}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-outline btn-lg"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Selection
            </motion.button>

            <motion.button
              onClick={onNext}
              disabled={!canProceed}
              whileHover={canProceed ? { scale: 1.02 } : {}}
              whileTap={canProceed ? { scale: 0.98 } : {}}
              className={cn(
                "btn btn-primary btn-lg min-w-48",
                !canProceed && "opacity-50 cursor-not-allowed"
              )}
            >
              Generate Packet
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
