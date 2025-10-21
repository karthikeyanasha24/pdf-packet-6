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
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  Bars3BottomLeftIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  Bars3Icon,
  TrashIcon,
  EyeIcon,
  ChevronUpIcon,
  ChevronDownIcon
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
  totalCount: number
  onRemove: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onPreview: (url: string) => void
}

function SortableItem({ document, index, totalCount, onRemove, onMoveUp, onMoveDown, onPreview }: SortableItemProps) {
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
        <div className="flex items-center gap-1">
          {/* Move Up Button */}
          <button
            onClick={() => onMoveUp(document.id)}
            disabled={index === 0}
            className={cn(
              "btn btn-ghost btn-sm p-2 transition-colors",
              index === 0 
                ? "opacity-30 cursor-not-allowed" 
                : "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            )}
            title="Move up"
          >
            <ChevronUpIcon className="w-4 h-4" />
          </button>

          {/* Move Down Button */}
          <button
            onClick={() => onMoveDown(document.id)}
            disabled={index === totalCount - 1}
            className={cn(
              "btn btn-ghost btn-sm p-2 transition-colors",
              index === totalCount - 1 
                ? "opacity-30 cursor-not-allowed" 
                : "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            )}
            title="Move down"
          >
            <ChevronDownIcon className="w-4 h-4" />
          </button>

          {/* Preview Button */}
          <button
            onClick={() => onPreview(document.document.url)}
            className="btn btn-ghost btn-sm p-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
            title="Preview document (opens in new tab)"
          >
            <EyeIcon className="w-4 h-4" />
          </button>

          {/* Remove Button */}
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
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before dragging starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Filter only selected documents and sort by order
  const sortedDocuments = selectedDocuments
    .filter(doc => doc.selected)
    .sort((a, b) => a.order - b.order)

  function handleDragEnd(event: any) {
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

      const unselectedDocs = selectedDocuments.filter(doc => !doc.selected)
      onUpdateSelectedDocuments([...updatedDocs, ...unselectedDocs])
    }
  }

  const removeDocument = (documentId: string) => {
    const updatedDocuments = selectedDocuments.map(doc =>
      doc.id === documentId ? { ...doc, selected: false } : doc
    )
    onUpdateSelectedDocuments(updatedDocuments)
  }

  // Move document up in order
  const moveDocumentUp = (documentId: string) => {
    const currentIndex = sortedDocuments.findIndex(doc => doc.id === documentId)
    if (currentIndex > 0) {
      const newDocuments = [...sortedDocuments]
      const [movedDoc] = newDocuments.splice(currentIndex, 1)
      newDocuments.splice(currentIndex - 1, 0, movedDoc)
      
      // Update orders
      const updatedDocuments = selectedDocuments.map(doc => {
        const newIndex = newDocuments.findIndex(newDoc => newDoc.id === doc.id)
        if (newIndex !== -1) {
          return { ...doc, order: newIndex + 1 }
        }
        return doc
      })
      onUpdateSelectedDocuments(updatedDocuments)
    }
  }

  // Move document down in order
  const moveDocumentDown = (documentId: string) => {
    const currentIndex = sortedDocuments.findIndex(doc => doc.id === documentId)
    if (currentIndex < sortedDocuments.length - 1) {
      const newDocuments = [...sortedDocuments]
      const [movedDoc] = newDocuments.splice(currentIndex, 1)
      newDocuments.splice(currentIndex + 1, 0, movedDoc)
      
      // Update orders
      const updatedDocuments = selectedDocuments.map(doc => {
        const newIndex = newDocuments.findIndex(newDoc => newDoc.id === doc.id)
        if (newIndex !== -1) {
          return { ...doc, order: newIndex + 1 }
        }
        return doc
      })
      onUpdateSelectedDocuments(updatedDocuments)
    }
  }

  // Preview document
  const previewDocument = (documentUrl: string) => {
    window.open(documentUrl, '_blank')
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
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Arrange Documents
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
            Drag and drop to reorder your selected documents. The order here will determine how they appear in your final PDF packet.
          </p>
          
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 max-w-3xl mx-auto">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to reorder documents:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800 dark:text-blue-200">
              <div className="flex items-center gap-2">
                <Bars3Icon className="w-4 h-4" />
                <span>Use the drag handle (⋮⋮⋮) to drag documents up or down</span>
              </div>
              <div className="flex items-center gap-2">
                <ChevronUpIcon className="w-4 h-4" />
                <ChevronDownIcon className="w-4 h-4" />
                <span>Click arrow buttons to move documents one position</span>
              </div>
              <div className="flex items-center gap-2">
                <EyeIcon className="w-4 h-4" />
                <span>Click the eye icon to preview documents in a new tab</span>
              </div>
              <div className="flex items-center gap-2">
                <TrashIcon className="w-4 h-4" />
                <span>Click the trash icon to remove a document</span>
              </div>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2 italic">
              Your cover page will always appear first, regardless of the order here.
            </p>
          </div>
        </div>

        {/* Document Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800"
        >
          <p className="text-primary-700 dark:text-primary-300 font-medium text-center">
            {sortedDocuments.length} document{sortedDocuments.length !== 1 ? 's' : ''} selected for your packet
          </p>
        </motion.div>

        {/* Document List */}
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
                      totalCount={sortedDocuments.length}
                      onRemove={removeDocument}
                      onMoveUp={moveDocumentUp}
                      onMoveDown={moveDocumentDown}
                      onPreview={previewDocument}
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
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bars3BottomLeftIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No documents selected
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Go back to the previous step to select documents for your packet.
            </p>
            <button
              onClick={onPrevious}
              className="btn btn-secondary"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Selection
            </button>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            onClick={onPrevious}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-secondary btn-lg"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Previous
          </motion.button>

          <motion.button
            onClick={onNext}
            disabled={!canProceed}
            whileHover={canProceed ? { scale: 1.02 } : {}}
            whileTap={canProceed ? { scale: 0.98 } : {}}
            className={cn(
              "btn btn-primary btn-lg",
              !canProceed && "opacity-50 cursor-not-allowed"
            )}
          >
            Generate Packet
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
